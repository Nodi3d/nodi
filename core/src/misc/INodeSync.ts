import { NodeBase } from '../nodes/NodeBase';

export interface INodeSync {
  node: string;
  visible: boolean;
  setup(node: NodeBase): void;
  select(node: NodeBase): void;
}
