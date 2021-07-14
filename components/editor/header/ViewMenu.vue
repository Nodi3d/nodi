<template>
  <div ref="Root" class="header__menu" :class="{ dark: dark }">
    <a @click.prevent="toggle">View</a>
    <ul v-show="isVisible">
      <li>
        <a @click.prevent.stop="$emit('entire'), hide()"><span class="menu__button--left">Entire</span><span class="menu__button--right text-mono f6">Ctrl+E</span></a>
      </li>
      <li class="">
        <a @click.prevent.stop="$emit('preview'), hide()"><span class="menu__button--left">Preview</span><span class="menu__button--right text-mono f6">Ctrl+P</span></a>
      </li>
      <li>
        <a @click.prevent.stop="$emit('performance'), hide()"><span class="menu__button--left">Performance</span><span class="menu__button--right text-mono f6">Ctrl+D</span></a>
      </li>
    </ul>
  </div>
</template>

<script lang='ts'>
import { Component } from 'nuxt-property-decorator';
import MenuBase from './MenuBase.vue';

@Component({
})
export default class ViewMenu extends MenuBase {
}

</script>
