
import { Vector2 } from 'three';

import {
  NodeConnectEventArg, NodeEventArg,
  Graph, IO, NodeBase, GroupElement,
  Input, Output
} from '@nodi/core';
import { ConnectOperationArg } from '../operations/ConnectOperation';
import { GroupViewEvent, NodeIOViewEvent, NodeViewEvent } from '../misc/Events';
import View from './View';
import EdgeView from './EdgeView';
import IOView from './IOView';
import NodeView from './NodeView';
import GroupView from './GroupView';
import ConnectingEdgeView from './ConnectingEdgeView';

export type NodeIOView = {
  node: NodeView;
  io: IOView;
};

export default class GraphView extends View {
  protected graph: WeakRef<Graph>;
  protected nodes: NodeView[] = [];
  protected edges: EdgeView[] = [];
  protected groups: GroupView[] = [];

  private connectingEdge: ConnectingEdgeView | null = null;
  private connectableIOViews: NodeIOView[] = [];

  public onSelectNodeView: NodeViewEvent = new NodeViewEvent();
  public onClickNodeView: NodeViewEvent = new NodeViewEvent();
  public onContextNodeView: NodeViewEvent = new NodeViewEvent();

  public onMouseOverIOView: NodeIOViewEvent = new NodeIOViewEvent();
  public onMouseOutIOView: NodeIOViewEvent = new NodeIOViewEvent();
  public onMouseDownIOView: NodeIOViewEvent = new NodeIOViewEvent();
  public onMouseUpIOView: NodeIOViewEvent = new NodeIOViewEvent();

  public onSelectGroupView: GroupViewEvent = new GroupViewEvent();
  public onContextGroupView: GroupViewEvent = new GroupViewEvent();

  constructor (graph: Graph) {
    super('graph');
    this.graph = new WeakRef(graph);
    this.setupGraphEvent(graph);
  }

  public getNodes (): NodeView[] {
    return this.nodes;
  }

  public getEdges (): EdgeView[] {
    return this.edges;
  }

  public getGroups (): GroupView[] {
    return this.groups;
  }

  setupGraphEvent (graph: Graph): void {
    graph.onAddNode.on((e: NodeEventArg) => {
      this.addNodeView(e.node);
    });
    graph.onRemoveNode.on((e: NodeEventArg) => {
      this.removeNodeView(e.node);
    });
    graph.onConnectNode.on((e: NodeConnectEventArg) => {
      this.addEdgeView(e);
    });
    graph.onAddGroup.on((e) => {
      this.addGroupView(e.group);
    });
    graph.onRemoveGroup.on((e) => {
      this.removeGroupView(e.group);
    });

    graph.onDisconnectNode.on((e: NodeConnectEventArg) => {
      this.removeEdgeViewWithConnection(e);
    });
  }

  protected addNodeView (node: NodeBase): NodeView {
    const nodeView = new NodeView(node);
    this.appendElement(nodeView);
    this.nodes.push(nodeView);

    nodeView.onTransformView.on((e) => {
      this.edges.filter(edge => edge.hasNodeView(e.view)).forEach((edge) => {
        edge.track();
      });
      this.groups.filter(group => group.hasNode(e.view.getNode().uuid)).forEach(group => group.track(this.nodes));
    });
    nodeView.onSelectView.on(this.onSelectNodeView.emit);
    nodeView.onClickView.on(this.onClickNodeView.emit);
    nodeView.onContextView.on(this.onContextNodeView.emit);

    nodeView.onMouseOverIOView.on(this.onMouseOverIOView.emit);
    nodeView.onMouseOutIOView.on(this.onMouseOutIOView.emit);
    nodeView.onMouseDownIOView.on(this.onMouseDownIOView.emit);
    nodeView.onMouseUpIOView.on(this.onMouseUpIOView.emit);

    nodeView.transform();

    return nodeView;
  }

  protected removeNodeView (node: NodeBase): boolean {
    const idx = this.nodes.findIndex(nv => nv.uuid === node.uuid);
    if (idx >= 0) {
      const found = this.nodes[idx];
      this.nodes.splice(idx, 1);
      found.dispose();
      return true;
    }
    return false;
  }

  public findNodeView (node: NodeBase): NodeView | undefined {
    return this.nodes.find(n => n.uuid === node.uuid);
  }

