<template>
  <div ref="Root" class="header__menu" :class="{ dark: dark }">
    <a @click.prevent="toggle">Help</a>
    <ul v-show="isVisible" class="box-shadow-medium">
      <li>
        <router-link to="/nodes">
          <span class="menu__button--left">Nodes</span>
        </router-link>
      </li>
      <li class="">
        <a href="//nodi3d.github.io/docs/" target="_blank"><span class="menu__button--left">Document</span></a>
      </li>
      <li>
        <a href="//github.com/Nodi3d" target="_blank"><span class="menu__button--left">Github</span></a>
      </li>
    </ul>
  </div>
</template>

<script lang='ts'>
import { Component } from 'nuxt-property-decorator';
import MenuBase from './MenuBase.vue';

@Component({
})
export default class HelpMenu extends MenuBase {
}

</script>
