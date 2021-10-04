<template>
  <div class="d-flex" style="width: 100%;">
    <div class="profile d-inline-flex flex-items-center">
      <img class="mr-1" width="20px" :src="user.imageUrl">
      <span class="f5 text-gray-dark">{{ user.name }}</span><span v-show="user.you" class="ml-1 text-small text-gray">(You)</span>
    </div>
    <span v-if="user.owner" class="ml-auto text-small">owner</span>
    <div v-else class="ml-auto text-small">
      <select v-model="user.permission" class="form-select text-small" name="collaborator_permission" @change="onChangePermission(user.permission)">
        <option v-for="(op, key) in PermissionOperation" :key="key" :value="op" v-text="format(op)" />
        <option value="-1">
          remove
        </option>
      </select>
    </div>
  </div>
</template>

<script lang='ts'>

import { Vue, Component, Prop } from 'nuxt-property-decorator';
import { Permission, PermissionOperation } from '@/assets/scripts/service/Permission';

@Component({})
export default class ShareUser extends Vue {
  PermissionOperation: any = PermissionOperation;

  @Prop({ type: Object })
  user!: any;

  format (permission: number): string {
    switch (permission) {
      case PermissionOperation.READONLY:
        return 'can view';
      case PermissionOperation.WRITE:
        return 'can edit';
      case PermissionOperation.ADMIN:
        return 'admin';
    }
    return '';
  }

  onChangePermission (value: string): void {
    const permission = parseInt(value);
    if (permission < 0) {
      this.$emit('remove', this.user);
    } else {
      this.$emit('change', this.user);
    }
  }
}

</script>
