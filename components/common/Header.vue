<template>
  <header>
    <ul class="menu mb-0 rounded-0 d-flex flex-justify-start flex-items-center">
      <li class="mr-2">
        <router-link class="header__link--image header__link--image--pc flex-items-center" to="/">
          <img src="~/assets/images/logo/logo-blue.svg" style="height: 27px;">
        </router-link>
        <router-link class="header__link--image header__link--image--mobile flex-items-center ml-1" to="/">
          <img src="~/assets/images/logo/logo-blue-square.svg" style="height: 24px;">
        </router-link>
      </li>
      <li>
        <router-link class="button no-underline px-3" to="/editor/">
          Editor
        </router-link>
      </li>
      <li>
        <HelpMenu :dark="false" />
      </li>
      <li>
        <a class="button no-underline px-3" href="https://nodi3d.github.io/docs/user/examples" target="blank">
          Examples
        </a>
      </li>
      <li class="mr-4 header__search ml-auto">
        <div class="d-flex flex-items-center">
          <input v-model="query" class="header__link--search mr-1 px-1 text-gray-dark border border-gray-dark rounded-1" type="text" placeholder="Search" @keydown.enter.prevent.stop="search">
          <a class="" @click="search" v-html="svg.search" />
        </div>
      </li>
      <li class="header__user mr-1" style="">
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

<style lang="scss" scoped>

@import '~/assets/styles/foundations/common';

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

.header__link--image--pc {
  display: flex;
}
.header__link--image--mobile {
  display: none;
}

@include max-screen($breakpoint-size) {
  .header__link--image--pc {
    display: none;
  }
  .header__link--image--mobile {
    display: flex;
  }
  .header__search {
    display: none;
  }
  .header__user {
    margin-left: auto;
  }
}

</style>
