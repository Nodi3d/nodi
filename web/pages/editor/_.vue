<template>
  <div
    id="editor"
    class="overflow-hidden"
  >
    <div
      @mousemove="onMouseMove($event)"
      @mouseup="onMouseUp($event)"
    >
      <ul
        class="menu border-0 dark-theme mb-0 rounded-0 d-flex flex-justify-start flex-items-center"
        :style="{ height: menuHeight + &quot;px&quot; }"
      >
        <li class="ml-4 mr-4">
          <a class="color-fg-on-emphasis cursor-pointer" @click.prevent.stop="openDrawer" v-html="svg.menu" />
        </li>
        <li class="mr-3">
          <div class="step-indicator d-flex flex-items-center" :class="{ animated: isProcessing }" v-html="svg.logoWhiteIconOnlyMask" />
        </li>
        <li>
          <Title :project="project" :is-mobile="isMobile" />
        </li>
        <li v-show="!isMobile">
          <FileMenu
            :project="project"
            :dark="true"
            @filenew="onFileNew"
            @fileopen="onFileOpen"
            @filesave="onFileSave"
            @filefork="onFileFork"
            @fileshare="onFileShare"
            @filedownload="onFileDownload"
          />
        </li>
        <li v-show="!isMobile">
          <EditMenu ref="EditMenu" :dark="true" />
        </li>
        <li v-show="!isMobile">
          <ViewMenu ref="ViewMenu" :dark="true" />
        </li>
        <li v-show="!isMobile">
          <HelpMenu :dark="true" />
        </li>
        <li v-if="!isMobile" class="d-flex flex-items-center dark-theme-hover" style="height: 100%;">
          <a class="button no-underline px-3 color-fg-on-emphasis" href="https://nodi3d.github.io/docs/user/examples" target="blank">
            Examples
          </a>
        </li>
        <li style="margin-left: auto;">
          <UserMenu :dark="true" />
        </li>
      </ul>
      <FileDrawer ref="FileDrawer" @copy="onFileCopy" @load="onFileLoad" />
      <ShareWindow ref="ShareWindow" :project="project" @share="onShare" />
      <div v-show="isLoading" class="modal loading">
        <Spinner
          :interval="140"
        />
      </div>
      <div
        class="nodi-container d-flex"
        :class="{ dragging: isDragging, disable: (isLoading || isDisable) }"
        :style="{ height: editorHeight + 'px' }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <div
          ref="editor"
          class="nodi-editor"
          :class="{ mobile: isMobile }"
          :style="{ width: editorWidth }"
        >
          <span v-show="isMobile && isEditor" class="message-on-mobile">Not editable on mobile</span>
          <span class="message-on-mobile">{{ state }}</span>
        </div>
        <template v-if="!isMobile">
          <div class="resizer overflow-hidden">
            <div
              class="handle position-absolute"
              :style="{ height: editorHeight + 'px' }"
              @mousedown.prevent="onResizeStart($event)"
            />
          </div>
        </template>
        <template v-else>
          <div class="switcher">
            <a class="handle" @click.prevent="" @click.prevent.stop="toggleDisplay" v-html="isEditor ? svg.chevronLeft : svg.chevronRight" />
          </div>
        </template>
        <ViewerComponent
          ref="Viewer"
          :width="viewerWidth"
          :editor="true"
        />
      </div>
      <NodeSearchTooltip
        ref="NodeSearchTooltip"
        @dragstart="onDragTooltipStart"
        @dragend="onDragTooltipEnd"
        @hidden="onDragTooltipEnd"
        @select="onSelectNodeTooltip"
      />
      <NodeInspectorTooltip
        ref="NodeInspectorTooltip"
        @dragstart="onDragTooltipStart"
        @dragend="onDragTooltipEnd"
        @hidden="onDragTooltipEnd"
      />
      <IOInspectorTooltip
        ref="IOInspectorTooltip"
        @dragstart="onDragTooltipStart"
        @dragend="onDragTooltipEnd"
        @hidden="onDragTooltipEnd"
      />
      <IOContextTooltip
        ref="IOContextTooltip"
        @dragstart="onDragTooltipStart"
        @dragend="onDragTooltipEnd"
        @hidden="onDragTooltipEnd"
        @disconnect="onDisconnect"
        @relay="onRelay"
      />
      <NodeContextTooltip
        ref="NodeContextTooltip"
        @dragstart="onDragTooltipStart"
        @dragend="onDragTooltipEnd"
        @hidden="onDragTooltipEnd"
        @enable="onEnable"
        @disable="onDisable"
        @previewon="onPreviewOn"
        @previewoff="onPreviewOff"
        @zoom="onZoom"
        @group="onGroup"
      />
      <GroupContextTooltip
        ref="GroupContextTooltip"
        @dragstart="onDragTooltipStart"
        @dragend="onDragTooltipEnd"
        @hidden="onDragTooltipEnd"
        @ungroup="onUngroup"
        @addtogroup="onAddToGroup"
        @removefromgroup="onRemoveFromGroup"
      />
      <GraphSearchTooltip
        ref="GraphSearchTooltip"
        @dragstart="onDragTooltipStart"
        @dragend="onDragTooltipEnd"
        @hidden="onDragTooltipEnd"
        @select="onFocus"
      />
    </div>
    <LogoFooter :is-processing="isProcessing" />
  </div>
