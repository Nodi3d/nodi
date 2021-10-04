<template>
  <div v-show="!agreed" class="gdpr" :class="{ invisible: invisible }">
    <p>
      In our website, we will record the website browsing data that using 'Cookie' with Google Analytics. It is a statistical data without identifying personal.
      By continuing to use this site, you are consenting to <a href="https://nodi3d.github.io/docs/user/privacy" target="_blank">our cookie policy</a>.
    </p>
    <a class="button" @click.prevent.stop="agree">Agree</a>
  </div>
</template>

<script lang='ts'>

import { Vue, Component } from 'nuxt-property-decorator';

const key = '__nodi_agreed_cookie_policy__';

@Component({})
export default class GDPR extends Vue {
  agreed: boolean = false;
  invisible: boolean = false;

  beforeMount () {
    this.check();
  }

  check () {
    const item = localStorage.getItem(key);
    this.agreed = (item === 'true');
  }

  agree () {
    this.invisible = true;
    localStorage.setItem(key, 'true'); // can only store strings
  }
}

</script>

<style lang="scss" scoped>

@import '~/assets/styles/foundations/common';

.gdpr {
  z-index: 10000;
  position: fixed;
  width: 100%;
  bottom: 0px;
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 0.9rem;
  @include dark-theme-color();

  padding: 20px;
  box-sizing: border-box;

  &.invisible {
    animation-name: fade-out;
    animation-fill-mode: both;
    animation-duration: .7s;
  }

  p {
    word-break: break-all;
    margin-right: 20px;

    a {
      color: inherit;
      text-decoration: none;
      border-bottom: 1px solid #eee;
    }
  }

  a.button {
    border: 1px solid #ccc;
    border-radius: 4px;
    display: block;
    width: 150px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    flex-shrink: 0;

    background-color: #fff;
    color: #333;
    cursor: pointer;
    &:hover {
      @include dark-hover-color();
    }
  }

}

@include min-screen($breakpoint-size) {
  .gdpr {
    a {
      width: 150px;
    }
  }
}

@include max-screen($breakpoint-size) {
  .gdpr {
    a {
      width: 80px;
    }
  }
}

</style>
