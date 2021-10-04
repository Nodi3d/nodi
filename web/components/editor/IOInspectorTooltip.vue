<template>
  <div
    v-show="isVisible"
    ref="root"
    class="tooltip px-2 py-2"
    @mousedown.stop="onMouseDown"
    @mouseup.stop="onMouseUp"
  >
    <div class="d-inline-flex">
      <span class="mr-1 text-mono">[{{ type }}]</span>
      <span class="">{{ description }}</span>
    </div>
    <div class="">
      <p class="ws-pre-wrap mb-0 text-mono text-small" v-text="output" />
    </div>
  </div>
</template>

<script lang='ts'>

import { Component } from 'nuxt-property-decorator';
import { Vector2 } from 'three';
import { NodeBase, IO, getTypeNames, DataTree } from '@nodi/core';

import Tooltip from './Tooltip.vue';

@Component({})
export default class IOInspectorTooltip extends Tooltip {
  $refs!: {
    root: HTMLDivElement;
  };

  type: string = '';
  description: string = '';
  output: string = '';

  show (position: Vector2) {
    this.move(position.x, position.y);
    this.isVisible = true;
    this.$emit('hidden', this.isVisible);
  }

  setup (_node: NodeBase, io: IO) {
    const names = getTypeNames(io.getDataType());
    this.type = names.join(' ');
    this.description = io.getDescription();

    const data = io.getData();
    if (data !== undefined) {
      this.output = this.stringify(data);
    } else {
      this.output = 'empty...';
    }
  }

  stringify (data: DataTree): string {
    const length = data.branches.length;
    const threshold = 10;

    const lines: string[] = [];
    for (let i = 0, n = data.branches.length; i < n; i++) {
      if (i >= threshold) {
        const line = `... (${length} branches)`;
        lines.push(line);
        break;
      } else {
        const br = data.branches[i];
        const path = br.getPath().key;
        let value = 'empty...';
        const array = br.getValue();
        if (array.length > 0) {
          const blines: string[] = [];
          for (let j = 0, m = array.length; j < m; j++) {
            if (j >= threshold) {
              blines.push(`... (N = ${array.length})`);
              break;
            }
            const v = array[j];
            if (v !== undefined) {
              blines.push(v.toString());
            }
          }
          value = blines.join(', ');
        }
        const line = `{${path}}: ${value}`;
        lines.push(line);
      }
    }
    return lines.join('\n');
  }
}

</script>

<style lang="scss" scoped>

.ws-pre-wrap {
  white-space: pre-wrap;
}

</style>