</template>

<script lang='ts'>

import { Vue, Component } from 'nuxt-property-decorator';

import { Vector2 } from 'three';

import axios from 'axios';
import octicons from '@primer/octicons';
import isMobile from 'ismobilejs';

import { v4 } from 'uuid';
import { GroupElement, GraphJSONType, NodeConstructorType } from '@nodi/core';
import SvgLogoWhiteIconOnlyMask from '@/assets/images/logo/logo-white-icon-only-mask.svg?raw';
import Editor from '~/assets/scripts/editor/Editor';

import Spinner from '~/components/misc/Spinner.vue';
import LogoFooter from '~/components/common/LogoFooter.vue';

import FileDrawer from '~/components/editor/FileDrawer.vue';
import Title from '~/components/editor/header/Title.vue';
import FileMenu from '~/components/editor/header/FileMenu.vue';
import EditMenu from '~/components/editor/header/EditMenu.vue';
import ViewMenu from '~/components/editor/header/ViewMenu.vue';
import HelpMenu from '~/components/editor/header/HelpMenu.vue';
import UserMenu from '~/components/editor/header/UserMenu.vue';

import Tooltip from '~/components/editor/Tooltip.vue';
import ViewerComponent from '~/components/viewer/Viewer.vue';
import NodeSearchTooltip from '~/components/editor/NodeSearchTooltip.vue';
import NodeInspectorTooltip from '~/components/editor/NodeInspectorTooltip.vue';
import NodeContextTooltip from '~/components/editor/NodeContextTooltip.vue';
import IOInspectorTooltip from '~/components/editor/IOInspectorTooltip.vue';
import IOContextTooltip, { DisconnectionType } from '~/components/editor/IOContextTooltip.vue';
import GroupContextTooltip from '~/components/editor/GroupContextTooltip.vue';
import GraphSearchTooltip from '~/components/editor/GraphSearchTooltip.vue';
import ShareWindow from '~/components/editor/ShareWindow.vue';
import IOView from '~/assets/scripts/editor/views/IOView';
import Project, { ProjectJSONType } from '~/assets/scripts/service/Project';
import { UserState } from '~/store/user';
import { KeyCodeStrings } from '~/assets/scripts/editor/misc/KeyCodes';

const defaultEditorWidth = 65;

let editor: Editor;

