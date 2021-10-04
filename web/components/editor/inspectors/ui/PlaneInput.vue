<template>
  <li>
    <div>
      <span v-text="label" />
      <div class="plane">
        <div class="origin mb-1">
          <span>origin</span>
          <div class="unit ml-2">
            <label for="px">x</label>
            <input id="px" v-model="px" type="number" class="form-control">
          </div>
          <div class="unit ml-2">
            <label for="py">y</label>
            <input id="py" v-model="py" type="number" class="form-control">
          </div>
          <div class="unit ml-2">
            <label for="pz">z</label>
            <input id="pz" v-model="pz" type="number" class="form-control">
          </div>
        </div>
        <div class="x-axis mb-1">
          <span>x axis</span>
          <div class="unit ml-2">
            <label for="xx">x</label>
            <input id="xx" v-model="xx" type="number" class="form-control">
          </div>
          <div class="unit ml-2">
            <label for="xy">y</label>
            <input id="xy" v-model="xy" type="number" class="form-control">
          </div>
          <div class="unit ml-2">
            <label for="xz">z</label>
            <input id="xz" v-model="xz" type="number" class="form-control">
          </div>
        </div>
        <div class="y-axis">
          <span>y axis</span>
          <div class="unit ml-2">
            <label for="yx">x</label>
            <input id="yx" v-model="yx" type="number" class="form-control">
          </div>
          <div class="unit ml-2">
            <label for="yy">y</label>
            <input id="yy" v-model="yy" type="number" class="form-control">
          </div>
          <div class="unit ml-2">
            <label for="yz">z</label>
            <input id="yz" v-model="yz" type="number" class="form-control">
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<script lang='ts'>

import { Vue, Prop, Component } from 'nuxt-property-decorator';
import { NPlane } from '@nodi/core';

@Component({})
export default class PlaneInput extends Vue {
  @Prop({ type: String, required: true })
  label!: string;

  @Prop({ type: Object, required: true })
  value!: NPlane;

  get px (): string {
    return this.value.origin.x.toString();
  }

  set px (v: string) {
    this.value.origin.x = Number(v);
    this.$emit('change', this.value);
  }

  get py (): string {
    return this.value.origin.y.toString();
  }

  set py (v: string) {
    this.value.origin.y = Number(v);
    this.$emit('change', this.value);
  }

  get pz (): string {
    return this.value.origin.z.toString();
  }

  set pz (v: string) {
    this.value.origin.z = Number(v);
    this.$emit('change', this.value);
  }

  get xx (): string {
    return this.value.xAxis.x.toString();
  }

  set xx (v: string) {
    this.value.xAxis.x = Number(v);
    this.$emit('change', this.value);
  }

  get xy (): string {
    return this.value.xAxis.y.toString();
  }

  set xy (v: string) {
    this.value.xAxis.y = Number(v);
    this.$emit('change', this.value);
  }

  get xz (): string {
    return this.value.xAxis.z.toString();
  }

  set xz (v: string) {
    this.value.xAxis.z = Number(v);
    this.$emit('change', this.value);
  }

  get yx (): string {
    return this.value.yAxis.x.toString();
  }

  set yx (v: string) {
    this.value.yAxis.x = Number(v);
    this.$emit('change', this.value);
  }

  get yy (): string {
    return this.value.yAxis.y.toString();
  }

  set yy (v) {
    this.value.yAxis.y = Number(v);
    this.$emit('change', this.value);
  }

  get yz (): string {
    return this.value.yAxis.z.toString();
  }

  set yz (v: string) {
    this.value.yAxis.z = Number(v);
    this.$emit('change', this.value);
  }
}

</script>
