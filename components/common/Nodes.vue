<template>
  <ul>
    <li v-for="(name, i) in nodes" :key="i">
      <div>
        <router-link class="f4" :to="`/nodes/${name}`" v-text="name" />
        <p class="">
          {{ description[name] }}
        </p>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">

import { Component, Vue, Prop } from 'nuxt-property-decorator';
import NodeDescription from '~/assets/json/description.json';

@Component({})
export default class Nodes extends Vue {
  @Prop({ type: Array, required: true, default: [] })
  nodes!: string[];

  description: { [index: string]: string } = NodeDescription;
}

</script>
