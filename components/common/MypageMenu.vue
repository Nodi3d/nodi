
<template>
  <div
    class="mypage-left-menu"
  >
    <ul class="d-flex flex-column flex-items-start f5">
      <template v-if="user != null">
        <li class="">
          <router-link to="/mypage/account" class="link-gray-dark d-flex flex-items-center">
            <img style="height: 30px;" class="mr-2" :src="user.imageUrl" :alt="user.name" :title="user.name">
            <span class="d-block wb-break-all">{{ user.name }}</span>
          </router-link>
        </li>
        <li>
          <router-link title="files" to="/mypage/files" class="link-gray-dark d-flex flex-items-center">
            Files
          </router-link>
        </li>
      </template>
      <template v-else>
        <li>
          <a class="sign-in link-gray-dark d-flex flex-items-center" @click.prevent.stop="signIn">Sign in</a>
        </li>
      </template>
    </ul>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'nuxt-property-decorator';
import { UserState } from '~/store/user';

@Component({})
export default class MypageMenu extends Vue {
  get user (): UserState {
    return this.$accessor.user;
  }

  signIn (): void {
  }
}

</script>

<style lang="scss" scoped>

@import '~/assets/styles/foundations/common';

$mypage-left-menu-width: 300px;

.mypage-left-menu {
  background-color: white;

  $item-height: 44px;

  width: $mypage-left-menu-width;
  height: calc(100vh - 30px);
  border-right: 1px solid #ccc;

  ul {
    width: $mypage-left-menu-width;

    li {
      width: $mypage-left-menu-width;
      height: $item-height;

      a {
        box-sizing: border-box;
        padding: 8px 20px 8px 20px;
        width: $mypage-left-menu-width;
        height: $item-height;

        text-decoration: none;
        cursor: pointer;

        &:hover {
          background-color: #f0f0f0;
        }
      }
    }
  }
}

@include min-screen($breakpoint-size) {
}

@include max-screen($breakpoint-size) {
  .mypage-left-menu {
    display: none;
  }
}

</style>
