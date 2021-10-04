<template>
  <div>
    <Header />
    <Nuxt />
    <Footer />
    <GDPR />
  </div>
</template>

<script lang="ts">

import { Component, Vue } from 'nuxt-property-decorator';
import Header from '~/components/common/Header.vue';
import Footer from '~/components/common/Footer.vue';
import GDPR from '~/components/common/GDPR.vue';

@Component({
  components: {
    Header, Footer, GDPR
  }
})
export default class DefaultLayout extends Vue {
}

</script>
