<template>
  <li class="d-flex flex-items-center flex-justify-between px-2 py-1" style="width: 100%;">
    <div ref="root" />
    <div v-if="editor" v-show="length > 1" class="ml-3 mr-0">
      <button v-if="order !== 0" class="btn btn-sm px-0 py-0 octicon text-center" @click="$emit('up')" v-html="octicons.arrowUp" />
      <div v-else class="d-inline-block" style="width: 16px;" />
      <button v-if="order !== length - 1" class="btn btn-sm px-0 py-0 octicon text-center" @click="$emit('down')" v-html="octicons.arrowDown" />
      <div v-else class="d-inline-block" style="width: 16px;" />
    </div>
  </li>
</template>

<script lang="ts">

import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator';
import octicons from '@primer/octicons';

@Component({})
export default class UIListItem extends Vue {
  $refs!: {
    root: HTMLLIElement;
  };

  @Prop({ type: Boolean, default: false })
  editor!: boolean;

  @Prop({ type: Number, required: true })
  order!: number;

  @Prop({ type: Number, required: true })
  length!: number;

  private uuid: string = '';
  private octicons: any = {
    arrowUp: octicons['arrow-up'].toSVG({ width: '15px', height: '14px' }),
    arrowDown: octicons['arrow-down'].toSVG({ width: '15px', height: '14px' })
  };

  mounted () {
  }

  getUUID (): string {
    return this.uuid;
  }

  setup (uuid: string, content: HTMLDivElement) {
    this.uuid = uuid;
    this.$refs.root.appendChild(content);
  }

  @Watch('order')
  onOrderChanged (): void {
    this.$emit('change', this.order);
  }
}

</script>

<style lang="scss" scoped>

.btn {
  border-radius: 2px;
}

</style>
