<template>
  <div ref="Root" class="header__menu" :class="{ dark: dark }">
    <a class="" style="" @click.prevent="toggle">File</a>
    <ul v-show="isVisible" class="" style="">
      <li class="">
        <a class="" title="Create a new graph" @click.prevent.stop="onNew"><span class="menu__button--left">New</span><span class="menu__button--right text-mono f6">Ctrl+N</span></a>
      </li>
      <li class="">
        <a class="" title="Open an another graph" @click.prevent.stop="onOpen"><span class="menu__button--left">Open</span><span class="menu__button--right text-mono f6">Ctrl+O</span></a>
      </li>
      <li>
        <a :disabled="!writable" :aria-disabled="!writable" :class="{ 'no-pointer-events': !writable, 'link-gray-dark': !writable }" title="Save this graph" @click.prevent.stop="onSave"><span class="menu__button--left">Save</span><span class="menu__button--right text-mono f6">Ctrl+S</span></a>
      </li>
      <li v-if="!mine" class="">
        <a :disabled="!forkable" :aria-disabled="!forkable" :class="{ 'no-pointer-events': !forkable, 'link-gray-dark': !forkable }" title="Fork this graph" @click.prevent.stop="onFork"><span class="menu__button--left">Fork</span></a>
      </li>
      <li v-if="admin" class="">
        <a
          :class="{ 'no-pointer-events': !isSignIn, 'link-gray-dark': !isSignIn }"
          class=""
          title="Share this graph"
          @click.prevent.stop="onShare"
        ><span class="menu__button--left">Share</span></a>
      </li>
      <li class="">
        <a class="" title="Download a graph as a json file" @click.prevent.stop="onDownload"><span class="menu__button--left">Download</span></a>
      </li>
    </ul>
  </div>
</template>

<script lang='ts'>
import { Component, Prop } from 'nuxt-property-decorator';
import MenuBase from './MenuBase.vue';
import Project from '~/assets/scripts/service/Project';

@Component({
})
export default class FileMenu extends MenuBase {
  @Prop({ type: Object, default: null })
  project!: Project;

  get isSignIn (): boolean {
    return this.$accessor.user.uid !== undefined;
  }

  get writable (): boolean {
    if (this.project.uid === undefined) { return true; } else if (!this.isSignIn) { return false; }
    return this.project.canEdit(this.$accessor.user.uid ?? '');
  }

  get forkable (): boolean {
    if (!this.isSignIn) { return false; }
    return this.project.canFork();
  }

  get admin (): boolean {
    return this.project.isAdmin(this.$accessor.user.uid ?? '');
  }

  get mine (): boolean {
    if (this.project.uid === undefined) { return true; } else if (!this.isSignIn) { return false; }
    return (this.project.uid === this.$accessor.user.uid);
  }

  onNew () {
    this.$emit('filenew');
    this.hide();
  }

  onOpen () {
    this.$emit('fileopen');
    this.hide();
  }

  onSave () {
    this.$emit('filesave');
    this.hide();
  }

  onFork () {
    this.$emit('filefork');
    this.hide();
  }

  onShare () {
    this.$emit('fileshare');
    this.hide();
  }

  onDownload () {
    this.$emit('filedownload');
    this.hide();
  }
}

</script>
