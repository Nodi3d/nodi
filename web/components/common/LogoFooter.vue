<template>
  <footer class="dark-theme position-absolute p-0 m-0 border-0 overflow-hidden" style="width: 100%; z-index: 2; bottom: 0px;">
    <ul class="d-flex flex-items-center">
      <li class="m-0">
        <router-link to="/" class="step-indicator ml-2 d-block py-1" :class="{ animated: isProcessing }" v-html="svg.logoWhiteOnlyMask" />
      </li>
    </ul>
  </footer>
</template>

<script lang='ts'>

import { Vue, Component, Prop } from 'nuxt-property-decorator';
import SvgLogoWhiteOnlyMask from '@/assets/images/logo/logo-white-only-mask.svg?raw';

@Component({})
export default class LogoFooter extends Vue {
  svg = {
    logoWhiteOnlyMask: SvgLogoWhiteOnlyMask
  };

  @Prop({ type: Boolean, default: false })
  isProcessing!: boolean;
}

</script>

<style lang="scss" scoped>

footer::v-deep svg {
  display: block;
  width: 80px;
}

</style>
