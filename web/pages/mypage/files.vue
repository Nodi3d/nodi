<template>
  <div class="mypage">
    <div class="container d-flex flex-row">
      <MypageMenu />
      <div class="flex-auto pt-6 px-2">
        <form class="d-flex flex-items-center flex-justify-center">
          <input
            id="query"
            v-model="query"
            class="border border-gray-light px-2 py-1"
            type="text"
            name="query"
            placeholder="Search..."
            @keydown.enter.prevent.stop=""
            @keyup.enter.prevent.stop=""
          >
          <div class="sorter">
            <label for="sort" class="mr-2 text-normal">Sort</label>
            <select
              id="sort"
              v-model="sort"
              class="px-1 border-gray-light"
              name="sort"
              :disabled="query.length > 0"
              @change="onSorting"
            >
              <option v-for="(k, v) in sortings" :key="k" :value="v" v-text="k" />
            </select>
          </div>
        </form>
        <Pager class="mt-4 mb-2 p-2" :page="page" :last="last" @prev="prev" @next="next" />
        <Files
          :is-loading="isLoading"
          :selected="selected"
          :projects="projects"
          @click="onClick"
          @dblclick="onDblClick"
          @contextmenu="onContextMenu"
        />
        <Pager class="mt-2 mb-6 p-2" :page="page" :last="last" @prev="prev" @next="next" />
      </div>
    </div>
    <FileContextTooltip
      ref="FileContextTooltip"
      :editable="true"
      @open="onOpen"
      @openinnewtab="onOpenInNewTab"
      @copylink="onCopyLink"
      @duplicate="onDuplicate"
      @delete="onDelete"
    />
  </div>
</template>

<script lang='ts'>

import firebase from 'firebase/compat';
import _ from 'lodash';
import { Vector2 } from 'three';
import { Component, Vue, Watch } from 'nuxt-property-decorator';

import Spinner from '~/components/misc/Spinner.vue';
import Files from '~/components/common/Files.vue';
import Pager from '~/components/common/Pager.vue';
import MypageMenu from '~/components/common/MypageMenu.vue';
import FileContextTooltip from '~/components/misc/FileContextTooltip.vue';
import { UserState } from '~/store/user';
import { Sortings } from '~/assets/scripts/service/Sortings';
import Project, { ProjectJSONType } from '~/assets/scripts/service/Project';

@Component({
  components: {
    Spinner,
    Files,
    Pager,
    FileContextTooltip,
    MypageMenu
  }
})
export default class FilesPage extends Vue {
  $refs!: {
    FileContextTooltip: FileContextTooltip;
  };

  isLoading: boolean = false;
  query: string = '';
  sortings: any = Sortings;
  sort: any = Object.keys(Sortings)[0];

  count: number = 0;
  size: number = 24;
  page: number = 0;
  pages: { [index: number]: { startAt: Project } } = {};
  first: boolean = true;
  last: boolean = false;

  projects: Project[] = [];
  selected: Project | null = null;

  searchDebounced!: _.DebouncedFunc<any>;
  unsubscriber?: firebase.Unsubscribe;

  get user (): UserState {
    return this.$accessor.user;
  }

  mounted (): void {
    this.searchDebounced = _.debounce(this.search, 500);
    this.unsubscriber = this.$auth.onAuthStateChanged(async (u: any | null) => {
      if (u !== null) {
        await this.search('', u.uid);
      }
    });
  }

  beforeDestroy (): void {
    if (this.unsubscriber !== undefined) { this.unsubscriber(); }
  }

  @Watch('query')
  onQuery () {
    this.page = 0;
    this.clear();
    this.searchDebounced(this.query, this.user.uid as string, true);
  }

