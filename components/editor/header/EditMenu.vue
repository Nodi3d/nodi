<template>
  <div ref="Root" class="header__menu" :class="{ dark: dark }">
    <a @click.prevent="toggle">Edit</a>
    <ul v-show="isVisible">
      <li>
        <a @click.prevent.stop="$emit('undo'), hide()"><span class="menu__button--left">Undo</span><span class="menu__button--right text-mono f6">Ctrl+Z</span></a>
      </li>
      <li class="">
        <a @click.prevent.stop="$emit('redo'), hide()"><span class="menu__button--left">Redo</span><span class="menu__button--right text-mono f6">Ctrl+Y</span></a>
      </li>
      <li>
        <a @click.prevent.stop="$emit('copy'), hide()"><span class="menu__button--left">Copy</span><span class="menu__button--right text-mono f6">Ctrl+C</span></a>
      </li>
      <li>
        <a @click.prevent.stop="$emit('paste'), hide()"><span class="menu__button--left">Paste</span><span class="menu__button--right text-mono f6">Ctrl+V</span></a>
      </li>
      <li>
        <a @click.prevent.stop="$emit('delete'), hide()"><span class="menu__button--left">Delete</span><span class="menu__button--right text-mono f6">Del</span></a>
      </li>
      <li>
        <a @click.prevent.stop="$emit('selectall'), hide()"><span class="menu__button--left">Select All</span><span class="menu__button--right text-mono f6">Ctrl+A</span></a>
      </li>
      <li>
        <a @click.prevent.stop="$emit('search'), hide()"><span class="menu__button--left">Search</span><span class="menu__button--right text-mono f6">Ctrl+F</span></a>
      </li>
    </ul>
  </div>
</template>

<script lang='ts'>
import { Component } from 'nuxt-property-decorator';
import MenuBase from './MenuBase.vue';

@Component({
})
export default class EditMenu extends MenuBase {
}

</script>
