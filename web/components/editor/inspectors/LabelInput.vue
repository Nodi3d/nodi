<template>
  <ul>
    <li>
      <div>
        <label for="label-input">label</label>
        <input
          id="label-input"
          v-model="label"
          class="form-control input-block"
          type="text"
          name="label-input"
        >
      </div>
    </li>
  </ul>
</template>

<script lang='ts'>

import { Vue, Prop, Component } from 'nuxt-property-decorator';

@Component({})
export default class LabelInput extends Vue {
  @Prop({ type: String, required: true })
  value!: string;

  get label (): string {
    return this.value.toString();
  }

  set label (v: string) {
    this.value = v;
    this.$emit('change', this.value);
  }
}

</script>
