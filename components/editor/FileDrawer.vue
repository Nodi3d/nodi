<template>
  <div
    ref="Root"
    class="drawer"
    :class="{ visible: isVisible }"
  >
    <template v-if="isSignIn">
      <div v-show="isLoading" class="loading">
        <Spinner />
      </div>
      <div v-if="!isLoading && graphs.length <= 0" class="not-found">
        <span>No data found</span>
      </div>
      <ul v-show="!isLoading">
        <li
          v-for="(graph, idx) in graphs"
          :key="idx"
          :class="{ selected: selected === graph.id }"
        >
          <div
            class="graph"
            :style="{ backgroundImage: 'url(' + graph.imageUrl + ')'}"
          >
            <ul class="op">
              <li>
                <a href="" @click.prevent="onCopy(graph)">Copy</a>
              </li>
              <li>
                <a href="" @click.prevent="onLoad(graph)">Load</a>
              </li>
            </ul>
            <span class="title">{{ graph.title }}</span>
            <div v-show="isPrivate(graph)" class="private" v-html="svg.lock" />
          </div>
        </li>
      </ul>
    </template>
    <template v-else>
      <a class="button no-underline" @click.prevent="signIn">Sign in</a>
    </template>
  </div>
</template>

<script lang='ts'>

import octicons from '@primer/octicons';
import { Component, Prop, Vue } from 'nuxt-property-decorator';

import { Permission } from '~/assets/scripts/service/Permission';
import Spinner from '~/components/misc/Spinner.vue';

import Project, { ProjectJSONType } from '~/assets/scripts/service/Project';
import { UserState } from '~/store/user';

@Component({
  components: {
    Spinner
  }
})
export default class FileDrawer extends Vue {
  $refs!: {
    Root: HTMLDivElement;
  };

  @Prop({ type: String, default: '' })
  selected!: String;

  isVisible: boolean = false;
  isLoading: boolean = false;
  graphs: Project[] = [];
  svg = {
    lock: octicons.lock.toSVG({
      stroke: '#fff'
    })
  };

  get isSignIn (): boolean {
    return this.$accessor.user.uid !== undefined;
  }

  get user (): UserState {
    return this.$accessor.user;
  }

  mounted (): void {
    document.addEventListener('click', this.outside);
  }

  beforeDestroy (): void {
    document.removeEventListener('click', this.outside);
  }

  outside (e: MouseEvent) {
    if (this.isVisible) {
      const path = this.getPath(e);
      if (!path.includes(this.$refs.Root)) {
        this.hide();
      }
    }
  }

  getPath (e: MouseEvent): EventTarget[] {
    return e.composedPath();
  }

  show (): void {
    this.update();
    this.isVisible = true;
    this.$emit('hidden', this.isVisible);
  }

  hide (): void {
    this.isVisible = false;
    this.$emit('hidden', this.isVisible);
  }

  clear () {
    this.graphs = [];
  }

  private async update (): Promise<void> {
    if (this.isSignIn) {
      this.isLoading = true;
      await this.list();
      this.isLoading = false;
    }
  }

  isPrivate (graph: Project): boolean {
    return graph.permission === Permission.PRIVATE;
  }

  onCopy (graph: Project): void {
    this.$emit('copy', graph);
  }

  onLoad (graph: Project): void {
    this.$emit('load', graph);
  }

  signIn (): void {
    this.$accessor.user.signIn();
    this.hide();
  }

  async list (limit = 16, orderBy: 'asc' | 'desc' = 'desc'): Promise<Project[]> {
    const query = this.$firestore.collection('graph')
      .where('uid', '==', this.user.uid)
      .where('deleted', '==', false)
      .orderBy('timestamp', orderBy)
      .limit(limit);

    const result = await query.get();
    const graphs = result.docs.map((doc) => {
      const id = doc.ref.id;
      const data = doc.data();
      const graph = new Project();
      graph.fromJSON(id, data as ProjectJSONType);
      return graph;
    });

    this.graphs = graphs;

    return Promise.resolve(graphs);
  }
}

</script>

<style lang="scss" scoped>

@import '~/assets/styles/foundations/common';

.drawer {
  position: fixed;
  z-index: 10;

  display: block;

  border: 1px solid #ccc;
  border-bottom: 0px;

  background-color: #fff;

  height: calc(100% - 56px);
  overflow-y: auto;

  width: 280px;

  transform: translate(-320px, 0px);
  transition: all 300ms 0s ease;

  &.visible {
    transform: translate(0px, 0px);
  }

  .button {
    @include noselect();
    display: block;
    margin-top: 24px;
    margin-left: auto;
    margin-right: auto;

    width: 120px;
    height: 32px;
    line-height: 32px;

    font-size: 0.9rem;
    border: 1px solid #ccc;
    color: #111;
    @include border-radius(32px);
    text-align: center;

    cursor: pointer;

    &:hover {
      color: #333;
      background-color: #f0f0f0;
    }
  }

  .loading {
    width: 100%;
    height: 150px;
    line-height: 150px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 30px;

    .spinner {
      color: #555;
    }
  }

  .not-found {
    span {
      font-size: 1rem;
      display: inline-block;
      padding: 8px;
    }
  }

  ul, li {
    list-style: none;
  }

  & > ul {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    width: 100%;

    & > li {
      width: 50%;
      height: 140px;
      box-sizing: border-box;

      display: flex;
      justify-content: center;
      align-items: center;

      border: 1px solid #ddd;
      border-top: 0px;
      border-left: 0px;

      &:nth-child(even) {
        border-right: 0px;
      }

      &.selected {
        background-color: #f0f0f0;
      }

    }
  }

  .graph {
    width: 90%;
    height: 90%;
    position: relative;

    background-color: #fff;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;

    span.title {
      position: absolute;
      @include noselect();
      font-size: 0.75rem;
      display: block;
      left: 0;
      right: 0;
      bottom: 0px;
      margin: auto;
      text-align: center;
    }

    .private {
      position: absolute;
      display: block;
      top: 2px;
      right: 2px;

      svg {
        fill: #666;
        color: #666;
        stroke: #666;
        height: 16px;
      }
    }

    ul.op {
      position: relative;
      display: inline-block;

      li {
        display: block;

        a {
          display: inline-block;
          font-size: 0.7rem;
          text-decoration: none;
          color: #111;
          background-color: transparent;
          border: 1px solid #111;

          width: 40px;
          padding: 4px 4px;
          text-align: center;
          border-radius: 4px;
          margin-bottom: 5px;

          &:hover {
            background-color: #f0f0f0;
          }
        }
      }
    }

  }
}

</style>
