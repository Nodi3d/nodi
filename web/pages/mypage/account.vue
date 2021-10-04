<template>
  <div class="mypage">
    <div class="container d-flex flex-row">
      <MypageMenu />
      <div class="profile p-4">
        <Spinner v-show="user === null" />
        <section v-if="user !== null" class="d-flex flex-start flex-items-start flex-content-between">
          <div class="mr-5">
            <div class="p-2">
              <span class="d-block f5 text-gray">Name</span>
              <span class="d-block f4">{{ user.name }}</span>
            </div>
            <div class="p-2">
              <span class="d-block f5 text-gray">Email</span>
              <span class="d-block f4">{{ user.email }}</span>
            </div>
          </div>
          <img v-if="user !== null" class="d-inline-block" width="180px" :src="user.imageUrl">
        </section>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'nuxt-property-decorator';

import Spinner from '~/components/misc/Spinner.vue';
import MypageMenu from '~/components/common/MypageMenu.vue';
import { UserState } from '~/store/user';

@Component({
  components: {
    Spinner,
    MypageMenu
  }
})
export default class AccountPage extends Vue {
  get user (): UserState {
    return this.$accessor.user;
  }
}

</script>
