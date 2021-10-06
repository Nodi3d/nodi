import { TypedEvent, Graph, GroupElement, NodeBase, IO, NodeConstructorType } from '@nodi/core';
import View from '../views/View';
import EdgeView from '../views/EdgeView';
import IOView from '../views/IOView';
import NodeView from '../views/NodeView';
import GroupView from '../views/GroupView';

export type ViewEventArg = {
  view: View
};

export type NodeViewEventArg = {
  e: MouseEvent;
  view: NodeView;
};

export type EdgeViewEventArg = {
  e: MouseEvent;
  view: EdgeView;
};

export type IOViewEventArg = {
  e: MouseEvent;
  view: IOView;
};

export type NodeIOViewEventArg = {
  e: MouseEvent;
  node: NodeView;
  io: IOView;
};

export type GroupViewEventArg = {
  e: MouseEvent;
  view: GroupView;
};

export type NodeConstructorEventType = {
  e: MouseEvent;
  constructor: NodeConstructorType;
};

export class GUIEvent extends TypedEvent<MouseEvent> {}
export class ViewEvent extends TypedEvent<ViewEventArg> {}
export class GraphGUIEvent extends TypedEvent<{ e: MouseEvent, graph: Graph }> {}
export class GroupGUIEvent extends TypedEvent<{ e: MouseEvent, group: GroupElement }> {}
export class NodeGUIEvent extends TypedEvent<{ e: MouseEvent, node: NodeBase }> {}
export class IOGUIEvent extends TypedEvent<{ e: MouseEvent, io: IO }> {}
export class NodeConstructorEvent extends TypedEvent<NodeConstructorEventType> {}

export class NodeViewEvent extends TypedEvent<NodeViewEventArg> {}
export class EdgeViewEvent extends TypedEvent<EdgeViewEventArg> {}
export class IOViewEvent extends TypedEvent<IOViewEventArg> {}
export class NodeIOViewEvent extends TypedEvent<NodeIOViewEventArg> {}
export class GroupViewEvent extends TypedEvent<GroupViewEventArg> {}
