
import { ElementBase } from '../ElementBase';
import { Graph } from '../Graph';
import { NodeBase } from '../nodes/NodeBase';
import { IO } from '../io/IO';
import { GroupElement } from '../GroupElement';
import { Input } from '../io/Input';
import { Output } from '../io/Output';
import { TypedEvent } from './TypedEvent';

export type ElementEventArg = {
  element: ElementBase;
};

export type NodeEventArg = {
  node: NodeBase;
};

export type GroupEventArg = {
  group: GroupElement;
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
