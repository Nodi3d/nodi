<template>
  <div ref="Root" class="nodi-viewer" :style="{ width: width }">
    <Axis v-show="viewable" ref="Axis" @click="onViewDirection" />
    <ul v-show="uiItemsSize > 0" class="ui dark-theme-color no-select">
      <li class="toggle--open-close px-2 py-2 d-flex flex-items-center" @click.prevent.stop="openGUI = !openGUI">
        <i v-show="!openGUI" class="" v-html="svg.triangleOpen" />
        <i v-show="openGUI" class="" v-html="svg.triangleClose" />
        <span class="ml-2 pr-8 user-select-none" v-text="openGUI ? 'Close' : 'Open'" />
      </li>
      <li v-show="openGUI">
        <ul ref="GUIList" class="py-1" />
      </li>
    </ul>
    <ul v-show="viewable" class="information position-absolute p-3 no-select">
      <li>
        <ul class="">
          <li>
            <span class="text-mono f5 mr-1">X</span>
            <span class="text-mono f5" v-text="boundingBox.x" />
          </li>
          <li>
            <span class="text-mono f5 mr-1">Y</span>
            <span class="text-mono f5" v-text="boundingBox.y" />
          </li>
          <li>
            <span class="text-mono f5 mr-1">Z</span>
            <span class="text-mono f5" v-text="boundingBox.z" />
          </li>
        </ul>
      </li>
    </ul>
    <ul v-show="viewable" class="operators position-absolute p-3 no-select">
      <li v-show="hasFrep" class="rendering ml-2">
        <select v-model="operators.quality" class="form-select" title="frep rendering quality" @change="onRenderingQuality">
          <option v-for="(value, key) in qualities" :key="key" :value="value" v-text="key" />
        </select>
      </li>
      <li class="rendering ml-2">
        <select v-model="operators.rendering" class="form-select" title="switch rendering mode" @change="onRenderingMode">
          <option v-for="(opt, index) in renderings" :key="index" :value="index" v-text="opt" />
        </select>
      </li>
      <li class="ml-2">
        <a title="toggle grid" :class="{ active: !operators.grid }" @click.prevent.stop="toggleGrid" v-html="svg.squareGrid" />
      </li>
      <li class="ml-1">
        <a title="toggle bounding box" :class="{ active: !operators.boundingBox }" @click.prevent.stop="toggleBoundingBox" v-html="svg.threed" />
      </li>
      <li class="ml-2">
        <a title="reset viewer camera" class="fixed-indicator" @click.prevent.stop="resetViewerCamera" v-html="svg.pin" />
      </li>
      <li class="ml-2">
        <a title="toggle fullscreen" :class="{ active: !operators.fullscreen }" @click.prevent.stop="toggleFullscreen" v-html="svg.fullscreen" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">

import { Prop, Component, Vue } from 'nuxt-property-decorator';
import octicons from '@primer/octicons';
import { Vector3 } from 'three';

import Axis from './Axis.vue';
import UIListItem from './UIListItem.vue';

import NodeBase from '~/assets/scripts/core/nodes/NodeBase';

import Viewer from '~/assets/scripts/viewer/Viewer';
import { FrepRenderingQuality } from '~/assets/scripts/viewer/misc/FrepRenderingQuality';
import { RenderingMode } from '~/assets/scripts/viewer/misc/RenderingMode';
import UINodeBase from '~/assets/scripts/core/nodes/params/ui/UINodeBase';
import IDisposable from '~/assets/scripts/core/misc/IDisposable';

let viewer: Viewer;

@Component({
  components: {
    Axis
  }
})
export default class ViewerComponent extends Vue {
  $refs!: {
    Root: HTMLDivElement;
    Axis: Axis;
    GUIList: HTMLUListElement;
  };

  svg = {
    squareGrid: octicons.grabber.toSVG({ width: 22 }),
    threed: octicons.package.toSVG({ width: 22 }),
    pin: octicons.pin.toSVG({ width: 22 }),
    fullscreen: octicons['screen-full'].toSVG({ width: 22 }),
    triangleOpen: octicons['triangle-right'].toSVG({ width: 18, height: 18 }),
    triangleClose: octicons['triangle-down'].toSVG({ width: 18, height: 18 })
  };

  viewable: boolean = true;
  boundingBox: Vector3 = new Vector3();
  hasFrep: boolean = false;
  operators = {
    quality: FrepRenderingQuality.Normal,
    rendering: RenderingMode.Standard,
    grid: true,
    boundingBox: false,
    fullscreen: false
  };

  qualities = {};
  renderings = Object.values(RenderingMode).filter(k => typeof (k) === 'string');
  openGUI: boolean = false;
  uiItems: UIListItem[] = [];
  uiListeners: IDisposable[] = [];

  get uiItemsSize (): number {
    return this.uiItems.length;
  }

  @Prop({ type: String, required: true })
  width!: string;

  @Prop({ type: Boolean, required: false, default: false })
  editor!: boolean;

