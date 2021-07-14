
import Editor from '../Editor';
import Operation from './Operation';

export default class CreateGroupOperation implements Operation {
  private uuid: string;
  private nodes: string[];

  constructor (uuid: string, nodes: string[]) {
    this.uuid = uuid;
    this.nodes = nodes;
  }

  do (editor: Editor) {
    editor.addGroup(this.uuid, this.nodes);
  }

  undo (editor: Editor) {
    editor.removeGroups([this.uuid]);
  }
}