  protected findEdgeViewWithConnection (e: NodeConnectEventArg): EdgeView | undefined {
    return this.edges.find((edge) => {
      const output = e.output;
      const input = e.input;
      return (edge.getOutput().getIO() === output) &&
        (edge.getInput().getIO() === input);
    });
  }

  protected addEdgeView (e: NodeConnectEventArg) {
    const srcNV = this.nodes.find(n => n.getNode() === e.source);
    if (srcNV === undefined) { return; }
    const srcIV = srcNV.outputs.find(iv => iv.getIO() === e.output);
    if (srcIV === undefined) { return; }

    const dstNV = this.nodes.find(n => n.getNode() === e.destination);
    if (dstNV === undefined) { return; }
    const dstIV = dstNV.inputs.find(iv => iv.getIO() === e.input);
    if (dstIV === undefined) { return; }

    const edgeView = new EdgeView(srcIV, dstIV);
    this.appendElement(edgeView);
    edgeView.track();
    edgeView.onDispose.on((e) => {
      const view = e.view as EdgeView;
      if (this.edges.includes(view)) {
        const index = this.edges.indexOf(view);
        this.edges.splice(index, 1);
      }
    });

    this.edges.push(edgeView);
  }

  protected removeEdgeView (edgeView: EdgeView): boolean {
    const index = this.edges.indexOf(edgeView);
    if (index >= 0) {
      const edge = this.edges[index];
      this.edges.splice(index, 1);
      edge.dispose();
      return true;
    }
    return false;
  }

  protected getEdgeViewsWithNode (node: NodeBase): EdgeView[] {
    return this.edges.filter(e => e.hasNode(node));
  }

  protected removeEdgeViewWithConnection (con: NodeConnectEventArg): void {
    const e = this.findEdgeViewWithConnection(con);
    if (e !== undefined) {
      this.removeEdgeView(e);
    }
  }

  public addConnectingEdge (io: IOView) {
    const edgeView = new ConnectingEdgeView(io);
    this.connectingEdge = edgeView;
    this.appendElement(this.connectingEdge);
    this.updateConnectableIOViews(edgeView);
  }

  public updateConnectingEdge (wp: Vector2): void {
    if (this.connectingEdge === null) { return; }

    this.connectingEdge.updatePath(wp);
    this.connectingEdge.move(wp);
  }

  public removeConnectingEdge (): void {
    this.clearConnectableIOViews();
    this.unhighlightIOViews();

    if (this.connectingEdge === null) { return; }
    this.connectingEdge.dispose();
    this.connectingEdge = null;
  }

  public updateConnectableIOViews (edge: ConnectingEdgeView): NodeIOView[] {
    this.connectableIOViews = [];

    const io = edge.getIOView().getIO();
    const graph = this.graph.deref();
    const parent = graph?.getParentNode(io) as NodeBase;
    if (io instanceof Input) {
      this.nodes.forEach((nv) => {
        const n = nv.getNode();
        const ncon = !n.isConnected(parent, true);
        nv.inputs.forEach(iv => iv.highlight(false));
        nv.outputs.forEach((iv) => {
          const connectable = parent !== n && ncon && iv.getIO().match(io);
          iv.highlight(connectable);
          if (connectable) {
            this.connectableIOViews.push({ node: nv, io: iv });
          }
        });
      });
    } else if (io instanceof Output) {
      this.nodes.forEach((nv) => {
        const n = nv.getNode();
        const ncon = !n.isConnected(parent, false);
        nv.inputs.forEach((iv) => {
          const connectable = parent !== n && ncon && iv.getIO().match(io);
          iv.highlight(connectable);
          if (connectable) {
            this.connectableIOViews.push({ node: nv, io: iv });
          }
        });
        nv.outputs.forEach(iv => iv.highlight(false));
      });
    }

    return this.connectableIOViews;
  }

  public unhighlightIOViews (): void {
    this.nodes.forEach((node) => {
      node.inputs.forEach(io => io.unhighlight());
      node.outputs.forEach(io => io.unhighlight());
    });
  }

  public clearConnectableIOViews (): void {
    this.connectableIOViews.forEach(e => e.io.unnearest());
    this.connectableIOViews = [];
  }

