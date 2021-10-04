import Editor from '../Editor';
import Operation from './Operation';

export default class RemoveGroupOperation implements Operation {
  private uuid: string;
  private nodes: string[];

  constructor (uuid: string, nodes: string[]) {
    this.uuid = uuid;
    this.nodes = nodes;
  }

  do (editor: Editor) {
    editor.removeGroups([this.uuid]);
  }

  undo (editor: Editor) {
    editor.addGroup(this.uuid, this.nodes);
  }
}
