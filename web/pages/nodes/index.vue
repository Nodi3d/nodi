<template>
  <div class="nodes">
    <div class="container p-4">
      <Nodes :nodes="nodes" />
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'nuxt-property-decorator';
import { NodeDictionary } from '@nodi/core';

import Spinner from '~/components/misc/Spinner.vue';
import Nodes from '~/components/common/Nodes.vue';

@Component({
  components: {
    Spinner,
    Nodes
  }
})
export default class NodesPage extends Vue {
  nodes: string[] = [];

  mounted () {
    const keys = Object.keys(NodeDictionary);
    this.nodes = keys.map((k) => {
      const name = NodeDictionary[k].name;
      return name;
    });
  }
}

</script>
