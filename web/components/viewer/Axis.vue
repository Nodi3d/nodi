<template>
  <svg class="axis no-select" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g>
      <line
        ref="lx"
        x1="50"
        y1="50"
        x2="50"
        y2="50"
        stroke-width="2"
        stroke="#ff2b56"
      />
      <line
        ref="ly"
        x1="50"
        y1="50"
        x2="50"
        y2="50"
        stroke-width="2"
        stroke="#19bf6c"
      />
      <line
        ref="lz"
        x1="50"
        y1="50"
        x2="50"
        y2="50"
        stroke-width="2"
        stroke="#428dff"
      />
      <template v-for="(el, idx) in elements">
        <circle
          v-if="el.type === &quot;circle&quot;"
          :key="idx"
          :r="10"
          :cx="el.x"
          :cy="el.y"
          :class="el.cls"
          @click="onClick(el)"
        />
        <text
          v-if="el.type === &quot;text&quot;"
          :key="idx"
          class="text-mono"
          :x="el.x"
          :y="el.y"
          font-size="12"
        >{{ el.content }}</text>
      </template>
    </g>
  </svg>
</template>

<script lang='ts'>

import { Component, Vue } from 'nuxt-property-decorator';

import { Camera, Quaternion, Vector3 } from 'three';

class AxisElement {
  type: string;
  x: number;
  y: number;
  z: number;

  constructor () {
    this.type = 'unknown';
    this.x = 50;
    this.y = 50;
    this.z = 0;
  }

  set (position: Vector3) {
    this.x = position.x;
    this.y = position.y;
    this.z = position.z;
  }

  get position (): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }
}

class Text extends AxisElement {
  content: string;

  constructor (content: string) {
    super();
    this.type = 'text';
    this.content = content;
  }
}

class Circle extends AxisElement {
  cls: string;
  direction: Vector3;

  constructor (cls: string, direction: Vector3) {
    super();
    this.type = 'circle';
    this.cls = cls;
    this.direction = direction;
  }
}

@Component
export default class Axis extends Vue {
  $refs!: {
    lx: SVGLineElement;
    ly: SVGLineElement;
    lz: SVGLineElement;
  };

  elements: AxisElement[] = [];
  x0: Circle = new Circle('x', new Vector3(-1, 0, 0));
  x1: Circle = new Circle('x', new Vector3(1, 0, 0));
  y0: Circle = new Circle('y', new Vector3(0, -1, 0));
  y1: Circle = new Circle('y', new Vector3(0, 1, 0));
  z0: Circle = new Circle('z', new Vector3(0, 0, -1));
  z1: Circle = new Circle('z', new Vector3(0, 0, 1));
  tx: Text = new Text('X');
  ty: Text = new Text('Y');
  tz: Text = new Text('Z');

  created () {
  }

  mounted () {
  }

  update (camera: Camera) {
    let q = (new Quaternion()).setFromEuler(camera.rotation);
    q = q.invert();

    const r = 38;
    const off = 50;

    // Sort elements
    const elements: AxisElement[] = [this.x0, this.x1, this.y0, this.y1, this.z0, this.z1].map((c) => {
      const v = c.direction.clone().applyQuaternion(q);
      v.y *= -1;
      v.multiplyScalar(r).addScalar(off);
      c.set(v);
      return c;
    });
    elements.sort((a, b) => {
      return a.z - b.z;
    });

    this.tx.set(this.x1.position);
    this.ty.set(this.y1.position);
    this.tz.set(this.z1.position);

    elements.splice(elements.indexOf(this.x1) + 1, 0, this.tx);
    elements.splice(elements.indexOf(this.y1) + 1, 0, this.ty);
    elements.splice(elements.indexOf(this.z1) + 1, 0, this.tz);

    this.elements = elements;

    const offset = '50';
    this.$refs.lx.setAttribute('x1', `${this.x1.x}`);
    this.$refs.lx.setAttribute('y1', `${this.x1.y}`);
    this.$refs.lx.setAttribute('x2', offset);
    this.$refs.lx.setAttribute('y2', offset);

    this.$refs.ly.setAttribute('x1', `${this.y1.x}`);
    this.$refs.ly.setAttribute('y1', `${this.y1.y}`);
    this.$refs.ly.setAttribute('x2', offset);
    this.$refs.ly.setAttribute('y2', offset);

    this.$refs.lz.setAttribute('x1', `${this.z1.x}`);
    this.$refs.lz.setAttribute('y1', `${this.z1.y}`);
    this.$refs.lz.setAttribute('x2', offset);
    this.$refs.lz.setAttribute('y2', offset);
  }

  onClick (c: Circle) {
    this.$emit('click', c.direction);
  }
}

</script>

<style lang="scss" scoped>

circle.x {
  fill: #ff2b56;
  &:hover {
    fill: #BA2C57;
  }
}

circle.y {
  fill: #19bf6c;
  &:hover {
    fill: #109151;
  }
}

circle.z {
  fill: #428dff;
  &:hover {
    fill: #1060b0;
  }
}

text {
  text-anchor: middle;
  dominant-baseline: central;
}

</style>
