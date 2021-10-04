<template>
  <div
    v-show="isVisible"
    ref="Root"
    class="share position-absolute px-4 py-4"
  >
    <div v-if="project !== null" class="items">
      <div class="header pb-2">
        <h1 class="f3 text-normal">
          Share {{ project.title }}
        </h1>
      </div>
      <div class="item pb-2">
        <div class="permission">
          <select v-model="group" class="group form-select text-small">
            <option :value="PermissionGroup.PUBLIC">
              Anyone with the link
            </option>
            <option :value="PermissionGroup.PRIVATE">
              Private
            </option>
          </select>
          <select v-if="project.permission !== Permission.PRIVATE" v-model="operation" style="width: 106px;" class="d-inline-block form-select text-small">
            <option :value="PermissionOperation.READONLY">
              can view
            </option>
            <option :value="PermissionOperation.WRITE">
              can edit
            </option>
          </select>
        </div>
      </div>
      <div class="item pb-2">
        <div class="invite">
          <div>
            <input v-model="invitationEmail" class="form-control" type="text" placeholder="invite a collaborator by email..." @input="onInput">
            <p v-show="invitationErrorMessage.length > 0" class="error">
              {{ invitationErrorMessage }}
            </p>
          </div>
          <button class="btn btn-primary" style="width: 106px;" :disabled="isSearching || invitationUID.length === 0" @click="invite">
            <Spinner v-show="isSearching" />
            Invite
          </button>
        </div>
      </div>
      <ul class="item collaborators">
        <li v-for="(collaborator, idx) in collaborators" :key="idx" class="pb-2 px-1">
          <Collaborator :user="collaborator" @change="changeMemberPermission" @remove="removeMember" />
        </li>
      </ul>
      <div class="item flex-justify-between mt-2">
        <button
          v-show="project.id !== null"
          ref="CopyEditorLinkButton"
          class="btn d-inline-flex flex-items-center flex-justify-center mx-0"
          :class="{ 'tooltipped tooltipped-s': copied }"
          :data-clipboard-text="projectEditorLink"
          aria-label="copied!"
          title="copy editor link"
          @mouseleave="onMouseLeave"
        >
          <span class="ml-n1 mr-1 d-inline-flex flex-items-center" v-html="svg.link" />
          <span>Editor</span>
        </button>
        <button
          v-show="project.id !== null"
          ref="CopyViewerLinkButton"
          class="btn d-inline-flex flex-items-center flex-justify-center mx-0"
          :class="{ 'tooltipped tooltipped-s': copied }"
          :data-clipboard-text="projectViewerLink"
          aria-label="copied!"
          title="copy viewer link"
          @mouseleave="onMouseLeave"
        >
          <span class="ml-n1 mr-1 d-inline-flex flex-items-center" v-html="svg.link" />
          <span>Viewer</span>
        </button>
        <button class="btn btn-primary mx-0" @click.prevent="share">
          Share
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import octicons from '@primer/octicons';
import ClipboardJS from 'clipboard';
import { Vue, Component, Prop } from 'nuxt-property-decorator';
import Collaborator from './Collaborator.vue';
import Spinner from '@/components/misc/Spinner.vue';
import Project from '~/assets/scripts/service/Project';
import { CollaboratorType } from '~/assets/scripts/service/CollaboratorType';
import { Permission, PermissionGroup, PermissionOperation } from '~/assets/scripts/service/Permission';
import { getGroup, getOperation, makeReadOnly, makeWritable, makePrivate, makePublic } from '~/assets/scripts/service/PermissionUtils';

@Component({
  components: {
    Spinner,
    Collaborator
  }
})
export default class ShareWindow extends Vue {
  isVisible: boolean = false;

  Permission: any = Permission;
  PermissionGroup: any = PermissionGroup;
  PermissionOperation: any = PermissionOperation;
  collaborators: CollaboratorType[] = [];
  isSearching: boolean = false;
  invitationEmail: string = '';
  invitationErrorMessage: string = '';
  invitationUID: string = '';

