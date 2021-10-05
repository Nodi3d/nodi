
/*
export enum AccessTypes {
  ITEM,
  LIST,
  TREE,
}
*/

const AccessTypes = {
  ITEM: 0,
  LIST: 1,
  TREE: 2,
} as const;
type AccessType = typeof AccessTypes[keyof typeof AccessTypes];

export { AccessTypes, AccessType };