@Component({
  layout: 'empty',
  components: {
    Spinner,
    LogoFooter,
    FileDrawer,
    Title,
    FileMenu,
    EditMenu,
    ViewMenu,
    HelpMenu,
    UserMenu,
    ViewerComponent,
    NodeSearchTooltip,
    NodeInspectorTooltip,
    NodeContextTooltip,
    IOInspectorTooltip,
    IOContextTooltip,
    GroupContextTooltip,
    GraphSearchTooltip,
    ShareWindow
  }
})
export default class EditorPage extends Vue {
  $refs!: {
    editor: HTMLDivElement;
    Viewer: ViewerComponent;
    FileDrawer: FileDrawer;
    EditMenu: EditMenu;
    ViewMenu: ViewMenu;
    NodeSearchTooltip: NodeSearchTooltip;
    NodeInspectorTooltip: NodeInspectorTooltip;
    NodeContextTooltip: NodeContextTooltip;
    IOInspectorTooltip: IOInspectorTooltip;
    IOContextTooltip: IOContextTooltip;
    GroupContextTooltip: GroupContextTooltip;
    GraphSearchTooltip: GraphSearchTooltip;
    ShareWindow: ShareWindow;
  };

  svg = {
    menu: octicons['three-bars'].toSVG({
      fill: '#fff',
      stroke: '#fff'
    }),
    chevronRight: octicons['chevron-right'].toSVG({
      stroke: '#000'
    }),
    chevronLeft: octicons['chevron-left'].toSVG({
      stroke: '#000'
    }),
    logoWhiteIconOnlyMask: SvgLogoWhiteIconOnlyMask
  };

  isMobile: boolean = false;
  isEditor: boolean = true; // editor or viewer flag in mobile mode

  isLoading: boolean = true;
  isDisable: boolean = false;
  isDragging: boolean = false;
  isResizing: boolean = false;
  isProcessing: boolean = false;
  state: string = '';
  position: Vector2 = new Vector2();
  menuHeight: number = 30;
  footerHeight: number = 30;
  editorHeight: number = window.innerHeight - 60;
  offset: number = 0;
  editorWidth: string = `${defaultEditorWidth}%`;
  viewerWidth: string = `${100 - defaultEditorWidth}%`;
  draggingTooltip: Tooltip | null = null;

  project: Project = new Project();

  get isSignIn (): boolean {
    return this.$accessor.user.uid !== undefined;
  }

  get user (): UserState {
    return this.$accessor.user;
  }

  beforeMount (): void {
    window.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
    window.addEventListener('keydown', this.onKeyDownWindow);
    window.addEventListener('resize', this.onResizeWindow);
    window.addEventListener('scroll', this.onScroll);

    // disable zoom in mobile environment
    document.addEventListener('gesturestart', this.onGesture);
    document.documentElement.style.overflow = document.body.style.overflow = 'hidden';

    this.isMobile = isMobile(window.navigator).phone || isMobile(window.navigator).tablet;
    if (this.isMobile) {
      this.toggleDisplay();
    }
  }

  beforeDestroy (): void {
    window.removeEventListener('keydown', this.onKeyDownWindow);
    window.removeEventListener('resize', this.onResizeWindow);
    window.removeEventListener('scroll', this.onScroll);
    document.removeEventListener('gesturestart', this.onGesture);

    editor.dispose();
    document.documentElement.style.overflow = document.body.style.overflow = '';
  }

  destroyed (): void {
  }

