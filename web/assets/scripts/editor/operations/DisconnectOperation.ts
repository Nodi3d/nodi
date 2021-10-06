import Editor from '../Editor';
import { ConnectOperationArg } from './ConnectOperation';
import Operation from './Operation';

export default class DisconnectOperation implements Operation {
  arg: ConnectOperationArg;

  constructor (e: ConnectOperationArg) {
    this.arg = e;
  }

  do (editor: Editor) {
    const src = editor.nodes.find(n => n.uuid === this.arg.srcNode);
    const dst = editor.nodes.find(n => n.uuid === this.arg.dstNode);
    if (src !== undefined && dst !== undefined) {
      editor.disconnectIO(src, this.arg.srcO, dst, this.arg.dstI);
    }
  }

  undo (editor: Editor) {
    const src = editor.nodes.find(n => n.uuid === this.arg.srcNode);
    const dst = editor.nodes.find(n => n.uuid === this.arg.dstNode);
    if (src !== undefined && dst !== undefined) {
      editor.connectIO(src, this.arg.srcO, dst, this.arg.dstI);
    }
  }
}
