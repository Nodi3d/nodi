import Project from './Project';
import { Permission, PermissionGroup, PermissionOperation } from './Permission';

const makeReadOnly = function (permission: number): number {
  switch (permission) {
    case Permission.PUBLIC_WRITE:
      return Permission.PUBLIC_READ;
    default:
      return permission;
  }
};

const makeWritable = function (permission: number): number {
  switch (permission) {
    case Permission.PUBLIC_READ:
      return Permission.PUBLIC_WRITE;
    default:
      return permission;
  }
};

const makePrivate = function (permission: number): number {
  return Permission.PRIVATE;
};

const makePublic = function (permission: number): number {
  switch (permission) {
    case Permission.PRIVATE:
      return Permission.PUBLIC_READ;
    default:
      return permission;
  }
};

const getGroup = function (permission: number): number {
  if (permission >= PermissionGroup.PUBLIC) { return PermissionGroup.PUBLIC; }
  return PermissionGroup.PRIVATE;
};

const getOperation = function (permission: number): number {
  const rw = permission % 10;
  if (rw >= PermissionOperation.WRITE) { return PermissionOperation.WRITE; }
  return PermissionOperation.READONLY;
};

export {
  makeReadOnly,
  makeWritable,
  makePrivate,
  makePublic,

  getGroup,
  getOperation
};
