<template>
  <div v-if="project !== null" class="dark-theme">
    <template v-if="!isMobile">
      <a v-show="!isEditing" class="color-fg-on-emphasis no-underline cursor-pointer dark-theme-hover px-3 py-2" name="" @click.prevent="click">{{ title }}</a>
      <input
        v-show="isEditing"
        ref="Input"
        v-model="title"
        class="px-2"
        type="text"
        @blur="blur"
      >
    </template>
    <template v-else>
      <span class="px-1">{{ title }}</span>
    </template>
  </div>
</template>

<script lang='ts'>

import { Vue, Component, Prop } from 'nuxt-property-decorator';
import Project from '~/assets/scripts/service/Project';

@Component({})
export default class Title extends Vue {
  $refs!: {
    Input: HTMLInputElement;
  };

  @Prop({ type: Object, default: null })
  project!: Project;

  @Prop({ type: Boolean, default: false })
  isMobile!: boolean;

  isEditing: boolean = false;

  get title (): string {
    return this.project.title;
  }

  set title (value: string) {
    this.project.title = value;
  }

  click (): void {
    this.isEditing = true;
    this.$nextTick(() => {
      this.$refs.Input.focus();
    });
    this.$emit('edit');
  }

  blur (): void {
    this.isEditing = false;
  }
}

</script>
