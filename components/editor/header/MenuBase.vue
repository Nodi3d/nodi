<template>
  <div ref="Root" class="header__menu" :class="{ dark: dark }" />
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'nuxt-property-decorator';

@Component({
})
export default class MenuBase extends Vue {
  $refs!: {
    Root: HTMLDivElement;
  };

  @Prop({ type: Boolean, required: false, default: false })
  dark?: boolean;

  isVisible: boolean = false;

  mounted (): void {
    document.addEventListener('click', this.outside);
  }

  beforeDestroy (): void {
    document.removeEventListener('click', this.outside);
  }

  outside (e: MouseEvent) {
    if (this.isVisible) {
      const path = this.getPath(e);
      if (!path.includes(this.$refs.Root)) {
        this.hide();
      }
    }
  }

  getPath (e: MouseEvent): EventTarget[] {
    return e.composedPath();
  }

  protected show (): void {
    this.isVisible = true;
    this.$emit('hidden', this.isVisible);
  }

  protected hide (): void {
    this.isVisible = false;
    this.$emit('hidden', this.isVisible);
  }

  protected toggle (): void {
    this.isVisible = !this.isVisible;
    this.$emit('hidden', this.isVisible);
  }
}

</script>

<style lang="scss" scoped>

@import '~/assets/styles/foundations/common';

.header__menu {
  background-color: white;

  & > a {
    @include noselect();
    cursor: pointer;
    display: table-cell;
    padding: 0px 16px;
    height: 30px;
    text-align: center;
    vertical-align: middle;
    text-decoration: none;
    background-color: inherit;
    &.disabled, &:disabled {
      pointer-events: none;
    }
  }

  & > ul {
    position: absolute;
    background-color: inherit;
    z-index: 10000;

    a {
      cursor: pointer;
      font-size: 0.75rem;
      display: table-cell;
      width: 140px;
      height: 30px;
      text-align: center;
      vertical-align: middle;
      background-color: inherit;
      text-decoration: none;

      .menu__button--left {
        float: left;
        margin-left: 10px;
      }

      .menu__button--right {
        float: right;
        margin-right: 10px;
      }
    }
  }

  &.dark {
    @include dark-theme-color();
    a, ul {
      @include dark-theme-color();
    }
    a:hover {
      @include dark-hover-color;
    }
  }
}

@include max-screen($breakpoint-size) {
  .header__menu {
    & > a {
      padding: 0px 4px;
    }
  }
}

</style>
