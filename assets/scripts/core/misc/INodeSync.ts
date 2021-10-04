import NodeBase from '../nodes/NodeBase';

export default interface INodeSync {
  node: string;
  visible: boolean;
  setup(node: NodeBase): void;
  select(node: NodeBase): void;
}
