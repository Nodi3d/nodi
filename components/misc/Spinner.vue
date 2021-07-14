<template>
  <span class="spinner no-select no-pointer-events">{{ glyphs[current] }}</span>
</template>

<script lang='ts'>

import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component
export default class Spinner extends Vue {
  current: number = 0;
  intervalId: NodeJS.Timeout | undefined = undefined;

  @Prop({ type: Array, default: () => { return ['⠋', '⠙', '⠚', '⠞', '⠖', '⠦', '⠴', '⠲', '⠳']; } })
  glyphs!: string[];

  @Prop({ type: Number, default: 120 })
  interval!: number;

  mounted () {
    this.intervalId = setInterval(() => {
      this.current = (this.current + 1) % this.glyphs.length;
    }, this.interval);
  }

  beforeDestroy () {
    if (this.intervalId !== undefined) { clearInterval(this.intervalId); }
  }
}

</script>
