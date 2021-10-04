<template>
  <div
    v-show="isVisible"
    ref="root"
    class="tooltip"
    @mousedown.stop="onMouseDown"
    @mouseup.stop="onMouseUp"
  >
    <ul class="" style="width: 120px;">
      <li>
        <button class="btn btn-outline btn-block rounded-0 border-0" @click.prevent.stop="onEnable">
          Enable
        </button>
      </li>
      <li>
        <button class="btn btn-outline btn-block rounded-0 border-0" @click.prevent.stop="onDisable">
          Disable
        </button>
      </li>
      <li class="border-top">
        <button class="btn btn-outline btn-block rounded-0 border-0" @click.prevent.stop="onPreviewOn">
          Preview On
        </button>
      </li>
      <li>
        <button class="btn btn-outline btn-block rounded-0 border-0" @click.prevent.stop="onPreviewOff">
          Preview Off
        </button>
      </li>
      <li class="border-top">
        <button class="btn btn-outline btn-block rounded-0 border-0" @click.prevent.stop="onZoom">
          Zoom
        </button>
      </li>
      <li class="border-top">
        <button class="btn btn-outline btn-block rounded-0 border-0" @click.prevent.stop="onGroup">
          Group
        </button>
      </li>
    </ul>
  </div>
</template>

<script lang='ts'>

import { Component } from 'nuxt-property-decorator';
import { Vector2 } from 'three';
import Tooltip from './Tooltip.vue';

@Component({})
export default class NodeContextTooltip extends Tooltip {
  $refs!: {
    root: HTMLDivElement;
  };

  show (position: Vector2) {
    this.move(position.x, position.y);
    this.isVisible = true;
    this.$emit('hidden', this.isVisible);
  }

  onEnable () {
    if (this.isDragging) { return; }
    this.$emit('enable');
  }

  onDisable () {
    if (this.isDragging) { return; }
    this.$emit('disable');
  }

  onPreviewOn () {
    if (this.isDragging) { return; }
    this.$emit('previewon');
  }

  onPreviewOff () {
    if (this.isDragging) { return; }
    this.$emit('previewoff');
  }

  onZoom () {
    if (this.isDragging) { return; }
    this.$emit('zoom');
  }

  onGroup () {
    if (this.isDragging) { return; }
    this.$emit('group');
    this.hide();
  }
}

</script>