  mounted (): void {
    editor = new Editor(this.$refs.editor);
    this.editorHeight = (window.innerHeight - (this.menuHeight + this.footerHeight));

    editor.onNodeSearch.on((e) => {
      const { clientX, clientY } = e;
      this.$refs.NodeSearchTooltip.show(new Vector2(clientX, clientY));
    });
    editor.onNodeInspector.on((arg) => {
      const { clientX, clientY } = arg.e;
      const node = arg.view.getNode();
      this.$refs.NodeInspectorTooltip.setup(node);
      this.$refs.NodeInspectorTooltip.show(new Vector2(clientX + 2, clientY + 2)); // to avoid context menu
    });
    editor.onNodeContext.on((e) => {
      const { clientX, clientY } = e;
      this.$refs.NodeContextTooltip.show(new Vector2(clientX + 2, clientY + 2)); // to avoid context menu
    });
    editor.onIOInspector.on((arg) => {
      const { clientX, clientY } = arg.e;
      const node = arg.node.getNode();
      const io = arg.io.getIO();
      this.$refs.IOInspectorTooltip.setup(node, io);
      this.$refs.IOInspectorTooltip.show(new Vector2(clientX + 2, clientY + 2)); // to avoid context menu
    });
    editor.onIOInspectorOut.on(() => {
      this.$refs.IOInspectorTooltip.hide();
    });
    editor.onIOContext.on((arg) => {
      const { clientX, clientY } = arg.e;
      this.$refs.IOInspectorTooltip.hide();
      this.$refs.IOContextTooltip.setup(arg.io, arg.edges);
      this.$refs.IOContextTooltip.show(new Vector2(clientX + 2, clientY + 2));
    });
    editor.onGroupContext.on((arg) => {
      const { clientX, clientY } = arg.e;
      this.$refs.GroupContextTooltip.setup(arg.view.getGroup());
      this.$refs.GroupContextTooltip.show(new Vector2(clientX + 2, clientY + 2));
    });

    editor.onStartProcess.on(() => {
      this.isProcessing = true;
    });
    editor.onFinishProcess.on(() => {
      this.isProcessing = false;
    });
    editor.onConstructed.on((e) => {
      this.$refs.Viewer.update(e.nodes);
    });
    editor.onLoadedGraph.on((_) => {
      this.$refs.Viewer.resetViewerCamera();
      editor.onFinishProcess.once(() => {
        this.$nextTick(() => {
          editor.setEntireView();
          this.$refs.Viewer?.resetViewerCamera();
        });
      });
    });

    this.$refs.EditMenu.$on('undo', () => { editor.undo(); });
    this.$refs.EditMenu.$on('redo', () => { editor.redo(); });
    this.$refs.EditMenu.$on('copy', () => { editor.copySelectedNodesToClipboard(); });
    this.$refs.EditMenu.$on('paste', () => { editor.pasteNodesFromClipboard(); });
    this.$refs.EditMenu.$on('delete', () => { editor.removeSelectedNodesCmd(); });
    this.$refs.EditMenu.$on('selectall', () => { editor.selectAllNodes(); });
    this.$refs.EditMenu.$on('search', () => { editor.redo(); });

    this.$refs.ViewMenu.$on('entire', () => { editor.setEntireView(); });
    this.$refs.ViewMenu.$on('preview', () => { editor.togglePreview(); });
    this.$refs.ViewMenu.$on('performance', () => { editor.togglePerformance(); });

    // setInterval(() => { this.state = editor.state.constructor.name; }, 100); // debug ui state

    this.$auth.onAuthStateChanged(() => {
      this.initializeProject();
    });
  }

  private onKeyDownWindow (e: KeyboardEvent): void {
    if (e.key === KeyCodeStrings.TAB) {
      const path = e.composedPath();
      if (path.length <= 0 || path[0] === document.body) {
        const mouse = editor.prevMousePosition;
        this.$refs.NodeSearchTooltip.show(new Vector2(mouse.x, mouse.y));
      }
    } else if (e.ctrlKey && e.key === KeyCodeStrings.f) {
      this.$refs.GraphSearchTooltip.setup(editor.nodes);
      this.$refs.GraphSearchTooltip.show();
    } else if (e.ctrlKey && e.key === KeyCodeStrings.n) {
      this.onFileNew();
      e.preventDefault();
      e.stopPropagation();
    } else if (e.ctrlKey && e.key === KeyCodeStrings.o) {
      this.onFileOpen();
      e.preventDefault();
      e.stopPropagation();
    } else if (e.ctrlKey && e.key === KeyCodeStrings.s) {
      this.onFileSave();
      e.preventDefault();
      e.stopPropagation();
    }
  }