  async search (q: string, uid: string, forward: boolean = true): Promise<void> {
    this.isLoading = true;

    let query: firebase.firestore.Query;

    // MEMO:
    // Due to firestore limitations,
    // title query and sort by timestamp cannot coexist.
    if (q.length > 0) {
      let startAt = q;
      const endAt = q + '\uF8FF';

      if (this.projects.length > 0) {
        if (forward) {
          const proj = this.projects[this.projects.length - 1];
          startAt = proj.title;
          this.pages[this.page] = {
            startAt: proj
          };
        } else if (!forward && this.page > 0) {
          const page = this.pages[this.page];
          startAt = page.startAt.title;
        }
      }
      query = this.$firestore.collection('graph')
        .where('uid', '==', uid)
        .where('deleted', '==', false)
        .orderBy('title')
        .startAt(startAt)
        .endAt(endAt);
    } else {
      const desc = (Object.keys(Sortings)[0] === this.sort);
      query = this.$firestore.collection('graph')
        .where('uid', '==', uid)
        .where('deleted', '==', false)
        .orderBy('timestamp', desc ? 'desc' : 'asc');
      if (this.projects.length > 0) {
        if (forward) {
          const proj = this.projects[this.projects.length - 1];
          const t = new Date(1970, 0, 1);
          t.setSeconds(proj.timestamp.seconds);
          query = query.startAt(t);
          this.pages[this.page] = {
            startAt: proj
          };
        } else if (!forward && this.page > 0) {
          const page = this.pages[this.page];
          const startAt = new Date(1970, 0, 1);
          startAt.setSeconds(page.startAt.timestamp.seconds - 1);
          query = query.startAt(startAt);
        }
      }
    }

    this.clear();

    const result = await query.limit(this.size).get();
    const projects = result.docs.map((doc) => {
      const id = doc.ref.id;
      const data = doc.data();
      const graph = new Project();
      graph.fromJSON(id, data as ProjectJSONType);
      return graph;
    });

    this.projects = projects;
    this.last = this.projects.length < this.size;

    this.isLoading = false;
  }

  clear () {
    this.unselect();
    this.projects = [];
  }

  select (proj: Project) {
    this.unselect();
    this.selected = proj;
  }

  unselect () {
    this.selected = null;
  }

  copyToClipboard (text: string) {
    const textarea = document.createElement('textarea');
    textarea.textContent = text;

    const body = document.body;
    body.appendChild(textarea);

    textarea.select();

    const result = document.execCommand('copy');
    body.removeChild(textarea);

    return result;
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

  getEditorPath (proj: Project): string {
    return this.$router.resolve(`/editor/${proj.id}`).href;
  }

  getEditorUrl (proj: Project): string {
    const path = this.getEditorPath(proj);
    return `${window.location.origin}${path}`;
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

  async onDuplicate () {
    if (this.selected !== null) {
      this.isLoading = true;
      const id = this.selected.id;
      try {
        const proj = await this.$duplicateProject(id);
        this.projects.unshift(proj);
      } finally {
        this.isLoading = false;
      }
    }
  }

  async onDelete () {
    if (this.selected !== null) {
      if (window.confirm(`Are you sure to delete ${this.selected.title} ?`)) {
        this.isLoading = true;
        const id = this.selected.id;
        try {
          await this.$deleteProject(id);
          const idx = this.projects.findIndex(p => p.id === id);
          if (idx >= 0) {
            this.projects.splice(idx, 1);
          }
        } finally {
          this.selected = null;
          this.isLoading = false;
        }
      }
    }
  }

  onSorting (): void {
    this.page = 0;
    this.pages = {};
    this.searchDebounced(this.query, this.user.uid as string, false);
  }

  prev (): void {
    this.page--;
    this.searchDebounced(this.query, this.user.uid as string, false);
  }

  next (): void {
    this.page++;
    this.searchDebounced(this.query, this.user.uid as string, true);
    window.scrollTo(0, 0);
  }
}

</script>

<style lang="scss" scoped>

@import '~/assets/styles/foundations/common';

.container {
  form {
    input, select {
      height: 30px;
    }
  }
}

@include min-screen($breakpoint-size) {

  .container {
    form {
      input {
        display: inline-block;
        width: 300px;
        margin-right: 30px;
      }
      margin-bottom: 20px;
    }
  }

}

@include max-screen($breakpoint-size) {

  .container {
    width: 100%;

    form {
      display: block;
      flex-wrap: wrap;
      padding: 40px;

      input {
        flex-basis: 100%;
        display: block;
        width: 100%;
        margin-bottom: 10px;
      }

      .sorter {
        display: block;
        width: 100%;
        text-align: right;
      }
    }
  }

}

</style>
