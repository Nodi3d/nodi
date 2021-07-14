import Editor from '../Editor';
import Operation from './Operation';

export type ConnectOperationArg = {
  srcNode: string;
  srcO: number;
  dstNode: string;
  dstI: number;
};

export default class ConnectOperation implements Operation {
  arg: ConnectOperationArg;

  constructor (e: ConnectOperationArg) {
    this.arg = e;
  }

  do (editor: Editor) {
    const src = editor.nodes.find(n => n.uuid === this.arg.srcNode);
    const dst = editor.nodes.find(n => n.uuid === this.arg.dstNode);
    if (src !== undefined && dst !== undefined) {
      editor.connectIO(src, this.arg.srcO, dst, this.arg.dstI);
    }
  }

  undo (editor: Editor) {
    const src = editor.nodes.find(n => n.uuid === this.arg.srcNode);
    const dst = editor.nodes.find(n => n.uuid === this.arg.dstNode);
    if (src !== undefined && dst !== undefined) {
      editor.disconnectIO(src, this.arg.srcO, dst, this.arg.dstI);
    }
  }
}
