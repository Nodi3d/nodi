
import Editor from '../Editor';
import Operation from './Operation';

export default class SequentialOperation implements Operation {
  operations: Operation[];

  constructor (operations: Operation[]) {
    this.operations = operations;
  }

  do (editor: Editor) {
    // forward
    for (let i = 0, n = this.operations.length; i < n; i++) {
      const op = this.operations[i];
      op.do(editor);
    }
  }

  undo (editor: Editor) {
    // backforward
    for (let i = this.operations.length - 1; i >= 0; i--) {
      const op = this.operations[i];
      op.undo(editor);
    }
  }
}
