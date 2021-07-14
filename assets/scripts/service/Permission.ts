
const PermissionGroup = Object.freeze({
  PRIVATE: 1,
  PUBLIC: 100
});

const PermissionOperation = Object.freeze({
  READONLY: 0,
  WRITE: 1,
  ADMIN: 2
});

const Permission = Object.freeze({
  PRIVATE: 1,
  PUBLIC_READ: 100,
  PUBLIC_WRITE: 101
});

export {
  PermissionGroup, PermissionOperation,
  Permission
};
