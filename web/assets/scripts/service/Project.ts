import { Permission, PermissionOperation } from './Permission';

export type ProjectJSONType = {
  title: string;
  nodes: string[];
  jsonUrl: string;
  imageUrl: string;

  uid: string;
  permission: number;
  viewers: string[];
  editors: string[];
  admins: string[];
  fork: string;
  timestamp: { seconds: number };
  deleted: boolean;
};

export default class Project {
  id: string = '';
  title: string = 'Untitled';
  nodes: string[] = [];
  jsonUrl: string = '';
  imageUrl: string = '';

  uid: string = '';
  permission: number = Permission.PUBLIC_READ;
  viewers: string[] = [];
  editors: string[] = [];
  admins: string[] = [];
  fork: string = '';
  timestamp: { seconds: number } = { seconds: 0 };
  deleted: boolean = false;

  // eslint-disable-next-line no-useless-constructor
  constructor () {
  }

  canView (uid: string): boolean {
    if (this.uid.length <= 0) { return true; }

    switch (this.permission) {
      case Permission.PRIVATE: {
        return (uid === this.uid) || this.viewers.includes(uid) || this.editors.includes(uid) || this.admins.includes(uid);
      }
    }
    return true;
  }

  canEdit (uid: string): boolean {
    if (this.uid.length <= 0) { return true; }

    switch (this.permission) {
      case Permission.PRIVATE:
      case Permission.PUBLIC_READ:
      {
        return (uid === this.uid) || this.editors.includes(uid) || this.admins.includes(uid);
      }
    }
    return this.permission >= Permission.PUBLIC_WRITE;
  }

  canFork (): boolean {
    return this.uid.length > 0; // is not empty
  }

  isAdmin (uid: string): boolean {
    return uid === this.uid || this.admins.includes(uid);
  }

  hasMember (uid: string): boolean {
    return uid === this.uid || this.viewers.includes(uid) || this.editors.includes(uid) || this.admins.includes(uid);
  }

  changeMemberPermission (uid: string, operation: number): void {
    if (this.uid === uid) { return; } // owner

    this.removeMember(uid);
    switch (operation) {
      case PermissionOperation.READONLY:
        this.viewers.push(uid);
        break;
      case PermissionOperation.WRITE:
        this.editors.push(uid);
        break;
      case PermissionOperation.ADMIN:
        this.admins.push(uid);
        break;
    }
  }

  removeMember (uid: string): boolean {
    let idx = this.viewers.indexOf(uid);
    if (idx >= 0) {
      this.viewers.splice(idx, 1);
      return true;
    }

    idx = this.editors.indexOf(uid);
    if (idx >= 0) {
      this.editors.splice(idx, 1);
      return true;
    }

    idx = this.admins.indexOf(uid);
    if (idx >= 0) {
      this.admins.splice(idx, 1);
      return true;
    }

    return false;
  }

  toJSON (): ProjectJSONType {
    return {
      title: this.title,
      nodes: this.nodes,
      jsonUrl: this.jsonUrl,
      imageUrl: this.imageUrl,
      uid: this.uid,
      permission: this.permission,
      viewers: this.viewers,
      editors: this.editors,
      admins: this.admins,
      fork: this.fork,
      timestamp: this.timestamp,
      deleted: this.deleted
    };
  }

  fromJSON (id: string, json: ProjectJSONType): void {
    this.id = id;
    this.title = json.title;
    this.nodes = json.nodes;
    this.jsonUrl = json.jsonUrl;
    this.imageUrl = json.imageUrl;
    this.uid = json.uid;
    this.permission = json.permission;
    this.viewers = json.viewers ?? [];
    this.editors = json.editors ?? [];
    this.admins = json.admins ?? [];
    this.fork = json.fork ?? '';
    this.timestamp = json.timestamp;
    this.deleted = json.deleted;
  }
}
