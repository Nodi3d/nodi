<template>
  <div
    v-show="isVisible"
    ref="root"
    class="tooltip"
    @mousedown.stop="onMouseDown"
    @mouseup.stop="onMouseUp"
  >
    <NodeSearchBox
      ref="NodeSearchBox"
      :hierarchy="hierarchy"
      @select="onSelect"
    />
  </div>
</template>

<script lang='ts'>

import { Component } from 'nuxt-property-decorator';
import { Vector2 } from 'three';
import { NodeConstructorType } from '@nodi/core';
import Tooltip from './Tooltip.vue';
import NodeSearchBox from './NodeSearchBox.vue';

@Component({
  components: {
    NodeSearchBox
  }
})
export default class NodeSearchTooltip extends Tooltip {
  $refs!: {
    root: HTMLDivElement;
    NodeSearchBox: NodeSearchBox;
  };

  hierarchy: number = 0;

  created () {
  }

  mounted () {
  }

  show (position: Vector2) {
    this.move(position.x, position.y);
    this.isVisible = true;
    this.$emit('hidden', this.isVisible);
    this.$refs.NodeSearchBox.show();
  }

  hide () {
    this.isVisible = false;
    this.$emit('hidden', this.isVisible);
  }

  onSelect (item: NodeConstructorType, clicked: boolean, $e: MouseEvent) {
    this.$emit('select', item, clicked, $e);
  }
}

</script>
