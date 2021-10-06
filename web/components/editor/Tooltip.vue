<template>
  <div
    class="tooltip"
    refs="root"
    @mousemove.stop="onMouseMove"
    @mouseup="onMouseUp"
  />
</template>

<script lang='ts'>

import { Vue, Component } from 'nuxt-property-decorator';
import { Vector2 } from 'three';

@Component({})
export default class Tooltip extends Vue {
  $refs!: {
    root: HTMLDivElement;
  };

  isVisible: boolean = false;
  isDragging: boolean = false;
  start: Vector2 = new Vector2();
  position: Vector2 = new Vector2();
  keep: Vector2 = new Vector2();

  mounted () {
    document.addEventListener('click', this.outside);
  }

  beforeDestroy () {
    document.removeEventListener('click', this.outside);
  }

  outside (e: MouseEvent): void {
    if (this.isVisible) {
      const path = this.getPath(e);
      if (!path.includes(this.$refs.root)) {
        this.hide();
      }
    }
  }

  onMouseDown (e: MouseEvent): void {
    this.isDragging = false;
    this.start.x = e.clientX;
    this.start.y = e.clientY;
    this.keep.x = this.position.x;
    this.keep.y = this.position.y;
    this.$emit('dragstart', e, this);
  }

  onMouseUp (e: MouseEvent) {
    this.$emit('dragend', e, this);
  }

  drag (e: MouseEvent): void {
    this.isDragging = true; // is dragging on if dragged
    const dx = e.clientX - this.start.x;
    const dy = e.clientY - this.start.y;
    this.move(this.keep.x + dx, this.keep.y + dy);
  }

  public show (position: Vector2) {
    this.move(position.x, position.y);
    this.isVisible = true;
    this.$emit('hidden', this.isVisible);
  }

  public hide (): void {
    this.isVisible = false;
    this.$emit('hidden', this.isVisible);
  }

  move (px: number, py: number): void {
    this.position.x = px;
    this.position.y = py;
    this.$refs.root.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
  }

  getPath (e: MouseEvent): EventTarget[] {
    return e.composedPath();
  }
}

</script>
