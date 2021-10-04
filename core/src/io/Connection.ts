
import { NodeBase } from '../nodes/NodeBase';
import { IO } from './IO';

export class Connection {
  protected node: NodeBase;
  protected io: IO;
  constructor (node: NodeBase, io: IO) {
    this.node = node;
    this.io = io;
  }
}
