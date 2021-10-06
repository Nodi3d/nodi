<template>
  <li>
    <div>
      <span v-text="label" />
      <div class="domain ml-3">
        <div class="unit">
          <label :for="`${label}-start`">start</label>
          <input :id="`${label}-start`" v-model="start" type="number" class="form-control">
        </div>
        <div class="unit ml-2">
          <label :for="`${label}-end`">end</label>
          <input :id="`${label}-end`" v-model="end" type="number" class="form-control">
        </div>
      </div>
    </div>
  </li>
</template>

<script lang="ts">

import { Vue, Prop, Component } from 'nuxt-property-decorator';
import { NDomain } from '@nodi/core';

@Component({})
export default class DomainInput extends Vue {
  @Prop({ type: String, required: true })
  label!: string;

  @Prop({ type: Object, required: true })
  value!: NDomain;

  get number (): string {
    return this.value.toString();
  }

  set number (v: string) {
    this.$emit('change', Number(v));
  }

  get start (): string {
    return this.value.start.toString();
  }

  set start (v: string) {
    this.value.start = Number(v);
    this.$emit('change', this.value);
  }

  get end (): string {
    return this.value.end.toString();
  }

  set end (v: string) {
    this.value.end = Number(v);
    this.$emit('change', this.value);
  }
}

</script>
