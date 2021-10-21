<template>
  <ul
    class="node-hierarchy-list"
    :class="{ root: root }"
  >
    <li
      v-for="item in sort(directory.children)"
      :key="item.name"
      class="node-list"
      @mouseover.prevent="onHover(item)"
      @mouseout.prevent="onHoverOut(item)"
      @click.prevent.stop="onClick($event, item)"
    >
      <a
        v-if="item.children"
        class="color-fg-on-emphasis"
      >
        &nbsp;> {{ item.name }}
        <NodeHierarchyList
          v-show="item.selected"
          :directory="item"
          :hierarchy="hierarchy"
          @select="onClick"
        />
      </a>
      <a v-else class="color-fg-on-emphasis">&nbsp;{{ item.name }}</a>
    </li>
  </ul>
</template>

<script lang='ts'>

import { Vue, Component, Prop } from 'nuxt-property-decorator';
import { NodeConstructorType } from '@nodi/core';

export type NodeItem = { name: string; entity: NodeConstructorType };

class Leaf {
  name: string;
  item: NodeItem;
  constructor (item: NodeItem) {
    this.item = item;
    this.name = item.name;
  }
}

class Directory {
  name: string;
  children: (Leaf | Directory)[];
  selected: boolean;

  constructor (name: string) {
    this.name = name;
    this.children = [];
    this.selected = false;
  }
}

export { Leaf, Directory };

@Component({})
export default class NodeHierarchyList extends Vue {
  @Prop({ type: Boolean, required: false, default: false })
  root!: boolean;

  @Prop({ type: Object, required: true })
  directory!: Directory | null;

  @Prop({ type: Number, required: true })
  hierarchy!: number;

  onClick (e: MouseEvent, item: Leaf | Directory) {
    if (item instanceof Leaf) {
      this.$emit('select', e, item);
    }
  }

  onHover (item: Directory) {
    item.selected = true;
  }

  onHoverOut (item: Directory) {
    item.selected = false;
  }

  sort (items: (Leaf | Directory)[]) {
    const directories: (Leaf | Directory)[] = [];
    const files: (Leaf | Directory)[] = [];
    items.forEach((item) => {
      if (item instanceof Leaf) {
        files.push(item);
      } else {
        directories.push(item);
      }
    });
    return directories.concat(files);
  }
}

</script>