  mounted (): void {
    viewer = new Viewer(this.$refs.Root);
    viewer.onViewChanged.on((camera) => {
      this.$refs.Axis.update(camera);
    });
    viewer.onBoundingBoxChanged.on((size) => {
      this.boundingBox.copy(size);
    });
    viewer.setRenderingMode(this.operators.rendering);
    viewer.setGrid(this.operators.grid);
    viewer.setBoundingBox(this.operators.boundingBox);
    this.$refs.Axis.update(viewer.camera);
  }

  destroy (): void {
    this.clear();
  }

  private clearListeners (): void {
    this.uiListeners.forEach(l => l.dispose());
    this.uiListeners = [];
  }

  clear () {
    this.clearListeners();
    this.uiItems.forEach((i) => {
      this.$refs.GUIList.removeChild(i.$el);
      i.$destroy();
    });
    this.uiItems = [];
  }

  update (nodes: NodeBase[]): void {
    viewer.update(nodes.filter(node => !(node instanceof UINodeBase)));

    this.clearListeners();
    const UIs: UINodeBase[] = nodes.filter(node => (node instanceof UINodeBase) && node.enabled) as UINodeBase[];

    // eslint-disable-next-line prefer-const
    let prev = UIs.map(ui => ui.visible);
    this.uiListeners = UIs.map((ui, i) => {
      const f = ({ node }: { node: NodeBase }) => {
        if (prev[i] !== node.visible) {
          this.updateUI(UIs.filter(ui => ui.visible));
          prev[i] = node.visible;
        }
      };
      const listener = ui.onStateChanged.on(f);
      return listener;
    });
    this.updateUI(UIs.filter(ui => ui.visible));
  }

  private updateUI (UIs: UINodeBase[]): void {
    UIs.sort((a: UINodeBase, b: UINodeBase) => {
      const oa = a.getOrder();
      const ob = b.getOrder();
      if (oa < ob) { return -1; } else if (oa === ob) { return 0; }
      return 1;
    });

    // Remove unused gui
    this.uiItems.filter((i) => {
      return !UIs.some(n => n.uuid === i.getUUID());
    }).forEach((i) => {
      this.$refs.GUIList.removeChild(i.$el);
      i.$destroy();
      const index = this.uiItems.indexOf(i);
      if (index >= 0) {
        this.uiItems.splice(index, 1);
      }
    });

    const length = UIs.length;
    let hasDiffOrder = false;
    UIs.forEach((ui, order) => {
      hasDiffOrder = hasDiffOrder || (ui.getOrder() !== order);
      ui.setOrder(order);

      const found = this.uiItems.find(vue => vue.getUUID() === ui.uuid);
      if (found !== undefined) {
        found.length = length;
        found.order = order;
        return;
      }

      const div = document.createElement('div');
      div.style.width = '100%';
      div.classList.add('d-inline-flex');
      div.classList.add('flex-items-center');
      ui.setupGUIElement(div);
      const constructor = Vue.extend(UIListItem);
      const instance = new constructor({
        key: ui.uuid,
        propsData: {
          editor: this.editor,
          order,
          length
        }
      }) as UIListItem;
      instance.$mount();
      instance.setup(ui.uuid, div);

      instance.$on('change', (newOrder: number) => {
        ui.setOrder(newOrder);
      });
      instance.$on('up', () => {
        const index = this.uiItems.indexOf(instance);
        this.uiItems.splice(index, 1);
        this.uiItems.splice(index - 1, 0, instance);
        this.sortUIItems(this.uiItems);
      });
      instance.$on('down', () => {
        const index = this.uiItems.indexOf(instance);
        this.uiItems.splice(index, 1);
        this.uiItems.splice(index + 1, 0, instance);
        this.sortUIItems(this.uiItems);
      });
      this.uiItems.push(instance);
      this.$refs.GUIList.appendChild(instance.$el);
    });

    if (hasDiffOrder) {
      this.sortUIItems(this.uiItems);
    }
  }

  private sortUIItems (items: UIListItem[]): void {
    items.forEach((item) => {
      if (item.$el.parentElement !== null) {
        this.$refs.GUIList.removeChild(item.$el);
      }
    });

    const length = items.length;
    items.forEach((item, order) => {
      const props = item.$props;
      props.length = length;
      props.order = order;
      this.$refs.GUIList.appendChild(item.$el);
    });
  }

  onRenderingQuality () {
    // viewer.setRenderingQuality(this.operators.quality)
  }

  onRenderingMode () {
    viewer.setRenderingMode(this.operators.rendering);
  }

  toggleGrid () {
    this.operators.grid = !this.operators.grid;
    viewer.setGrid(this.operators.grid);
  }

  toggleBoundingBox () {
    this.operators.boundingBox = !this.operators.boundingBox;
    viewer.setBoundingBox(this.operators.boundingBox);
  }

  toggleFullscreen () {
    this.operators.fullscreen = viewer.toggleFullscreen();
  }

  resetViewerCamera () {
    viewer.resetCamera();
  }

  onViewDirection (direction: Vector3) {
    viewer.setCameraDirection(direction);
  }

  public capture (): Blob | undefined {
    return viewer.capture();
  }
}

</script>

<style lang="scss">

@import "@/assets/styles/viewer.scss";

</style>
