
import { Vector2 } from 'three';
import { NodeBase } from '@nodi/core';
import Editor from '../Editor';
import NodeView from '../views/NodeView';
import Operation from './Operation';

class Translation {
  uuid: string;
  from: Vector2;
  to: Vector2;
  constructor (uuid: string, from: Vector2, to: Vector2) {
    this.uuid = uuid;
    this.from = from;
    this.to = to;
  }
}

export default class MoveNodesOperation implements Operation {
  translations: Translation[] = [];

  constructor (nodes: NodeBase[]) {
    this.translations = nodes.map((n) => {
      const prevPosition = n.getPrevPosition();
      const position = n.getPosition();
      return new Translation(n.uuid, prevPosition.clone(), position.clone());
    });
  }

  do (editor: Editor) {
    this.translations.forEach((translation) => {
      const found = editor.nodes.find(n => n.uuid === translation.uuid);
      if (found !== undefined) {
        found.moveTo(translation.to.x, translation.to.y);
      }
    });
  }

  undo (editor: Editor) {
    this.translations.forEach((move) => {
      const found = editor.nodes.find(n => n.uuid === move.uuid);
      if (found !== undefined) {
        found.moveTo(move.from.x, move.from.y);
      }
    });
  }
}