  async initializeProject (): Promise<void> {
    const { pathMatch } = this.$route.params;
    if (pathMatch.length > 0) {
      try {
        const { project, doc } = await this.$getProject(pathMatch);
        await this.loadProject(project, doc);
      } catch (e) {
        window.alert(e);
        // eslint-disable-next-line no-console
        console.warn(e);
      }
    }

    this.isLoading = false;
  }

  onResizeWindow (): void {
    this.editorHeight = (window.innerHeight - (this.menuHeight + this.footerHeight));
  }

  onScroll () {
    window.scrollTo(0, 0);
  }

  onGesture (e: any) {
    e.preventDefault();
  }

  onResizeStart (e: MouseEvent): void {
    this.isResizing = true;
    this.position.x = e.screenX;
    this.position.y = e.screenY;
  }

  toggleDisplay () {
    this.isEditor = !this.isEditor;
    if (this.isEditor) {
      this.editorWidth = '100%';
      this.viewerWidth = '0%';
    } else {
      this.editorWidth = '0%';
      this.viewerWidth = '100%';
    }
  }

  onMouseMove (e: MouseEvent) {
    if (this.isResizing) {
      const dx = e.screenX - this.position.x;
      this.resize(dx);
    } else if (this.draggingTooltip !== null) {
      this.draggingTooltip.drag(e);
    }
  }

  onMouseUp (e: MouseEvent) {
    if (this.isResizing) {
      const dx = e.screenX - this.position.x;
      this.offset = this.resize(dx);
    }
    this.isResizing = false;
  }

  resize (dx: number): number {
    let offset = this.offset + dx;
    const ew = window.innerWidth * (defaultEditorWidth / 100);
    const vw = window.innerWidth * ((100 - defaultEditorWidth) / 100);
    const threshold = 200;

    if (ew + offset < threshold) {
      offset = Math.sign(offset) * (ew - threshold);
    } else if (vw - offset < threshold) {
      offset = Math.sign(offset) * (vw - threshold);
    }

    this.editorWidth = `calc(${defaultEditorWidth}% + ${offset}px)`;
    this.viewerWidth = `calc(${100 - defaultEditorWidth}% - ${offset}px)`;
    // viewer.resize()

    return offset;
  }

  pushState (id: string): void {
    this.$router.push({
      path: `/editor/${id}`
    });
  }

  newProject (): void {
    if (this.checkTransition()) {
      this.pushState('');
    }
  }

  async loadProject (project: Project, doc: any): Promise<void> {
    if (project.canView(this.user.uid ?? '')) {
      if (project.jsonUrl !== undefined) {
        const { data } = await axios.get(project.jsonUrl);
        editor.loadGraph(data);
      } else {
        editor.loadGraph(doc.json ?? {});
      }
      this.project = project;

      return Promise.resolve();
    }

    return Promise.reject(new Error('You do not have read access to this project'));
  }

  openProject (id: string, pushState: boolean = false): Promise<void> {
    if (this.checkTransition()) {
      this.clearProject();
      this.isLoading = true;
      try {
        if (pushState) {
          this.pushState(id);
        }
      } catch (e) {
        window.alert(e);
      } finally {
        this.isLoading = false;
      }
    }
    return Promise.resolve();
  }

  clearProject (): void {
    this.project = new Project();
    editor.clear();
  }

  onDragTooltipStart (_: any, tooltip: Tooltip): void {
    this.draggingTooltip = tooltip;
  }

  onDragTooltipEnd (_: any, _tooltip: Tooltip): void {
    this.draggingTooltip = null;
  }

  onSelectNodeTooltip (node: NodeConstructorType, clicked: boolean, e: MouseEvent): void {
    let position = this.$refs.NodeSearchTooltip.position;
    if (clicked) {
      position = new Vector2(e.clientX, e.clientY);
    }
    editor.selectNodeConstructor(node, position);
    this.$refs.NodeSearchTooltip.hide();
  }

  onDisconnect (args: DisconnectionType[]) {
    editor.disconnect(args);
  }

  onRelay (io: IOView) {
    editor.relay(io);
  }

