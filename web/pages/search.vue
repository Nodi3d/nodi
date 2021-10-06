<template>
  <div class="example">
    <div class="container p-4">
      <div class="search-container mt-6">
        <form class="d-flex flex-items-center flex-justify-center">
          <input
            id="query"
            v-model="query"
            class="mr-5 px-2 py-1 border border-gray rounded-1"
            style="height: 30px; border-style: solid;"
            :style="{ width: '300px' }"
            type="text"
            name="query"
            placeholder="Search..."
            :disabled="!isReady"
            @keydown.enter.prevent.stop=""
            @keyup.enter.prevent.stop=""
          >
          <div class="sorter">
            <label class="mr-2" for="sort">Sort</label>
            <select id="sort" v-model="sort" name="sort" class="px-2 py-1 border border-gray rounded-1" style="height: 30px;">
              <option v-for="(k, v) in sortings" :key="k" :value="v" v-text="k" />
            </select>
          </div>
        </form>
        <div class="search-tabs mt-4">
          <ul class="d-flex flex-justify-center">
            <li v-for="(tab, key) in tabs" :key="key">
              <a class="px-4 py-2 mr-2 no-underline" :class="{ selected: tab.selected }" @click="onTab(tab)">
                {{ tab.label }}
                <span class="color-text-gray">({{ tab.count }})</span>
              </a>
            </li>
          </ul>
        </div>
        <Files
          v-show="tabs.public.selected"
          :is-loading="isLoading"
          :projects="projects"
          @click="onClick"
          @dblclick="onDblClick"
          @contextmenu="onContextMenu"
        />
        <Nodes
          v-show="tabs.nodes.selected"
          :nodes="nodes"
        />
      </div>
    </div>
    <FileContextTooltip
      ref="FileContextTooltip"
      :editable="false"
      @open="onOpen"
      @openinnewtab="onOpenInNewTab"
      @copylink="onCopyLink"
    />
  </div>
</template>

<script lang='ts'>

import axios from 'axios';
import { Component, Vue, Watch } from 'nuxt-property-decorator';

import { Vector2 } from 'three';
import _ from 'lodash';
import { NodeDictionary } from '@nodi/core';

import Files from '~/components/common/Files.vue';
import Nodes from '~/components/common/Nodes.vue';
import Pager from '~/components/common/Pager.vue';
import Spinner from '~/components/misc/Spinner.vue';
import FileContextTooltip from '~/components/misc/FileContextTooltip.vue';

import Project, { ProjectJSONType } from '~/assets/scripts/service/Project';
import { Permission } from '~/assets/scripts/service/Permission';
const NodeNames = Object.values(NodeDictionary).map(v => v.name);

const Sortings = Object.freeze({
  DateDescending: 'Recently updated',
  DateAscending: 'Least recently updated'
});

class Tab {
  label: string;
  count: number;
  selected: boolean = false;
  constructor (label: string, selected: boolean = false) {
    this.label = label;
    this.count = 0;
    this.selected = selected;
  }

  public select (): void {
    this.selected = true;
  }

  public unselect (): void {
    this.selected = false;
  }
}

@Component({
  components: {
    Files,
    Nodes,
    Pager,
    Spinner,
    FileContextTooltip
  }
})
export default class SearchPage extends Vue {
  $refs!: {
    FileContextTooltip: FileContextTooltip;
  };

  isReady: boolean = true;
  isLoading: boolean = false;
  query: string = '';
  sort: string = Object.keys(Sortings)[0];
  sortings: { [index: string]: string } = Sortings;
  count: number = 0;
  size: number = 24;
  page: number = 0;
  pages: { [index: number]: { startAt: Project } } = {};
  first: boolean = true;
  last: boolean = false;

  tabs: { [index: string]: Tab } = {
    public: new Tab('Public', true),
    nodes: new Tab('Nodes')
  };

  projects: Project[] = [];
  selected: Project | null = null;
  searchDebounced!: _.DebouncedFunc<any>;
  nodes: string[] = [];

  mounted () {
    this.searchDebounced = _.debounce(this.search, 500);
    this.refresh();
  }

  @Watch('query')
  onQuery (q: string) {
    this.page = 0;
    this.searchDebounced(q);
  }

  @Watch('sort')
  onSort () {
    this.searchDebounced(this.query);
  }

