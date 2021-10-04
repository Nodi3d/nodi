<template>
  <div
    v-show="isVisible"
    ref="root"
    class="tooltip"
    @mousedown.stop="onMouseDown"
    @mouseup.stop="onMouseUp"
  >
    <ul>
      <li class="">
        <button class="btn btn-outline btn-block rounded-0 border-0" @click.prevent.stop="onUngroup">
          Ungroup
        </button>
      </li>
      <li class="border-top">
        <button class="btn btn-outline btn-block rounded-0 border-0" @click.prevent.stop="onAddToGroup">
          Add to group
        </button>
      </li>
      <li class="border-top">
        <button class="btn btn-outline btn-block rounded-0 border-0" @click.prevent.stop="onRemoveFromGroup">
          Remove from group
        </button>
      </li>
    </ul>
  </div>
</template>

<script lang='ts'>

import { Component } from 'nuxt-property-decorator';
import Tooltip from './Tooltip.vue';
import { Vector2 } from '~/node_modules/@types/three';
import Group from '~/assets/scripts/core/Group';

let target: Group;

@Component({})
export default class GroupContextTooltip extends Tooltip {
  $refs!: {
    root: HTMLDivElement;
  };

  setup (group: Group): void {
    target = group;
  }

  show (position: Vector2) {
    this.move(position.x, position.y);
    this.isVisible = true;
    this.$emit('hidden', this.isVisible);
  }

  onUngroup () {
    if (this.isDragging) { return; }
    this.$emit('ungroup', target);
    this.hide();
  }

  onAddToGroup () {
    if (this.isDragging) { return; }
    this.$emit('addtogroup', target);
    this.hide();
  }

  onRemoveFromGroup () {
    if (this.isDragging) { return; }
    this.$emit('removefromgroup', target);
    this.hide();
  }
}

</script>
