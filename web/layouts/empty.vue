<template>
  <div>
    <Nuxt />
    <GDPR />
  </div>
</template>

<script lang="ts">

import { Component, Vue } from 'nuxt-property-decorator';
import GDPR from '~/components/common/GDPR.vue';

@Component({
  components: {
    GDPR
  }
})
export default class EmptyLayout extends Vue {
}

</script>
