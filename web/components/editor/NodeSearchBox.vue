<template>
  <div
    class="node-search-box"
    @keyup.stop="onKeyUp"
  >
    <div class="item header">
      <input
        ref="input"
        v-model="text"
        type="text"
        placeholder="input node name..."
        @change="onMonitor"
        @mouseup="onMonitor"
        @keyup="onMonitor"
        @paste="onMonitor"
      >
    </div>
    <div class="item">
      <NodeHierarchyList
        v-show="text.length <= 0"
        :root="true"
        :directory="directory"
        :hierarchy="hierarchy"
        @select="onSelect"
      />
    </div>
    <div
      v-show="text.length > 0"
      class="item"
    >
      <ul class="candidates-list">
        <li
          v-for="(node, index) in candidates"
          :key="index"
          :class="{ selected: (selected === index) }"
          @click.prevent.stop="onSelectCandidate(index, $event)"
          @mouseover.prevent="onHover(index)"
          @mouseout.prevent="onHoverOut(index)"
        >
          <span class="name">
            {{ node.name }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang='ts'>

import { Vue, Component } from 'nuxt-property-decorator';
import { NodeDictionary } from '@nodi/core';
import NodeHierarchyList, { NodeItem, Leaf, Directory } from './NodeHierarchyList.vue';

@Component({
  components: {
    NodeHierarchyList
  }
})
export default class NodeSearchBox extends Vue {
  $refs!: {
    input: HTMLInputElement;
  };

  text: string = '';
  prev: string = '';
  selected: any = null;
  directory: any = null;
  nodes: any[] = [];
  candidates: any[] = [];
  hierarchy: number = 0;

  created () {
    const root = new Directory('root');
    for (const key in NodeDictionary) {
      const arr = key.split('/');
      arr.pop();

      let parent: (Leaf | Directory) = root;
      for (const i in arr) {
        const cur = arr[i];

        if (parent instanceof Directory) {
          let found: (Leaf | Directory | undefined) = parent.children.find(ch => ch.name === cur);
          if (found === undefined) {
            found = new Directory(cur);
            parent.children.push(found);
          }
          parent = found;
        }
      }

      const node = NodeDictionary[key] as NodeItem;
      this.nodes.push(node);
      if (parent instanceof Directory) {
        parent.children.push(new Leaf(node));
      }
    }

    this.directory = root;
  }

  mounted () {
  }

  show () {
    this.text = this.prev = '';
    this.$nextTick(() => {
      this.$refs.input.focus();
    });
  }

  hide () {
    this.text = this.prev = '';
  }

  filter (value: string) {
    if (value.length <= 0) { this.candidates = []; } else { this.candidates = this.nodes.filter(n => n.name.toLowerCase().includes(value)); }

    this.candidates = this.candidates.sort((a, b) => {
      const ia = a.name.toLowerCase().indexOf(value);
      const ib = b.name.toLowerCase().indexOf(value);
      if (ia < ib) { return -1; } else if (ia === ib) { return 0; }
      return 1;
    });
    // console.log(this.candidates.map(cand => cand.name));
    this.selected = 0;
  }

  up () {
    this.selected = Math.max(this.selected - 1, 0);
  }

  down () {
    this.selected = Math.min(this.selected + 1, this.candidates.length - 1);
  }

  onSelectCandidate (index: number, $e: MouseEvent) {
    this.selected = index;
    if (index < this.candidates.length) {
      this.$emit('select', this.candidates[index].entity, true, $e);
    }
    this.hide();
  }

  onHover (index: number) {
    this.selected = index;
  }

  onHoverOut (index: number) {
    if (this.selected === index) {
      this.selected = -1;
    }
  }

  onSelect (e: MouseEvent, leaf: Leaf) {
    const item = leaf.item;
    this.$emit('select', item.entity, true, e);
  }

  onMonitor (e: KeyboardEvent) {
    const input = e.target as HTMLInputElement;
    const value = input.value.toLowerCase();
    if (value !== this.prev) {
      this.filter(value);
    }
    this.prev = value;
  }

  onKeyUp (e: KeyboardEvent) {
    switch (e.keyCode) {
      case 13: // enter
        e.stopPropagation();

        if (this.selected >= 0 && this.candidates.length > 0) {
          const item = this.candidates[this.selected];
          this.$emit('select', item.entity, false, null);
        }

        break;
      case 38: // up
        this.up();
        e.stopPropagation();
        break;
      case 40: // down
        this.down();
        e.stopPropagation();
        break;
    }
  }
}

</script>
