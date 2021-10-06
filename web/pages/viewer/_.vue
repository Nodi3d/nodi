<template>
  <div>
    <div
      class="d-flex"
      :style="{ height: height + 'px' }"
    >
      <ViewerComponent
        ref="Viewer"
        :width="'100%'"
        :editor="false"
        @boundingboxchanged="onBoundingBoxChanged"
      />
    </div>
    <div v-if="isLoading" class="modal loading d-flex flex-items-center flex-justify-center" style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.2);">
      <Spinner
        :interval="140"
      />
    </div>
    <LogoFooter :is-processing="isProcessing" />
  </div>
</template>

<script lang='ts'>

import { Vue, Component } from 'nuxt-property-decorator';

import axios from 'axios';
import { Box3 } from 'three';
import { Graph } from '@nodi/core';
import SvgLogoWhiteIconOnlyMask from '@/assets/images/logo/logo-white-icon-only-mask.svg?raw';

import Spinner from '~/components/misc/Spinner.vue';

import ViewerComponent from '~/components/viewer/Viewer.vue';
import LogoFooter from '~/components/common/LogoFooter.vue';
import Project from '~/assets/scripts/service/Project';
import { UserState } from '~/store/user';

@Component({
  layout: 'empty',
  components: {
    Spinner,
    ViewerComponent,
    LogoFooter
  }
})
export default class ViewerPage extends Vue {
  $refs!: {
    Viewer: ViewerComponent;
  };

  svg = {
    logoWhiteIconOnlyMask: SvgLogoWhiteIconOnlyMask
  };

  isMobile: boolean = false;
  isLoading: boolean = true;
  isProcessing: boolean = true;
  isDisable: boolean = false;
  isEmpty: boolean = true;
  height: number = window.innerHeight - 30;
  footerHeight: number = 30;

  get isSignIn (): boolean {
    return this.$accessor.user.uid !== undefined;
  }

  get user (): UserState {
    return this.$accessor.user;
  }

  beforeMount (): void {
    window.addEventListener('resize', this.onResizeWindow);
  }

  mounted (): void {
    this.isLoading = true;
    this.$auth.onAuthStateChanged(() => {
      this.initializeProject();
    });
  }

  beforeDestroy (): void {
    window.removeEventListener('resize', this.onResizeWindow);
  }

  async initializeProject (): Promise<void> {
    const { pathMatch } = this.$route.params;
    if (pathMatch.length > 0) {
      try {
        const { project, doc } = await this.$getProject(pathMatch);
        await this.loadProject(project, doc);
      } catch (e) {
        window.alert(e);
      }
    }
    this.isLoading = false;
  }

  async loadProject (project: Project, doc: any): Promise<void> {
    if (project.canView(this.user.uid ?? '')) {
      const graph = new Graph();
      graph.onStartProcess.on(() => {
        this.isProcessing = true;
      });
      graph.onFinishProcess.on(() => {
        this.isProcessing = false;
      });
      graph.onConstructed.on((e) => {
        this.$refs.Viewer.update(e.nodes);
      });

      const { jsonUrl } = project;
      if (jsonUrl !== undefined) {
        const { data } = await axios.get(jsonUrl);
        graph.fromJSON(data);
      } else {
        graph.fromJSON(doc.json ?? {});
      }

      return Promise.resolve();
    }
    return Promise.reject(new Error('You do not have read access to this project'));
  }

  onResizeWindow (): void {
    this.height = (window.innerHeight - this.footerHeight);
  }

  onBoundingBoxChanged (box: Box3): void {
    const isEmpty = box.isEmpty();
    if (this.isEmpty !== isEmpty) {
      this.isEmpty = isEmpty;
      this.$refs.Viewer.resetViewerCamera();
    }
  }
}

</script>
