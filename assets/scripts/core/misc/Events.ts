
import ElementBase from '../ElementBase';
import Graph from '../Graph';
import NodeBase from '../nodes/NodeBase';
import IO from '../io/IO';
import Group from '../Group';
import Input from '../io/Input';
import Output from '../io/Output';
import { TypedEvent } from './TypedEvent';

const Events = Object.freeze({
  PUSH_GRAPH: 'push_graph',
  POP_GRAPH: 'pop_graph',
  EDIT_SUBGRAPH: 'edit_subgraph',
  EXPAND_SUBGRAPH: 'expand_subgraph'
});

export default Events;

export type ElementEventArg = {
  element: ElementBase;
};

export type NodeEventArg = {
  node: NodeBase;
};

export type GroupEventArg = {
  group: Group;
};

export type NodeConnectEventArg = {
  source: NodeBase;
  output: Output;
  destination: NodeBase;
  input: Input;
};

export class ElementEvent extends TypedEvent<ElementEventArg> { }
export class NodeEvent extends TypedEvent<NodeEventArg> { }
export class IOEvent extends TypedEvent<{ io: IO }> { }
export class NodeConnectEvent extends TypedEvent<NodeConnectEventArg> {}
export class GraphEvent extends TypedEvent<{ graph: Graph }> {}
export class NodesEvent extends TypedEvent<{ nodes: NodeBase[] }> {}
export class GroupEvent extends TypedEvent<GroupEventArg> { }
