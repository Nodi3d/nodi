<template>
  <div
    v-show="isVisible"
    ref="root"
    class="tooltip"
    @mousedown.stop="onMouseDown"
    @mouseup.stop="onMouseUp"
  >
    <div class="">
      <ul class="">
        <li>
          <select v-model="displayType" class="form-select input-block rounded-0 color-text-link" style="text-align-last: center;">
            <option v-for="type in displayTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </li>
        <li v-if="connections.length > 0" class="border-bottom">
          <button class="btn btn-outline btn-block rounded-0 border-0" @click.prevent.stop="disconnectAll" @mouseover.prevent.stop="highlightAll" @mouseout.prevent.stop="unhighlightAll">
            Disconnect All
          </button>
        </li>
        <li v-for="(con, idx) in connections" :key="idx" class="border-bottom">
          <button class="btn btn-outline btn-block rounded-0 border-0" @click.prevent.stop="disconnect(idx)" @mouseover.prevent.stop="highlight(idx)" @mouseout.prevent.stop="unhighlight(idx)">
            Disconnect {{ con }}
          </button>
        </li>
        <li>
          <button class="btn btn-outline btn-block rounded-0 border-0" @click.prevent.stop="relay">
            Relay
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Watch } from 'nuxt-property-decorator';
import { Vector2 } from 'three';
import { IO, IODisplayTypes } from '@nodi/core';

import Tooltip from './Tooltip.vue';
import IOView from '~/assets/scripts/editor/views/IOView';
import EdgeView from '~/assets/scripts/editor/views/EdgeView';

export type DisconnectionType = {
  from: IO;
  to: IO;
};

let target: IOView;
let edges: EdgeView[];

@Component({})
export default class IOContextTooltip extends Tooltip {
  $refs!: {
    root: HTMLDivElement;
  };

  displayTypes: typeof IODisplayTypes = IODisplayTypes;
  displayType: string = IODisplayTypes.Default;
  connections: string[] = [];

  show (position: Vector2): void {
    this.move(position.x, position.y);
    this.isVisible = true;
    this.$emit('hidden', this.isVisible);
  }

  setup (io: IOView, e: EdgeView[]): void {
    target = io;
    edges = e;
    const entity = io.getIO();
    this.displayType = entity.displayType;
    this.connections = entity.getConnections().map((i) => {
      return i.getParent().displayName;
    });
  }

  disconnectAll (): void {
    const io = target.getIO();
    const connections: DisconnectionType[] = io.getConnections().map((other) => {
      return {
        from: io,
        to: other
      };
    });
    this.$emit('disconnect', connections);
  }

  highlightAll (): void {
    edges.forEach((e) => {
      e.highlight();
    });
  }

  unhighlightAll (): void {
    edges.forEach((e) => {
      e.unhighlight();
    });
  }

  disconnect (index: number): void {
    const io = target.getIO();
    const connections: DisconnectionType[] = [
      {
        from: io,
        to: io.getConnections()[index]
      }
    ];
    this.$emit('disconnect', connections);
  }

  private getEdge (index: number): EdgeView | undefined {
    const io = target.getIO();
    const connections = io.getConnections();
    const other = connections[index];

    const found = edges.find((e) => {
      return e.hasIO(io) && e.hasIO(other);
    });
    return found;
  }

  highlight (index: number): void {
    const found = this.getEdge(index);
    if (found !== undefined) {
      found.highlight();
    }
  }

  unhighlight (index: number): void {
    const found = this.getEdge(index);
    if (found !== undefined) {
      found.unhighlight();
    }
  }

  relay (): void {
    this.$emit('relay', target);
  }

  @Watch('displayType')
  onDisplayTypeChanged (type: keyof typeof IODisplayTypes) {
    const io = target.getIO();
    if (io.displayType !== type) {
      io.setDisplayType(type);
    }
  }
}

</script>
