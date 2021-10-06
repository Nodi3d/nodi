<template>
  <footer>
    <ul>
      <li>
        <router-link to="/">
          © 2020- Nodi
        </router-link>
      </li>
    </ul>
  </footer>
</template>

<script lang='ts'>

import { Vue, Component } from 'nuxt-property-decorator';

@Component({})
export default class Footer extends Vue {
}

</script>

<style lang="scss" scoped>

footer {
  width: 100%;
  height: 24px;
  padding: 3rem 0;

  display: flex;
  align-items: center;

  svg {
    display: inline-block;
    margin-top: 4px;
    width: 80px;
  }

  ul, li {
    list-style: none;
  }

  li {
    margin-left: 8px;

    &:first-child {
      margin-left: 18px;
    }

    a {
      font-size: 0.9rem;
      text-decoration: none;
      cursor: pointer;
      color: #333;
    }
  }
}

</style>
