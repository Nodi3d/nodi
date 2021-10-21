<template>
  <div
    v-show="isVisible"
    ref="root"
    class="position-absolute p-0 border box-shadow-medium color-bg-default"
    style="top: 0px; left: 0px;"
    @mousedown.stop="onMouseDown"
    @mouseup.stop="onMouseUp"
  >
    <div class=" d-flex flex-items-center flex-justify-center">
      <ul class="text-small p-0">
        <li>
          <a class="d-block p-2 cursor-pointer no-underline" @click.prevent.stop="onOpen">Open</a>
        </li>
        <li class="bottom pb-2 mb-2 border-bottom">
          <a class="d-block p-2 cursor-pointer no-underline" @click.prevent.stop="onOpenInNewTab">Open in New Tab</a>
        </li>
        <li :class="{ bottom: editable }">
          <a class="d-block p-2 cursor-pointer no-underline" @click.prevent.stop="onCopyLink">Copy Link</a>
        </li>
        <li v-if="editable" class="">
          <a class="d-block p-2 cursor-pointer no-underline" @click.prevent.stop="onDuplicate">Duplicate</a>
        </li>
        <li v-if="editable" class="">
          <a class="d-block p-2 cursor-pointer no-underline" @click.prevent.stop="onDelete">Delete</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Prop } from 'nuxt-property-decorator';
import Tooltip from '../editor/Tooltip.vue';

@Component({})
export default class FileContextTooltip extends Tooltip {
  @Prop({ type: Boolean, required: false, default: true })
  editable!: boolean;

  onOpen () {
    this.$emit('open');
    this.hide();
  }

  onOpenInNewTab () {
    this.$emit('openinnewtab');
    this.hide();
  }

  onCopyLink () {
    this.$emit('copylink');
    this.hide();
  }

  onDuplicate () {
    this.$emit('duplicate');
    this.hide();
  }

  onDelete () {
    this.$emit('delete');
    this.hide();
  }
}

</script>

<style lang="scss" scoped>

a {
  box-sizing: border-box;
  &:hover {
    background-color: #eee;
  }
}

</style>