  public checkNearestIO (p: Vector2, threshold = 10000): NodeIOView | undefined {
    let nearest;
    let distance = threshold;

    for (let i = 0, n = this.connectableIOViews.length; i < n; i++) {
      const e = this.connectableIOViews[i];
      const d2 = e.io.distanceTo(p);
      if (d2 < distance) {
        distance = d2;
        nearest = e;
      }
    }

    this.connectableIOViews.forEach(e => e.io.unnearest());
    if (nearest !== undefined) {
      nearest.io.nearest();
    }
    return nearest;
  }

  connectIO (srcN: NodeView, srcO: number = 0, dstN: NodeView, dstI: number = 0, notify: boolean = true): void {
    const graph = this.graph.deref();
    graph?.connectIO(srcN.getNode(), srcO, dstN.getNode(), dstI);
    if (notify) { graph?.notifyGraphConstructed(); }
  }

  connectIOWithNearest (wp: Vector2): ConnectOperationArg | boolean {
    const nearest = this.checkNearestIO(wp);
    if (nearest === undefined) { return false; }
    if (this.connectingEdge === null) { return false; }

    const io = this.connectingEdge?.getIOView().getIO() as IO;
    io.unselect();
    nearest.io.getIO().unselect();
    this.connectingEdge?.unselect();

    const nodeView = nearest.node;
    const ioView = nearest.io;

    if (nodeView.isConnectable(nearest.io, this.connectingEdge)) {
      let srcN, dstN;
      let srcO, dstI;

      if (!nearest.io.isInput()) {
        // io is output IO
        const destIO = io;
        const destNode = destIO.getParent();
        dstN = destNode?.uuid;
        dstI = destNode?.inputManager.getIOIndex(destIO);
        srcN = nodeView.getNode().uuid;
        srcO = nodeView.getNode().outputManager.getIOIndex(ioView.getIO());
      } else {
        // io is input IO
        const sourceIO = io;
        const sourceNode = sourceIO.getParent();
        srcN = sourceNode?.uuid;
        srcO = sourceNode?.outputManager.getIOIndex(sourceIO);
        dstN = nodeView.getNode().uuid;
        dstI = nodeView.getNode().inputManager.getIOIndex(ioView.getIO());
      }

      // remove connecting edge before connectIO
      this.removeConnectingEdge();

      return {
        srcNode: srcN,
        srcO,
        dstNode: dstN,
        dstI
      };
    }

    return false;
  }

  disconnectIO (srcN: NodeView, srcO: number, dstN: NodeView, dstI: number, notify: boolean = true): void {
    const graph = this.graph.deref();
    graph?.disconnectIO(srcN.getNode(), srcO, dstN.getNode(), dstI);
    if (notify) {
      graph?.notifyGraphConstructed();
    }
  }

  protected addGroupView (group: GroupElement): GroupView {
    const groupView = new GroupView(group);
    this.appendElement(groupView);
    this.groups.push(groupView);

    groupView.onChanged.on((e) => {
      const { view: group } = e;
      group.track(this.nodes);
    });
    groupView.onMouseDown.on((e) => {
      const which = e.which;
      if (which !== 1) { return; }
      e.stopPropagation();
      this.onSelectGroupView.emit({ view: groupView, e });
    });
    groupView.onMouseUp.on((e) => {
      const which = e.which;
      if (which !== 3) { return; }
      e.preventDefault();
      e.stopPropagation();
      this.onContextGroupView.emit({ view: groupView, e });
    });

    groupView.track(this.nodes);

    return groupView;
  }

  protected removeGroupView (group: GroupElement): boolean {
    const idx = this.groups.findIndex(view => view.uuid === group.uuid);
    if (idx >= 0) {
      const found = this.groups[idx];
      this.groups.splice(idx, 1);
      found.dispose();
      return true;
    }
    return false;
  }

  appendElement (view: View | NodeView | EdgeView | IOView): void {
    this.dom.appendChild(view.dom);
  }

  public dispose (): void {
    this.onSelectNodeView.dispose();
    this.onClickNodeView.dispose();
    this.onContextNodeView.dispose();
    this.onContextGroupView.dispose();

    this.onMouseOverIOView.dispose();
    this.onMouseOutIOView.dispose();
    this.onMouseDownIOView.dispose();
    this.onMouseUpIOView.dispose();

    this.onSelectGroupView.dispose();
    this.onContextGroupView.dispose();
  }
}
