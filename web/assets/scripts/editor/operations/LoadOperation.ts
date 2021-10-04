
import { GraphJSONType, Unknown } from '@nodi/core';
import Editor from '../Editor';
import Operation from './Operation';

export default class LoadOperation implements Operation {
  json: GraphJSONType;

  constructor (json: GraphJSONType) {
    this.json = json;
  }

  do (context: Editor) {
    const nodes = context.graph.fromJSON(this.json);
    const unknowns = nodes.filter(n => n instanceof Unknown).map(n => (n as Unknown).name);
    if (unknowns.length > 0) {
      window.alert(`Unknown nodes found: \n${unknowns.map(n => `  ${n}`).join('\n')}`);
    }
  }

  undo (editor: Editor) {
    editor.removeNodes(this.json.nodes.map(n => n.uuid));
    editor.removeGroups(this.json.groups.map(g => g.uuid));
  }
}
