
import NodeBase, { NodeJSONType } from '../../core/nodes/NodeBase';
import Editor from '../Editor';
import Operation from './Operation';

export default class RemoveNodesOperation implements Operation {
  protected jsons: NodeJSONType[] = [];

  constructor (nodes: NodeBase[]) {
    this.jsons = nodes.map(n => n.toJSON());
  }

  do (editor: Editor) {
    editor.removeNodes(this.jsons.map(json => json.uuid));
  }

  undo (editor: Editor) {
    editor.createNodesJSON(this.jsons);
    editor.connectNodesJSON(this.jsons, editor.nodes);
  }
}
