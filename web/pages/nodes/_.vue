<template>
  <div class="example">
    <div class="container p-4">
      <p class="mb-0">
        Reference
      </p>
      <template v-if="node !== null">
        <div class="">
          <h1 class="text-normal" v-text="node.name" />
          <p class="path mb-0" v-text="node.path" />
          <p class="f4">
            {{ node.description }}
          </p>
          <div class="mb-4">
            <h2 class="text-normal">
              Inputs
            </h2>
            <ul>
              <li v-for="(io, i) in node.inputs" :key="i">
                <div class="d-flex">
                  <ul class="d-flex flex-wrap" style="width: 240px;">
                    <li v-for="(type, j) in io.types" :key="j" class="mr-1" style="white-space: nowrap;">
                      <span class="f4" :style="{ backgroundColor: colors[type.toUpperCase()]}">&nbsp;</span>
                      <span class="f4" v-text="type" />
                    </li>
                  </ul>
                  <span class="f4 d-flex flex-items-center" v-text="io.description" />
                </div>
              </li>
            </ul>
          </div>
          <div class="mb-4">
            <h2 class="text-normal">
              Outputs
            </h2>
            <ul>
              <li v-for="(io, i) in node.outputs" :key="i">
                <div class="d-flex">
                  <ul class="d-flex flex-wrap" style="width: 240px;">
                    <li v-for="(type, j) in io.types" :key="j" class="mr-1" style="white-space: nowrap;">
                      <span class="f4" :style="{ backgroundColor: colors[type.toUpperCase()]}">&nbsp;</span>
                      <span class="f4" v-text="type" />
                    </li>
                  </ul>
                  <span class="f4 d-flex flex-items-center" v-text="io.description" />
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="">
          <h1 class="text-normal">
            Examples
          </h1>
          <ul v-if="examples.length > 0">
            <li v-for="(proj, i) in examples" :key="i">
              <div class="d-flex p-2">
                <div
                  class="thumbnail mr-3"
                  :style="{ backgroundImage: `url(${proj.imageUrl})`}"
                />
                <div class="">
                  <span class="f3 mb-2 d-inline-block" v-text="proj.title" />
                  <div class="d-flex">
                    <a class="btn mr-2" :href="`/editor/${proj.id}`" role="button">Open</a>
                    <button class="btn" @click="onCopy(proj)">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <p v-else class="f4">
            No examples found.
          </p>
        </div>
      </template>
      <template v-else>
        <div class="">
          <h1>Not found</h1>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang='ts'>

import { v4 } from 'uuid';
import axios from 'axios';
import { Component, Vue } from 'nuxt-property-decorator';
import { NodeDictionary, DataTypeColors, getTypeNames } from '@nodi/core';

import Spinner from '~/components/misc/Spinner.vue';
import NodeDescription from '~/assets/json/description.json';
import Project, { ProjectJSONType } from '~/assets/scripts/service/Project';
import { Permission } from '~/assets/scripts/service/Permission';

@Component({
  components: {
    Spinner
  }
})
export default class NodeExamplePage extends Vue {
  colors: { [index: string]: string } = DataTypeColors;
  node: {
    name: string;
    path: string;
    description: string;
    inputs: {
      types: string[];
      description: string;
    }[];
    outputs: {
      types: string[];
      description: string;
    }[];
  } | null = null;

  examples: Project[] = [];

  async mounted () {
    const { pathMatch } = this.$route.params;
    const dictionary = NodeDictionary;
    const keys = Object.keys(dictionary);
    const values = Object.values(dictionary);
    const index = values.findIndex(value => value.name === pathMatch);
    if (index >= 0) {
      const node = values[index];
      const constructor = node.entity;
      const instance = new constructor(v4());
      const inputs = instance.inputManager.inputs;
      const outputs = instance.outputManager.outputs;
      this.node = {
        name: node.name,
        path: keys[index],
        description: NodeDescription[node.name],
        inputs: inputs.map((io) => {
          return {
            types: getTypeNames(io.getDataType()),
            description: io.getDescription()
          };
        }),
        outputs: outputs.map((io) => {
          return {
            types: getTypeNames(io.getDataType()),
            description: io.getDescription()
          };
        })
      };

      this.examples = await this.search(node.name);
    }
  }

  async search (node: string, limit: number = 8): Promise<Project[]> {
    const query = this.$firestore
      .collection('graph')
      .where('permission', '>=', Permission.PUBLIC_READ)
      .where('nodes', 'array-contains', node)
      .where('deleted', '==', false)
      .limit(limit);

    const snapshot = await query.get();
    const projects = snapshot.docs.map((doc) => {
      const id = doc.ref.id;
      const json = doc.data();
      const graph = new Project();
      graph.fromJSON(id, json as ProjectJSONType);
      return graph;
    });
    return Promise.resolve(projects);
  }

  async onCopy (proj: Project): Promise<void> {
    const { data } = await axios.get(proj.jsonUrl);
    window.navigator.clipboard.writeText(JSON.stringify(data.nodes));
  }
}

</script>

<style lang="scss" scoped>

.thumbnail {
  width: 320px;
  height: 180px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}

</style>
