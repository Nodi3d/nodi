<template>
  <div ref="Root" class="header__menu" :class="{ dark: dark }">
    <a v-if="user.uid === undefined" class="mr-3" @click.prevent.stop="signIn">Sign in</a>
    <div v-else class="dropdown">
      <a :title="user.name" aria-haspopup="true" class="d-flex flex-items-center mr-2 cursor-pointer" @click.prevent.stop="toggle">
        <img class="d-inline-block mr-1" width="22px" height="22px" :src="user.imageUrl" :alt="user.name">
        <span class="dropdown-caret" :class="{ 'color-fg-on-emphasis': dark }" />
      </a>
      <div v-show="isVisible" class="dropdown-menu dropdown-menu-sw mr-2 mt-1">
        <ul class="py-2">
          <li class="">
            <span class="px-3 py-1 wb-break-word d-block">{{ user.name }}</span>
          </li>
          <li class="">
            <router-link to="/mypage/account" title="account" class="px-3 py-1 d-block">
              Account
            </router-link>
          </li>
          <li class="">
            <router-link to="/mypage/files" title="files" class="px-3 py-1 d-block">
              Files
            </router-link>
          </li>
          <li class="">
            <a class="px-3 py-1 d-block" style="cursor: pointer;" @click.prevent.stop="signOut">Sign out</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component } from 'nuxt-property-decorator';
import MenuBase from './MenuBase.vue';
import { UserState } from '~/store/user';

@Component({
})
export default class HelpMenu extends MenuBase {
  get user (): UserState {
    return this.$accessor.user;
  }

  signIn (): void {
    this.$accessor.user.signIn();
  }

  signOut (): void {
    this.$accessor.user.signOut();
  }
}

</script>
