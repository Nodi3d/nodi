
import Editor from '../Editor';
import Operation from './Operation';

export default class RemoveFromGroupOperation implements Operation {
  private uuid: string;
  private nodes: string[];

  constructor (uuid: string, nodes: string[]) {
    this.uuid = uuid;
    this.nodes = nodes;
  }

  do (editor: Editor) {
    const found = editor.groups.find(group => group.uuid === this.uuid);
    if (found !== undefined) {
      found.removeNodes(this.nodes);
    }
  }

  undo (editor: Editor) {
    const found = editor.groups.find(group => group.uuid === this.uuid);
    if (found !== undefined) {
      found.addNodes(this.nodes);
    }
  }
}
