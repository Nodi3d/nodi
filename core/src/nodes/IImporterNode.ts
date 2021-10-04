import { TypedEvent } from '../misc/TypedEvent';

export type ImportFileArg = { blob: Blob, key: string, name: string, folder: string };

export interface IImporterNode {
  onImportFile: TypedEvent<ImportFileArg>;
  registerFile (key: string, name: string, url: string): void;
}

const isImporterNode = function (arg: any) : arg is IImporterNode {
  return arg !== null && typeof arg === 'object' && typeof arg.onImportFile === 'object' && typeof arg.registerFile === 'function';
};

export {
  isImporterNode
};
