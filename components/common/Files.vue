<template>
  <div
    class="files"
  >
    <template v-if="projects.length > 0">
      <ul class="d-flex flex-row flex-wrap">
        <li v-for="(project, idx) in projects" :key="idx" class="project d-inline-block p-4 rounded-1" :class="{ selected: project === selected }">
          <div
            class="thumbnail"
            :style="{ backgroundImage: 'url(' + project.imageUrl + ')'}"
            @click="onClick($event, project)"
            @dblclick.prevent.stop="onDblClick($event, project)"
            @contextmenu.prevent.stop="onContextMenu($event, project)"
          />
          <div class="p-2">
            <div class="d-flex flex-items-center">
              <div v-show="isPrivate(project)" class="d-inline-block mr-1" v-html="svg.lock" />
              <span class="no-user-select truncate d-inline-block text-small" style="">{{ project.title }}</span>
            </div>
            <span v-if="project.owner" class="mt-1 truncate text-small truncate">{{ project.owner.name }}</span>
            <span class="text-small text-gray d-block mt-1" v-text="'Updated ' + dateFormat(project.timestamp)" />
          </div>
        </li>
      </ul>
    </template>
    <template v-else>
      <div v-show="isLoading" class="indicator">
        <Spinner />
      </div>
      <div v-show="!isLoading" class="placeholder">
        <p>No data found</p>
      </div>
    </template>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'nuxt-property-decorator';
import octicons from '@primer/octicons';
import { format } from 'timeago.js';

import Spinner from '../misc/Spinner.vue';

import { Permission } from '~/assets/scripts/service/Permission';
import Project from '~/assets/scripts/service/Project';

@Component({
  components: {
    Spinner
  }
})
export default class Files extends Vue {
  @Prop({ type: Boolean, required: false, default: true })
  isLoading!: boolean;

  @Prop({ type: Object, required: false, default: null })
  selected?: Project;

  @Prop({ type: Array, required: false, default: [] })
  projects!: any[];

  svg = {
    lock: octicons.lock.toSVG({
      stroke: '#fff'
    })
  };

  dateFormat (timestamp: { seconds: number }): string {
    const d = new Date(1970, 0, 1);
    d.setSeconds(timestamp.seconds);
    return format(d);
  }

  isPrivate (project: Project): boolean {
    return project.permission === Permission.PRIVATE;
  }

  onClick (e: MouseEvent, project: Project): void {
    this.$emit('click', e, project);
  }

  onDblClick (e: MouseEvent, project: Project): void {
    this.$emit('dblclick', e, project);
  }

  onContextMenu (e: MouseEvent, project: Project) {
    this.$emit('contextmenu', e, project);
  }
}

</script>

<style lang="scss" scoped>

@import '~/assets/styles/foundations/common';

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

.project {

  border: 1px solid transparent;
  border-radius: 2px;
  border-collapse: collapse;

  &.selected {
    border: 1px solid #ccc;
  }

  .thumbnail {
    position: relative;
    height: 180px;

    background-color: #fff;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
  }

}

@include min-screen($breakpoint-size) {
  .project {
    flex-basis: calc(100% / 3 - 1px);
  }
}

@include max-screen($breakpoint-size) {
  .project {
    flex-basis: 50%;
  }
}

</style>
