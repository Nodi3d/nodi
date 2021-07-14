<template>
  <header>
    <ul class="menu mb-0 rounded-0 d-flex flex-justify-start flex-items-center">
      <li class="mr-2">
        <router-link class="header__link--image d-flex flex-items-center" to="/" v-html="svg.logoBlue" />
      </li>
      <li class="">
        <router-link class="button no-underline px-3" to="/editor/">
          Editor
        </router-link>
      </li>
      <li class="">
        <HelpMenu :dark="false" />
      </li>
      <li style="margin-left: auto;">
        <div class="d-flex flex-items-center">
          <input v-model="query" class="header__link--search mr-1 px-1 text-gray-dark border border-gray-dark rounded-1" type="text" placeholder="Search" @keydown.enter.prevent.stop="search">
          <a class="" @click="search" v-html="svg.search" />
        </div>
      </li>
      <li class="ml-2" style="">
        <UserMenu />
      </li>
    </ul>
  </header>
</template>

<script lang='ts'>

import { Vue, Component } from 'nuxt-property-decorator';

import octicons from '@primer/octicons';

import HelpMenu from '../editor/header/HelpMenu.vue';
import UserMenu from '../editor/header/UserMenu.vue';

import svgLogoBlue from '~/assets/images/logo/logo-blue.svg?raw';
import svgLogoBlueSquare from '~/assets/images/logo/logo-blue-square.svg?raw';

@Component({
  components: {
    HelpMenu, UserMenu
  }
})
export default class Header extends Vue {
  svg = {
    search: octicons.search.toSVG({
      stroke: '#000'
    }),
    logoBlue: svgLogoBlue,
    logoBlueSquare: svgLogoBlueSquare
  };

  query: string = '';

  search () {
    this.$router.push({
      path: '/search',
      query: {
        q: this.query
      }
    }, () => {}, () => {});
    this.query = '';
  }
}

</script>

<style lang="scss">

.header__link--image {
  img, svg {
    display: inline-block;
    height: 27px;
  }
}

.header__link--search {
  max-width: 80px;
  &:focus {
    max-width: 180px;
  }
}

</style>
