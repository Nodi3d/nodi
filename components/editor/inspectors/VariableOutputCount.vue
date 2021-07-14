<template>
  <ul>
    <li>
      <div>
        <label for="number-of-outputs"># of outputs</label>
        <input
          id="number-of-outputs"
          v-model="count"
          type="number"
          name="number-of-outputs"
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
export default class VariableOutputCount extends Vue {
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