  onEnable (): void {
    editor.selectedNodes.forEach(n => n.enable());
  }

  onDisable (): void {
    editor.selectedNodes.forEach(n => n.disable());
  }

  onPreviewOn (): void {
    editor.setPreview(true);
  }

  onPreviewOff (): void {
    editor.setPreview(false);
  }

  onGroup (): void {
    editor.group();
  }

  onZoom (): void {
  }

  onUngroup (group: GroupElement): void {
    editor.ungroup(group);
  }

  onAddToGroup (group: GroupElement): void {
    editor.addToGroup(group, editor.selectedNodes.map(n => n.uuid));
  }

  onRemoveFromGroup (group: GroupElement): void {
    editor.removeFromGroup(group, editor.selectedNodes.map(n => n.uuid));
  }

  onFocus (e: { uuid: string; name: string }): void {
    editor.focus(e.uuid);
  }

  onDragOver (): void {
    this.isDragging = true;
  }

  onDragLeave (): void {
    this.isDragging = false;
  }

  async onDrop (e: DragEvent): Promise<void> {
    this.isDragging = false;

    const files = e.dataTransfer?.files;
    if (files !== undefined && files.length > 0) {
      const file = files[0];
      const name = file.name;
      const type = file.type;
      if (type !== 'application/json') { return; }

      const json = await this.readJSONFile(file);
      editor.loadGraph(json as GraphJSONType);
    }
  }

