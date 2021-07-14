<template>
  <ul class="d-flex flex-items-center flex-justify-center">
    <li class="prev">
      <button class="btn btn-outline rounded-0" :disabled="page === 0" @click="$emit('prev')">
        Previous
      </button>
    </li>
    <!--
    <li v-for="(page, idx) in new Array(pages)" :key="idx">
      <button class="btn btn-outline rounded-0" :class="{ current: current === idx }" @click="click(idx)" v-text="(idx + 1)" />
    </li>
    -->
    <li class="next">
      <button class="btn btn-outline rounded-0" :disabled="last" @click="$emit('next')">
        Next
      </button>
    </li>
  </ul>
</template>

<script lang='ts'>

import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component({})
export default class Pager extends Vue {
  @Prop({ type: Number, required: true })
  page!: number;

  @Prop({ type: Boolean, required: true })
  last!: boolean;
}

</script>

<style lang="scss" scoped>

button {
  border-collapse: collapse;
}

</style>
