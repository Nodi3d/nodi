<template>
  <li>
    <div>
      <span v-text="label" />
      <div class="vector">
        <div class="unit">
          <label :for="`${label}-x`">x</label>
          <input :id="`${label}-x`" v-model="x" type="number" class="form-control">
        </div>
        <div class="unit">
          <label :for="`${label}-y`">y</label>
          <input :id="`${label}-y`" v-model="y" type="number" class="form-control">
        </div>
        <div class="unit">
          <label :for="`${label}-z`">z</label>
          <input :id="`${label}-z`" v-model="z" type="number" class="form-control">
        </div>
      </div>
    </div>
  </li>
</template>

<script lang="ts">

import { Vector3 } from 'three';
import { Vue, Prop, Component } from 'nuxt-property-decorator';
import { NPoint } from '@nodi/core';

@Component({})
export default class Vector3Input extends Vue {
  @Prop({ type: String, required: true })
  label!: string;

  @Prop({ type: Object, required: true })
  value!: Vector3 | NPoint;

  get x (): string {
    return this.value.x.toString();
  }

  set x (v: string) {
    this.value.x = Number(v);
    this.$emit('change', this.value);
  }

  get y (): string {
    return this.value.y.toString();
  }

  set y (v: string) {
    this.value.y = Number(v);
    this.$emit('change', this.value);
  }

  get z (): string {
    return this.value.z.toString();
  }

  set z (v: string) {
    this.value.z = Number(v);
    this.$emit('change', this.value);
  }
}

</script>