  readJSONFile (file: File): Promise<any> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', (e) => {
        const json = JSON.parse(reader.result as string);
        resolve(json);
      });
      reader.readAsText(file);
    });
  }

  checkTransition (): boolean {
    return !editor.hasHistory() || window.confirm('Unsaved data will be lost. Are you sure you want to open?');
  }

  async saveProject (): Promise<void> {
    const graph = editor.toJSON();
    const image = this.$refs.Viewer.capture() as Blob;

    this.isLoading = true;
    if (this.project.id === '') {
      this.project = await this.createProjectStore(this.project, graph, image);
      history.replaceState(null, '', `/editor/${this.project.id}`);
    } else {
      this.project = await this.updateProjectStore(this.project, graph, image);
    }
    this.isLoading = false;
  }

  async forkProject (): Promise<void> {
    const graph = editor.toJSON();
    const image = this.$refs.Viewer.capture() as Blob;

    this.isLoading = true;
    this.project = await this.forkProjectStore(this.project, graph, image);
    this.pushState(this.project.id);
    this.isLoading = false;
  }

  async createProjectStore (proj: Project, json: GraphJSONType, image: Blob): Promise<Project> {
    proj.nodes = this.getNodeNames(json);
    proj.uid = this.$accessor.user.uid as string;
    proj.deleted = false;
    proj.timestamp = this.$getTimestamp();

    proj.imageUrl = await this.uploadImage(image);
    proj.jsonUrl = await this.uploadGraphJSON(json);

    const ref = await this.$firestore.collection('graph').add(proj.toJSON());
    proj.id = ref.id;
    return Promise.resolve(proj);
  }

  async updateProjectStore (proj: Project, json: GraphJSONType, image: Blob): Promise<Project> {
    proj.nodes = this.getNodeNames(json);
    proj.timestamp = this.$getTimestamp();

    proj.imageUrl = await this.uploadImage(image, proj.id);
    proj.jsonUrl = await this.uploadGraphJSON(json, proj.id);

    const doc = await this.$firestore.collection('graph').doc(proj.id).get();
    await doc.ref.update(proj.toJSON());

    return Promise.resolve(proj);
  }

  async forkProjectStore (proj: Project, json: GraphJSONType, image: Blob): Promise<Project> {
    proj.title += ' copy';
    proj.fork = proj.id;
    proj.nodes = this.getNodeNames(json);
    proj.uid = this.$accessor.user.uid as string;
    proj.deleted = false;
    proj.timestamp = this.$getTimestamp();

    proj.imageUrl = await this.uploadImage(image);
    proj.jsonUrl = await this.uploadGraphJSON(json);

    const ref = await this.$firestore.collection('graph').add(proj.toJSON());
    proj.id = ref.id;
    return Promise.resolve(proj);
  }

  async uploadFile (folder: string, data: Blob, ext: string, name: string | undefined = undefined): Promise<string> {
    if (name === undefined) {
      name = v4();
    }
    const path = `${folder}/${name}.${ext}`;
    const snapshot = await this.$storage.ref(path).put(data);
    return snapshot.ref.getDownloadURL();
  }

  uploadImage (image: Blob, name: string | undefined = undefined): Promise<string> {
    return this.uploadFile('images', image, 'png', name);
  }

  uploadGraphJSON (json: GraphJSONType, name: string | undefined = undefined): Promise<string> {
    const str = JSON.stringify(json);
    const blob = new Blob([str], { type: 'application/json' });
    return this.uploadFile('graphs', blob, 'json', name);
  }

  getNodeNames (json: GraphJSONType): string[] {
    const nodes: string[] = [];
    json.nodes.forEach((n) => {
      if (!nodes.includes(n.name)) {
        nodes.push(n.name);
      }
    });
    return nodes;
  }

  openDrawer (): void {
    this.$refs.FileDrawer.show();
  }

  onFileNew (): void {
    this.newProject();
  }

  onFileOpen (): void {
    this.openDrawer();
  }

  async onFileSave (): Promise<void> {
    if (this.isSignIn) {
      const editable = this.project.canEdit(this.$accessor.user.uid ?? '');
      if (editable) {
        await this.saveProject();
      } else {
        window.alert('You do not have write access to this project.');
      }
    } else {
      await this.$accessor.user.signIn();
    }
  }

  onFileFork (): void {
    if (this.isSignIn) {
      this.forkProject();
    } else {
      this.$accessor.user.signIn();
    }
  }

  onFileShare (): void {
    this.$refs.ShareWindow.show();
    this.$refs.ShareWindow.setup();
  }

  onFileDownload (): void {
    const title = this.project.title;
    const graph = editor.toJSON();
    const json = JSON.stringify(graph);
    const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(json);

    const a = document.createElement('a');
    const e = document.createEvent('MouseEvent');

    a.download = `${title}.json`;
    a.href = url;

    e.initEvent('click', true, true);
    a.dispatchEvent(e);
  }

  onFileCopy (file: Project): void {
  }

  onFileLoad (file: Project): void {
    this.openProject(file.id, true);
  }

  async onShare (): Promise<void> {
    await this.onFileSave();
    this.$refs.ShareWindow.setup();
  }
}

</script>

<style lang="scss" scoped>

.nodi-container {
  &.dragging:before {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, .35);
    border: 2px dashed #080808;

    user-select: none;
    pointer-events: none;
    z-index: 100;
  }

  &.dragging:after {
    content: "Import file";
    color: #f5f5f5;
    font-size: 50px;

    display: block;
    position: absolute;
    text-align: center;
    top: 45%;
    right: 0;
    left: 0;

    user-select: none;
    pointer-events: none;
    z-index: 101;
  }
}

.nodi-container ::v-deep .nodi-editor {
  z-index: 1;
}

.nodi-container ::v-deep .resizer {
  z-index: 100;
}

.nodi-container ::v-deep .nodi-viewer {
  z-index: 0;
}

.step-indicator ::v-deep svg {
  width: 22px;
}

.resizer {
  width: 2px;
  background-color: #ccc;

  .handle {
    z-index: 1;
    width: 6px;
    transform: translate(-3px);
    cursor: col-resize;
  }
}

.switcher {
  z-index: 1;
  $switcher-width: 24px;
  width: $switcher-width;
  background-color: #eee;
  overflow: visible;

  .handle {
    width: $switcher-width;
    height: 100%;
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;
  }
}

</style>

<style lang="scss">

@import "@/assets/styles/editor.scss";

</style>
