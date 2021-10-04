
import { Vector2 } from 'three';
import { v4 } from 'uuid';
import { NodeConstructorType, NodeBase, NodeJSONType } from '@nodi/core';
import Editor from '../Editor';
import Operation from './Operation';

export default class AddNodeOperation implements Operation {
  protected uuid: string;
  protected nodeConstructor: NodeConstructorType;
  protected position: Vector2;

  constructor (nodeConstructor: NodeConstructorType, position: Vector2) {
    this.uuid = v4();
    this.nodeConstructor = nodeConstructor;
    this.position = position;
  }

  public getUUID (): string {
    return this.uuid;
  }

  do (editor: Editor) {
    editor.addNode(this.uuid, this.nodeConstructor, this.position.x, this.position.y);
  }

  undo (editor: Editor) {
    editor.removeNodes([this.uuid]);
  }
}
