<template>
  <ul>
    <li>
      <div>
        <label for="number-of-inputs"># of inputs</label>
        <input
          id="number-of-inputs"
          v-model="count"
          type="number"
          name="number-of-inputs"
          class="webkit-spin-button form-control input-block"
          :min="min"
          :max="max"
        >
      </div>
    </li>
  </ul>
</template>

<script lang='ts'>

import { Vue, Prop, Component } from 'nuxt-property-decorator';

@Component({})
export default class VariableInputCount extends Vue {
  @Prop({ type: Number, required: true })
  min!: number;

  @Prop({ type: Number, required: true })
  max!: number;

  @Prop({ type: Number, required: true })
  value!: number;

  get count (): string {
    return this.value.toString();
  }

  set count (v: string) {
    this.value = Number(v);
    this.$emit('change', this.value);
  }
}

</script>
