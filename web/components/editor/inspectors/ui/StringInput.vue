<template>
  <li>
    <div>
      <label :for="`${label}-string`" v-text="label" />
      <input :id="`${label}-string`" v-model="string" type="text" class="form-control">
    </div>
  </li>
</template>

<script lang='ts'>

import { Vue, Prop, Component } from 'nuxt-property-decorator';

@Component({})
export default class StringInput extends Vue {
  @Prop({ type: String, required: true })
  label!: string;

  @Prop({ type: String, required: true })
  value!: string;

  get string (): string {
    return this.value;
  }

  set string (v: string) {
    this.$emit('change', v);
  }
}

</script>
