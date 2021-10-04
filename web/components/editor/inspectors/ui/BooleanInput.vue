<template>
  <li>
    <div>
      <label :for="`${label}-boolean`" v-text="label" />
      <div class="checkbox-wrapper">
        <input :id="`${label}-boolean`" v-model="checked" class="form-control" type="checkbox">
      </div>
    </div>
  </li>
</template>

<script lang="ts">

import { Vue, Prop, Component } from 'nuxt-property-decorator';

@Component({})
export default class BooleanInput extends Vue {
  @Prop({ type: String, required: true })
  label!: string;

  @Prop({ type: Boolean, required: true })
  value!: boolean;

  get checked (): boolean {
    return this.value;
  }

  set checked (v: boolean) {
    this.$emit('change', v);
  }
}

</script>
