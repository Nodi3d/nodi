<template>
  <li>
    <div>
      <label :for="`${label}-number`" v-text="label" />
      <input :id="`${label}-number`" v-model="number" type="number" class="form-control">
    </div>
  </li>
</template>

<script lang="ts">

import { Vue, Prop, Component } from 'nuxt-property-decorator';

@Component({})
export default class NumberInput extends Vue {
  @Prop({ type: String, required: true })
  label!: string;

  @Prop({ type: Number, required: true })
  value!: number;

  get number (): string {
    return this.value.toString();
  }

  set number (v: string) {
    this.$emit('change', Number(v));
  }
}

</script>