  copied: boolean = false;
  svg: any = {
    link: octicons.link.toSVG({
      width: '12px',
      fill: '#ccc'
    })
  };

  debouncedSearch?: NodeJS.Timeout;

  $refs!: {
    Root: HTMLDivElement;
    CopyEditorLinkButton: HTMLButtonElement;
    CopyViewerLinkButton: HTMLButtonElement;
  };

  @Prop({ type: Object })
  project!: Project;

  get group (): number {
    return getGroup(this.project.permission);
  }

  set group (v: number) {
    switch (v) {
      case PermissionGroup.PRIVATE:
        this.project.permission = makePrivate(this.project.permission);
        break;
      case PermissionGroup.PUBLIC:
        this.project.permission = makePublic(this.project.permission);
        break;
    }
  }

  get operation () {
    return getOperation(this.project.permission);
  }

  set operation (v) {
    switch (v) {
      case PermissionOperation.READONLY:
        this.project.permission = makeReadOnly(this.project.permission);
        break;
      case PermissionOperation.WRITE:
        this.project.permission = makeWritable(this.project.permission);
        break;
    }
  }

  get projectEditorLink (): string {
    const href = this.$router.resolve(`/editor/${this.project.id}`).href;
    return location.origin + href;
  }

  get projectViewerLink (): string {
    const href = this.$router.resolve(`/viewer/${this.project.id}`).href;
    return location.origin + href;
  }

  mounted (): void {
    document.addEventListener('click', this.outside);

    const editorClipboard = new ClipboardJS(this.$refs.CopyEditorLinkButton, {});
    editorClipboard.on('success', () => {
      this.copied = true;
    });
    const viewerClipboard = new ClipboardJS(this.$refs.CopyViewerLinkButton, {});
    viewerClipboard.on('success', () => {
      this.copied = true;
    });
  }

  beforeDestroy () {
    document.removeEventListener('click', this.outside);
  }

  outside (e: MouseEvent): void {
    if (this.isVisible) {
      const path = this.getPath(e);
      if (!path.includes(this.$refs.Root)) {
        this.hide();
      }
    }
  }

  getPath (e: MouseEvent): EventTarget[] {
    return e.composedPath();
  }

  show (): void {
    this.isVisible = true;
  }

  hide (): void {
    this.isVisible = false;
  }

  clear () {
    this.isSearching = false;
    this.invitationEmail = '';
    this.invitationUID = '';
    this.invitationErrorMessage = '';
  }

  async setup (): Promise<void> {
    this.clear();

    const users = [{
      uid: this.project.uid,
      permission: PermissionOperation.WRITE
    }]
      .concat(this.project.admins.map((uid) => {
        return {
          uid, permission: PermissionOperation.ADMIN
        };
      }))
      .concat(this.project.editors.map((uid) => {
        return {
          uid, permission: PermissionOperation.WRITE
        };
      }))
      .concat(this.project.viewers.map((uid) => {
        return {
          uid, permission: PermissionOperation.READONLY
        };
      }));

    const query = this.$firestore
      .collection('user')
      .where('uid', 'in', users.map(c => c.uid));

    const { docs } = await query.get();
    const collaborators: CollaboratorType[] = docs.map((doc) => {
      const data = doc.data();
      const found = users.find(c => c.uid === data.uid);
      return {
        uid: data.uid,
        name: data.name,
        email: data.email,
        imageUrl: data.imageUrl,
        permission: (found !== undefined) ? found.permission : PermissionOperation.WRITE,
        owner: data.uid === this.project.uid,
        you: data.uid === this.$accessor.user.uid
      };
    });

    // insert owner to last
    let idx = collaborators.findIndex(cu => cu.owner);
    if (idx >= 0) {
      const owner = collaborators[idx];
      collaborators.splice(idx, 1);
      collaborators.push(owner);
    }

    // insert you to last
    idx = collaborators.findIndex(cu => cu.you);
    if (idx >= 0) {
      const you = collaborators[idx];
      collaborators.splice(idx, 1);
      collaborators.push(you);
    }

    this.collaborators = collaborators;
  }

