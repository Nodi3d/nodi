<template>
  <div
    v-show="isVisible"
    ref="root"
    class="modal graph-search-box"
    @mousedown.stop="onMouseDown"
    @mouseup.stop="onMouseUp"
    @keydown.stop="onKeyDown"
  >
    <div class="item">
      <h1>Find Node</h1>
    </div>
    <div class="item">
      <label for="node_candidate_name">Find</label>
      <input
        id="node_candidate_name"
        ref="input"
        v-model="text"
        type="text"
        placeholder="input node name..."
        @change="monitor"
        @mouseup="monitor"
        @keyup="monitor"
        @paste="monitor"
      >
    </div>
    <div class="item">
      <label>Results</label>
      <ul>
        <li
          v-for="(node, index) in candidates"
          :key="index"
          :class="{ selected: (selected === index) }"
          @click.prevent.stop="onSelect(index)"
          @mouseover.prevent="onHover(index)"
          @mouseout.prevent="onHoverOut(index)"
        >
          <span>
            {{ node.name }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component } from 'nuxt-property-decorator';
import { getNodeConstructorNameOfInstance, NodeBase } from '@nodi/core';
import Tooltip from './Tooltip.vue';

type NodeSearchCandidateType = {
  uuid: string;
  name: string;
};

@Component({})
export default class GraphSearchTooltip extends Tooltip {
  $refs!: {
    root: HTMLDivElement;
    input: HTMLInputElement;
  };

  text: string = '';
  prev: string = '';
  selected: number = -1;
  candidates: NodeSearchCandidateType[] = [];
  nodes: NodeSearchCandidateType[] = [];

  setup (nodes: NodeBase[]) {
    this.nodes = this.candidates = nodes.map((n) => {
      return {
        uuid: n.uuid,
        name: getNodeConstructorNameOfInstance(n)!
      };
    });
    this.filter(this.text);
  }

  show () {
    this.isVisible = true;
    this.$emit('hidden', this.isVisible);
    this.$nextTick(() => {
      this.$refs.input.focus();
    });
  }

  hide () {
    this.isVisible = false;
    this.$emit('hidden', this.isVisible);
  }

  filter (value: string) {
    this.candidates = this.nodes.filter(n => n.name.toLowerCase().includes(value.toLowerCase()));
    this.selected = 0;

    return this.candidates;
  }

  up () {
    this.selected = Math.max(this.selected - 1, 0);
  }

  down () {
    this.selected = Math.min(this.selected + 1, this.candidates.length - 1);
  }

  select () {
    if (this.selected < this.candidates.length) {
      this.$emit('select', this.candidates[this.selected]);
    }
    this.hide();
  }

  onSelect (index: number) {
    this.selected = index;
    this.select();
  }

  onHover (index: number) {
    this.selected = index;
  }

  onHoverOut (index: number) {
    if (this.selected === index) {
      this.selected = -1;
    }
  }

  monitor () {
    const value = this.$refs.input.value.toLowerCase();
    if (value !== this.prev) {
      this.filter(value);
    }
    this.prev = value;
  }

  onKeyDown (e: KeyboardEvent) {
    switch (e.keyCode) {
      case 13: // enter
        this.select();
        e.stopPropagation();
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