  refresh () {
    let query = this.query;
    let page = this.page;

    const parameters = location.search.split(/[?&]/);
    parameters.forEach((param) => {
      const pair = param.split('=');
      if (pair.length === 2) {
        const key = pair[0];
        const value = pair[1];
        switch (key) {
          case 'q': {
            query = decodeURI(value);
            break;
          }
          case 'page': {
            page = parseInt(value);
            break;
          }
        }
      }
    });

    if ((this.query !== query || this.page !== page) && query.length > 0) {
      this.query = query;
      this.searchDebounced(query);
    }
  }

  async search (q: string): Promise<void> {
    const desc = (Object.keys(Sortings)[0] === this.sort);
    this.$router.replace(`/search?q=${q}&sort=${(desc ? 'desc' : 'asc')}`, () => {}, () => {});

    this.isLoading = true;
    this.searchNodes(q);
    await this.searchProjects(q, desc);
    this.isLoading = false;
  }

  async searchProjects (q: string, desc: boolean) {
    const query = this.$firestore.collection('graph')
      .where('deleted', '==', false)
      .where('permission', '>=', Permission.PUBLIC_READ)
      .orderBy('permission')
      .orderBy('title')
      .orderBy('timestamp', desc ? 'desc' : 'asc')
      .startAt(Permission.PUBLIC_READ, q)
      .endAt(Permission.PUBLIC_READ, q + '\uF8FF')
      .limit(this.size)
      ;
    this.clear();

    const result = await query.get();
    const projects = result.docs.map((doc) => {
      const id = doc.ref.id;
      const data = doc.data();
      const graph = new Project();
      graph.fromJSON(id, data as ProjectJSONType);
      return graph;
    });

    this.projects = projects;
    this.last = this.projects.length < this.size;
    this.tabs.public.count = this.projects.length;
  }

  searchNodes (query: string) {
    const q = query.toLowerCase();
    this.nodes = NodeNames.filter(n => n.toLowerCase().includes(q));
    this.tabs.nodes.count = this.nodes.length;
  }

  onTab (tab: Tab): void {
    for (const k in this.tabs) {
      this.tabs[k].unselect();
    }
    tab.select();
  }

  async onCopy (proj: Project): Promise<void> {
    const { data } = await axios.get(proj.jsonUrl);
    window.navigator.clipboard.writeText(JSON.stringify(data.nodes));
  }

  clear () {
    this.unselect();
    this.projects = [];
  }

  select (proj: Project): void {
    this.unselect();
    this.selected = proj;
  }

  unselect (): void {
    this.selected = null;
  }

  copyToClipboard (text: string): boolean {
    const textarea = document.createElement('textarea');
    textarea.textContent = text;

    const body = document.body;
    body.appendChild(textarea);

    textarea.select();

    const result = document.execCommand('copy');
    body.removeChild(textarea);

    return result;
  }

  getEditorPath (proj: Project): string {
    return this.$router.resolve(`/editor/${proj.id}`).href;
  }

  getEditorUrl (proj: Project): string {
    const path = this.getEditorPath(proj);
    return `${window.location.origin}${path}`;
  }

  onClick (_e: MouseEvent, proj: Project) {
    this.select(proj);
    this.$refs.FileContextTooltip.hide();
  }

  onDblClick (_e: MouseEvent, graph: Project) {
    this.select(graph);
    this.$refs.FileContextTooltip.hide();

    this.onOpen();
  }

  onContextMenu (e: MouseEvent, graph: Project) {
    this.select(graph);
    const x = e.pageX;
    const y = e.pageY;
    this.$refs.FileContextTooltip.show(new Vector2(x, y));
  }

  onOpen () {
    if (this.selected !== null) {
      this.$router.push(this.getEditorPath(this.selected));
    }
  }

  onOpenInNewTab () {
    if (this.selected !== null) {
      window.open(this.getEditorUrl(this.selected), '_blank');
    }
  }

  onCopyLink () {
    if (this.selected !== null) {
      const url = this.getEditorUrl(this.selected);
      this.copyToClipboard(url);
    }
  }
}

</script>

<style lang="scss" scoped>

.thumbnail {
  width: 320px;
  height: 180px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}

a {
  padding: 10px 16px;
  font-size: 1.0rem;
  color: #333;
  border-bottom: 1px solid #ccc;

  cursor: pointer;

  &:hover, &.selected {
    border-bottom: 1px solid #3da6ec;
  }

  &.selected {
    pointer-events: none;
  }

  span.counter {
    font-size: 0.9rem;
    color: #555;
  }
}

</style>