  async search (email: string): Promise<void> {
    const query = this.$firestore
      .collection('user')
      .where('email', '==', email);

    const result = await query.get();

    if (!result.empty) {
      const data = result.docs[0].data();
      if (data.uid !== this.project.uid) {
        const found = this.project.hasMember(data.uid);
        if (!found) {
          this.invitationUID = data.uid;
        } else {
          this.invitationErrorMessage = 'Invited user is already a collaborator';
        }
      } else {
        this.invitationErrorMessage = 'Invited user is owner';
      }
    } else {
      this.invitedUserNotFound();
    }

    this.isSearching = false;
  }

  invitedUserNotFound () {
    this.invitationErrorMessage = 'No email found for the user';
  }

  onInput ($e: Event) {
    this.isSearching = true;
    this.invitationErrorMessage = '';

    const value = ($e.target as HTMLInputElement).value;
    if (this.debouncedSearch !== undefined) { clearTimeout(this.debouncedSearch); }
    this.debouncedSearch = setTimeout(() => {
      this.search(value);
      this.debouncedSearch = undefined;
    }, 1000);
  }

  share (): void {
    this.$emit('share');
  }

  invite () {
    const uid = this.invitationUID;
    if (!this.project.hasMember(uid)) {
      this.project.viewers.push(uid);
    }
    this.share();
  }

  changeMemberPermission (user: { uid: string; permission: number }) {
    this.project.changeMemberPermission(user.uid, user.permission);
    this.share();
  }

  removeMember (user: { uid: string; permission: number }) {
    this.project.removeMember(user.uid);
    this.share();
  }

  onMouseLeave () {
    this.copied = false;
  }
}

</script>

<style lang="scss" scoped>

input, select {
  width: 220px;
  height: 24px;
}

button {
  display: block;
  margin: auto;
  width: 120px;
  height: 30px;

  border-radius: 4px;
  border: 1px solid #ccc;

  cursor: pointer;
}

.share {
  z-index: 1000;
  width: 440px;
  height: 380px;

  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;

  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #ccc;

  &.alert {
    height: 100px;

    p {
      font-size: 1rem;
      color: #a94442;
      display: block;
      margin: auto;
    }
  }

  ul, .items {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    li, .item {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
  }

  .items .item {
    &:first-child {
      padding-top: 0px;
    }

    // last button to bottom
    &:last-child {
      margin-top: auto;
      padding-bottom: 0px;
    }

    button.copy {
      background-color: #f0f0f0;
      color: #333;

      &:hover {
        background-color: #e0e0e0;
      }

      &.tooltipped:after {
        font-size: 0.8rem;
      }
    }

    .permission, .invite, .user {
      width: 100%;
      color: #555;
      font-size: 0.9rem;
      display: flex;
      align-content: center;
      justify-content: space-between;
    }

    $permission-item-height: 32px;

    .permission .group, .invite input {
      height: $permission-item-height;
    }

    .permission {
      select {
        height: $permission-item-height;
      }
    }

    .invite {

      .error {
        margin-top: 4px;
        color: #a94442;
      }

      button {
        margin: 0;
        padding: 2px 4px;
        height: $permission-item-height;
        text-align: center;
      }

    }

    &.collaborators {
      overflow-x: hidden;
      overflow-y: scroll;
      li {
        width: 100%;
        &:first-child {
          padding-top: 0px;
        }
        &:last-child {
          padding-bottom: 0px;
        }
      }
    }

    .operation, .invite-button {
      width: 100px;
    }

  }

}

</style>
