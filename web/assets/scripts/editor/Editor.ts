
import { Vector2 } from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { v4 } from 'uuid';
import {
  NodesEvent, GraphEvent,
  IO,
  Nodes,
  Graph, GraphJSONType, GraphJSONVersion,
  NodeConstructorType, TypedEvent,
  Input, Output,
  IDisposable,
  NodeBase,
  GroupElement,
  NodeJSONType,
  getNodeConstructorName,
  getNodeConstructorNameOfInstance
} from '@nodi/core';

import InputUtils from './misc/InputUtils';
import { KeyCodeStrings } from './misc/KeyCodes';
import Operation from './operations/Operation';
import * as Operations from './operations';

import GraphView from './views/GraphView';
import EdgeView from './views/EdgeView';

import PolylineFigure from './figures/PolylineFigure';
import NodePlaceholder from './NodePlaceholder';
import { ConnectOperationArg } from './operations/ConnectOperation';
import StateBase from './states/StateBase';
import IdleState from './states/IdleState';
import { GroupViewEvent, GroupViewEventArg, GUIEvent, NodeIOViewEvent, NodeIOViewEventArg, NodeViewEvent, NodeViewEventArg } from './misc/Events';
import NewNodeState from './states/NewNodeState';
import IOView from './views/IOView';
import AddNodeOperation from './operations/AddNodeOperation';

const minScale: number = 0.1; const maxScale: number = 3.0;

type GraphHierarchy = {
  graph: Graph;
  json: any;
};

export class EditorMouseInput {
  public event: MouseEvent;
  public rect: DOMRect;
  public position: Vector2;
  public world: Vector2;
  public which: number;

  constructor (context: Editor, e: MouseEvent) {
    this.event = e;
    this.rect = context.el.getBoundingClientRect();
    this.which = InputUtils.getMouseWhich(e);
    const x = e.clientX - this.rect.x;
    const y = e.clientY - this.rect.y;
    this.position = new Vector2(x, y);
    this.world = context.getWorld(x, y);
  }
}

export default class Editor implements IDisposable {
  state: StateBase = new IdleState(this);

  // #region Events

  public onStartProcess: GraphEvent = new GraphEvent();
  public onFinishProcess: GraphEvent = new GraphEvent();
  public onLoadedGraph: GraphEvent = new GraphEvent();
  public onConstructed: NodesEvent = new NodesEvent();

  public onNodeSearch: GUIEvent = new GUIEvent();
  public onNodeInspector: NodeViewEvent = new NodeViewEvent();
  public onNodeContext: GUIEvent = new GUIEvent();
  public onIOInspector: NodeIOViewEvent = new NodeIOViewEvent();
  public onIOInspectorOut: NodeIOViewEvent = new NodeIOViewEvent();
  public onIOContext: TypedEvent<{ e: MouseEvent, edges: EdgeView[], io: IOView }> = new TypedEvent();
  public onGroupContext: GroupViewEvent = new GroupViewEvent();

  // #endregion

  el: HTMLElement;
  view: HTMLDivElement;
  grid: HTMLDivElement;

  position: Vector2 = new Vector2(0, 0);
  scale: number = 1;
  prevMousePosition: Vector2 = new Vector2(0, 0);

  history: Operation[] = [];
  current: number = 0;

  panning: boolean = false;

  mainGraph: Graph = new Graph();
  hierarchy: GraphHierarchy[] = [];
  mainGraphView: GraphView;

  placeholder: NodePlaceholder = new NodePlaceholder();

  selectedNodes: NodeBase[] = [];
  selectedGroup: GroupElement | null = null;

  connectableIOs: IO[] = [];

  showPerformance: boolean = false;

  private requestAnimationId: number = -1;
  private tweens: TWEEN.Group = new TWEEN.Group();

  constructor (el: HTMLElement) {
    this.el = el;
    this.setupEvent();

    this.view = this.createView();
    this.grid = this.createGrid();
    this.view.appendChild(this.grid);
    this.el.appendChild(this.view);

    this.view.appendChild(this.placeholder.el);
    this.placeholder.hide();

    this.pushGraph(this.mainGraph);
    this.mainGraphView = this.addGraphView(this.mainGraph);

    const tick = (time: number) => {
      this.requestAnimationId = requestAnimationFrame(tick);
      this.tweens.update(time);
    };
    tick(0);
  }

  // #region Accessors

  getCurrentGraphView (): GraphView {
    return this.mainGraphView;
  }

  get currentGraph (): Graph {
    const n = this.hierarchy.length;
    return this.hierarchy[n - 1].graph;
  }

  get graphView (): GraphView {
    return this.getCurrentGraphView();
  }

  public get graph (): Graph {
    // return this._graph
    return this.currentGraph;
  }

  public getNodes (): NodeBase[] {
    const gv = this.getCurrentGraphView();
    if (gv === undefined) { return []; }
    return gv.getNodes().map(v => v.getNode());
  }

  get nodes (): NodeBase[] {
    return this.getNodes();
  }

  get groups (): GroupElement[] {
    const gv = this.getCurrentGraphView();
    if (gv === undefined) { return []; }
    return gv.getGroups().map(v => v.getGroup());
  }

  // #region Accessors

  unselectAll (): void {
    this.unselectAllNodes();
    this.unselectGroup();
    this.graphView.removeConnectingEdge();

    this.placeholder.hide();
  }

  public selectAllNodes (): void {
    this.selectNodes(this.nodes);
  }

  public selectNodes (nodes: NodeBase[]): void {
    this.unselectAllNodes();
    this.selectedNodes = nodes;
    this.selectedNodes.forEach(n => n.select());
  }

  public unselectAllNodes (): void {
    if (this.selectedNodes.length > 0) { this.selectedNodes.forEach(node => node.unselect()); }
    this.selectedNodes = [];
  }

  public prepareSelectedNodes (): void {
    this.selectedNodes.forEach(n => n.prepareTransform());
  }

  public addGroup (uuid: string, nodes: string[]): GroupElement {
    const group = new GroupElement(uuid, nodes);
    this.graph.addGroup(group);
    return group;
  }

  public selectGroup (group: GroupElement): void {
    if (this.selectedGroup !== null) {
      this.selectedGroup.unselect();
    }
    this.selectedGroup = group;
    group.select();
  }

  unselectGroup () {
    if (this.selectedGroup === null) { return null; }

    const grp = this.selectedGroup;
    grp.unselect();
    this.selectedGroup = null;

    return grp;
  }

  public getIntersectedEdges (polyline: PolylineFigure): EdgeView[] {
    const segments = polyline.build();
    const view = this.getCurrentGraphView();
    return view.getEdges().filter((e) => {
      const segments2 = e.build();
      return segments.some((s) => {
        return segments2.some((s2) => { return s.intersectsBySegment(s2); });
      });
    });
  }

  addGraphView (graph: Graph): GraphView {
    const view = new GraphView(graph);
    this.appendElement(view.dom);

    view.onSelectNodeView.on(this.onSelectNodeView.bind(this));
    view.onClickNodeView.on(this.onClickNodeView.bind(this));
    view.onContextNodeView.on((arg) => { if (!this.panning) { this.onNodeInspector.emit(arg); } });

    view.onMouseOverIOView.on(this.onMouseOverIOView.bind(this));
    view.onMouseOutIOView.on(this.onMouseOutIOView.bind(this));
    view.onMouseDownIOView.on(this.onMouseDownIOView.bind(this));
    view.onMouseUpIOView.on(this.onMouseUpIOView.bind(this));

    view.onSelectGroupView.on(this.onSelectGroupView.bind(this));
    view.onContextGroupView.on(this.onGroupContext.emit);

    return view;
  }

  private onSelectNodeView (arg: NodeViewEventArg): void {
    this.state = this.state.selectNodeView(this, arg.view);
  }

  private onClickNodeView (arg: NodeViewEventArg): void {
    this.state = this.state.clickNodeView(this, arg.view);
  }

  private onSelectGroupView (arg: GroupViewEventArg): void {
    this.state = this.state.selectGroupView(this, arg.view);
  }

  private onMouseOverIOView (arg: NodeIOViewEventArg): void {
    if (this.panning) { return; }
    // this.state = this.state.mouseOverIOView(this, arg.io);
    this.onIOInspector.emit(arg);
  }

  private onMouseOutIOView (arg: NodeIOViewEventArg): void {
    // this.state = this.state.mouseOutIOView(this, arg.io);
    this.onIOInspectorOut.emit(arg);
  }

  private onMouseDownIOView (arg: NodeIOViewEventArg) {
    const which = InputUtils.getMouseWhich(arg.e);
    switch (which) {
      case 1: // left
        arg.e.preventDefault();
        arg.e.stopPropagation();

        this.state = this.state.mouseDownIOView(this, arg.io);
        break;
    }
  }

  private onMouseUpIOView (arg: NodeIOViewEventArg) {
    const which = InputUtils.getMouseWhich(arg.e);
    switch (which) {
      case 3: // right
        arg.e.preventDefault();
        arg.e.stopPropagation();

        if (arg.io.getIO().getConnectionCount() > 0) {
          const edges = this.graphView.getEdges().filter((e) => {
            return e.hasIOView(arg.io);
          });
          this.onIOContext.emit({
            e: arg.e,
            edges,
            io: arg.io
          });
        }

        break;
    }
  }

  addNode (uuid: string, constructor: NodeConstructorType, x: number = 0, y: number = 0): NodeBase {
    const node = this.graph.addNode(uuid, constructor, x, y);
    // this.graph.notifyGraphConstructed();
    return node;
  }

  getNode (guid: string): NodeBase | undefined {
    return this.nodes.find(n => n.uuid === guid);
  }

  removeNode (node: NodeBase): void {
    this.graph.removeNode(node);
  }

  // Execute removeNodes with command history
  public removeSelectedNodesCmd () {
    const op = new Operations.RemoveNodesOperation(this.selectedNodes);
    this.pushHistory(op).do(this);
  }

  public removeNodes (nodes: string[]) {
    if (this.graph !== undefined) {
      this.graph.removeNodes(nodes);
    }
  }

  public removeGroups (groups: string[]) {
    if (this.graph !== undefined) {
      this.graph.removeGroups(groups);
    }
  }

  public selectNodeConstructor (nodeConstructor: NodeConstructorType, position: Vector2): void {
    const name = getNodeConstructorName(nodeConstructor);

    // validate nodes in hierarchy
    if (
      // cond 1
      // (this.hierarchy.length > 1 && name === 'SubGraph') ||
      // cond 2
      (this.hierarchy.length <= 1 && (name === 'ExInput' || name === 'ExOutput'))
    ) {
      return;
    }

    this.state.dispose();
    this.state = new NewNodeState(this, nodeConstructor, position);
  }

  connectIO (srcN: NodeBase, srcO: number = 0, dstN: NodeBase, dstI: number = 0, notify: boolean = true): void {
    this.graph.connectIO(srcN, srcO, dstN, dstI);
  }

  disconnectIO (srcN: NodeBase, srcO: number = 0, dstN: NodeBase, dstI: number = 0, notify: boolean = true): void {
    this.graph.disconnectIO(srcN, srcO, dstN, dstI);
  }

  public disconnect (args: { from: IO; to: IO }[]): void {
    const operations = this.getConnectOperationArgs(args).map(arg => new Operations.DisconnectOperation(arg));
    const op = new Operations.SequentialOperation(operations);
    this.pushHistory(op).do(this);
  }

  private getConnectOperationArgs (args: { from: IO; to: IO }[]): ConnectOperationArg[] {
    return args.map((arg) => {
      if (arg.from instanceof Input) {
        const output = arg.to;
        const src = output.getParent();
        const input = arg.from as Input;
        const dst = input.getParent();
        return {
          srcNode: src.uuid,
          srcO: src.outputManager.getIOIndex(output),
          dstNode: dst.uuid,
          dstI: dst.inputManager.getIOIndex(input)
        };
      } else {
        const output = arg.from as Output;
        const src = output.getParent();
        const input = arg.to;
        const dst = input.getParent();
        return {
          srcNode: src.uuid,
          srcO: src.outputManager.getIOIndex(output),
          dstNode: dst.uuid,
          dstI: dst.inputManager.getIOIndex(input)
        };
      }
    });
  }

  public relay (ioView: IOView): void {
    const io = ioView.getIO();
    const node = io.getParent();
    const connections = io.getConnections();
    if (connections.length <= 0) { return; }

    // 1. Disconnect all connections from io
    const disconnectOperations = this.getConnectOperationArgs(connections.map((other) => {
      return {
        from: io, to: other
      };
    })).map(arg => new Operations.DisconnectOperation(arg));

    const isInput = io instanceof Input;
    const rect = ioView.dom.getBoundingClientRect();
    const offset = isInput ? -rect.width : rect.width;
    const position = this.getWorld(rect.left + offset * 5, rect.top);

    // 2. Add Relay node
    const addOp = new AddNodeOperation(Nodes.Relay, position);
    const uuid = addOp.getUUID();

    // 3. Connect edges between Relay & other nodes
    let connectionOperations = [];

    connectionOperations.push(
      new Operations.ConnectOperation(
        isInput
          ? {
              srcNode: uuid,
              srcO: 0,
              dstNode: node.uuid,
              dstI: node.inputManager.getIOIndex(io)
            }
          : {
              srcNode: node.uuid,
              srcO: node.outputManager.getIOIndex(io),
              dstNode: uuid,
              dstI: 0
            })
    );

    connectionOperations = connectionOperations.concat(connections.map((con) => {
      if (isInput) {
        const output = con as Output;
        const src = output.getParent();
        return {
          srcNode: src.uuid,
          srcO: src.outputManager.getIOIndex(output),
          dstNode: uuid,
          dstI: 0
        };
      } else {
        const input = con as Input;
        const dst = input.getParent();
        return {
          srcNode: uuid,
          srcO: 0,
          dstNode: dst.uuid,
          dstI: dst.inputManager.getIOIndex(input)
        };
      }
    }).map(arg => new Operations.ConnectOperation(arg)));

    // 4. Execute & push history
    const operations: Operation[] = (disconnectOperations as Operation[]).concat([addOp]).concat(connectionOperations);
    this.pushHistory(new Operations.SequentialOperation(operations)).do(this);
  }

  public group (): void {
    const op = new Operations.CreateGroupOperation(v4(), this.selectedNodes.map(n => n.uuid));
    this.pushHistory(op).do(this);
  }

  public ungroup (group: GroupElement): void {
    const op = new Operations.RemoveGroupOperation(group.uuid, group.getNodes());
    this.pushHistory(op).do(this);
  }

  public addToGroup (group: GroupElement, nodes: string[]): void {
    const op = new Operations.AddToGroupOperation(group.uuid, nodes);
    this.pushHistory(op).do(this);
  }

  public removeFromGroup (group: GroupElement, nodes: string[]): void {
    const op = new Operations.RemoveFromGroupOperation(group.uuid, nodes);
    this.pushHistory(op).do(this);
  }

  pushGraph (graph: Graph) {
    this.hierarchy.push({
      graph,
      json: {}
    });

    this.setupGraphEvent(graph);
    this.loadGraph(graph.toJSON());
  }

  private setupGraphEvent (graph: Graph): void {
    graph.onStartProcess.on(this.onStartProcess.emit.bind(this));
    graph.onConstructed.on(this.onConstructed.emit.bind(this));
    graph.onFinishProcess.on(this.onFinishProcess.emit.bind(this));
  }

  public loadGraph (json: GraphJSONType): void {
    const remove = new Operations.RemoveNodesOperation(this.nodes);
    const load = new Operations.LoadOperation(json);
    const nested = new Operations.SequentialOperation([remove, load]);
    nested.do(this);

    // this.pushHistory(nested).do(this)
    this.clearHistory();
    // this.setEntireView()

    this.onLoadedGraph.emit({ graph: this.graph });
  }

  public clear (): void {
    this.popAllGraph();
    this.clearCurrentGraph();
  }

  private clearCurrentGraph () {
    this.graph.dispose();
    this.clearHistory();
  }

  private popGraph () {
    this.clearCurrentGraph();

    this.hierarchy.pop();
    const idx = this.hierarchy.length - 1;
    const current = this.hierarchy[idx];
    this.setupGraphEvent(current.graph);
    this.loadGraph(current.json);
  }

  private popAllGraph () {
    const count = this.hierarchy.length;
    for (let i = count - 1; i >= 1; i--) {
      this.popGraph();
    }
  }

  // save current graph as json
  keepSelectedGraph () {
    const idx = this.hierarchy.length - 1;
    const json = this.hierarchy[idx].graph.toJSON();
    this.hierarchy[idx].json = json;
  }

  // #region UI

  panable (which: number, shiftKey: boolean): boolean {
    return (which === 1 && shiftKey) || which === 2 || which === 3;
  }

  pan (dx: number, dy: number): void {
    this.panning = true;
    this.move(dx, dy);
  }

  move (dx: number, dy: number): void {
    this.position.x += dx;
    this.position.y += dy;
    this.transform(this.position.x, this.position.y, this.scale);
  }

  zoom (delta: number, x: number, y: number, w: number, h: number): void {
    const ns = this.scale * (1 + delta);
    if (ns < minScale || maxScale < ns) { return; }

    // calculate a absolute position
    const ax = this.position.x / this.scale;
    const ay = this.position.y / this.scale;

    const rx = x / w;
    const ry = y / h;

    this.position.x = (ax * ns) - w * delta * rx;
    this.position.y = (ay * ns) - h * delta * ry;
    this.scale = ns;

    this.transform(this.position.x, this.position.y, this.scale);
  }

  private getDocumentPosition (node: NodeBase): Vector2 {
    const vr = this.el.getBoundingClientRect();
    const view = this.graphView.findNodeView(node);
    if (view !== undefined) {
      const nr = view.dom.getBoundingClientRect();
      const p = view.getPosition();
      const nx = -(p.x * this.scale - vr.width * 0.5 + nr.width * 0.5);
      const ny = -(p.y * this.scale - vr.height * 0.5 + nr.height * 0.5);
      return new Vector2(nx, ny);
    }
    return new Vector2();
  }

  public focus (uuid: string): void {
    const node = this.nodes.find(node => node.uuid === uuid);
    if (node === undefined) { return; }

    const to = this.getDocumentPosition(node);

    // https://github.com/tweenjs/tween.js/
    const tw = new TWEEN.Tween(this.position)
      .to(to, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        this.transform(this.position.x, this.position.y, this.scale);
      })
      .start();
    this.tweens.add(tw);
  }

  transform (px: number, py: number, s: number): void {
    this.view.style.transform = `translate(${px}px, ${py}px) scale(${s})`;

    const x = px / s; const y = py / s;
    this.grid.style.transform = `translate(${-x}px, ${-y}px)`;

    const percent = `${100 / s}%`;
    this.grid.style.width = this.grid.style.height = percent;
    this.grid.style.backgroundPosition = `${x}px ${y}px`;
    this.grid.style.opacity = `${Math.min(1, s * s)}`;
  }

  getWorld (domX: number, domY: number): Vector2 {
    return new Vector2(
      (domX - this.position.x) / this.scale,
      (domY - this.position.y) / this.scale
    );
  }

  // #region GUI history

  pushHistory (op: Operation): Operation {
    const len = this.history.length;
    if (this.current < len) {
      this.history.splice(this.current, len - this.current);
    }
    this.history.push(op);
    this.current++;

    const limit = 15;
    if (this.history.length > limit) {
      this.history.splice(0, 1);
      this.current--;
    }

    return op;
  }

  clearHistory (): void {
    this.history = [];
    this.current = 0;
  }

  hasHistory (): boolean {
    return this.history.length > 0;
  }

  public redo (): void {
    if (this.current >= this.history.length) { return; }
    this.history[this.current].do(this);
    this.current++;
  }

  public undo (): void {
    if (this.current <= 0) { return; }
    this.current--;
    this.history[this.current].undo(this);
  }

  // #endregion GUI history

  public setEntireView (): void {
    const nodes = this.graphView.getNodes();
    if (nodes.length <= 0) {
      return;
    }

    let l = Number.MAX_VALUE;
    let r = Number.MIN_VALUE;
    let t = Number.MAX_VALUE;
    let b = Number.MIN_VALUE;
    nodes.forEach((node) => {
      const rect = node.dom.getBoundingClientRect();
      l = Math.min(l, rect.left / this.scale);
      r = Math.max(r, rect.right / this.scale);
      t = Math.min(t, rect.top / this.scale);
      b = Math.max(b, rect.bottom / this.scale);
    });

    const offset = 40;
    t -= offset;

    const rect = this.el.getBoundingClientRect();
    const w = r - l;
    const h = b - t;
    const sw = rect.width / w;
    const sh = rect.height / h;
    let scale = Math.min(sw, sh);
    scale = Math.max(minScale, Math.min(scale, maxScale));

    this.position.x -= l * this.scale;
    this.position.y -= t * this.scale;
    this.transform(this.position.x, this.position.y, this.scale);
  }

  public togglePreview (): void {
    if (this.selectedNodes.length > 0) {
      this.selectedNodes.forEach(n => n.toggleVisibility());
    } else {
      this.nodes.forEach(n => n.toggleVisibility());
    }
  }

  public setPreview (visibility: boolean): void {
    if (this.selectedNodes.length > 0) {
      this.selectedNodes.forEach(n => n.setVisibility(visibility));
    } else {
      this.nodes.forEach(n => n.setVisibility(visibility));
    }
  }

  public togglePerformance (): void {
    this.showPerformance = !this.showPerformance;
    this.graphView.getNodes().forEach((n) => {
      if (this.showPerformance) {
        n.showPerformance();
      } else {
        n.hidePerformance();
      }
    });
  }

  public copySelectedNodesToClipboard (): string {
    const nodes = this.selectedNodes;
    return this.copyNodesToClipboard(nodes, undefined);
  }

  protected copyNodesToClipboard (nodes: NodeBase[], e: ClipboardEvent | undefined): string {
    const text = JSON.stringify(nodes.map(n => n.toJSON(getNodeConstructorNameOfInstance(n)!)));
    if (e !== undefined) {
      e.clipboardData?.setData('text/plain', text);
    } else {
      window.navigator.clipboard.writeText(text);
    }
    return text;
  }

  public pasteNodesFromClipboard (e: ClipboardEvent | undefined = undefined): void {
    if (e !== undefined) {
      const text = e.clipboardData?.getData('text/plain');
      if (text !== undefined && text.length > 0) {
        const nodes = JSON.parse(text);
        this.pasteNodes(nodes);
      }
    } else {
      window.navigator.clipboard.readText().then((text) => {
        if (text.length > 0) {
          const nodes = JSON.parse(text);
          this.pasteNodes(nodes);
        }
      });
    }
  }

  pasteNodes (jsons: NodeJSONType[]): void {
    // CAUTION: Keep connections between
    //            - copied outputs to copied inputs
    //            - non-copied outputs to copied inputs

    const mapping: { [index: string]: string } = {};
    jsons.forEach((json) => {
      mapping[json.uuid] = v4();
    });

    const cloned = jsons.map((json) => {
      const cloned = JSON.parse(JSON.stringify(json)) as NodeJSONType;
      // change uuid mappings
      cloned.uuid = mapping[cloned.uuid];
      cloned.inputs.forEach((io) => {
        io.connections = io.connections.map((con) => {
          // check if connection is inside `jsons`
          if (con.uuid in mapping) {
            con.uuid = mapping[con.uuid];
          }
          return con;
        });
      });
      cloned.outputs.forEach((io) => {
        io.connections = io.connections.map((con) => {
          // check if connection is inside `jsons`
          if (con.uuid in mapping) {
            con.uuid = mapping[con.uuid];
          }
          return con;
        });
      });
      return cloned;
    });

    // Extract non-copied nodes
    const copied = this.createNodesJSON(cloned);

    //  paste nodes to cursor position
    {
      const start = { x: Number.MAX_VALUE, y: Number.MAX_VALUE };
      copied.forEach((n) => {
        const position = n.getPosition();
        start.x = Math.min(position.x, start.x);
        start.y = Math.min(position.y, start.y);
      });

      const r = this.el.getBoundingClientRect();
      const x = this.prevMousePosition.x - r.x;
      const y = this.prevMousePosition.y - r.y;
      const wp = this.getWorld(x, y);

      const dx = wp.x - start.x; const dy = wp.y - start.y;
      copied.forEach((n) => {
        n.move(dx, dy);
      });
    }

    // Connect copied outputs to copied inputs
    this.connectNodesJSON(cloned, copied);

    const load = new Operations.LoadOperation({ version: GraphJSONVersion, nodes: copied.map(n => n.toJSON(getNodeConstructorNameOfInstance(n)!)), groups: [] });
    this.pushHistory(load);

    this.unselectAllNodes();
    this.selectNodes(copied);

    // this.graph.notifyGraphConstructed();
  }

  public createNodesJSON (jsons: NodeJSONType[]): NodeBase[] {
    if (this.graph === undefined) { return []; }
    return this.graph.createNodesJSON(jsons);
  }

  public connectNodesJSON (jsons: NodeJSONType[], nodes: NodeBase[]): void {
    if (this.graph === undefined) { return; }
    this.graph.connectNodesJSON(jsons, nodes);
  }

  protected setupEvent (): void {
    this.el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    this.el.addEventListener('wheel', (e) => {
      const r = this.el.getBoundingClientRect();
      const x = e.clientX - r.x;
      const y = e.clientY - r.y;
      const delta = -e.deltaY * 0.001;
      this.zoom(delta, x, y, r.width, r.height);
      e.preventDefault();
    });

    window.addEventListener('keydown', this.onKeyDownWindow, false);
    window.addEventListener('keyup', this.onKeyUpWindow, false);
    document.addEventListener('copy', this.onCopyDocument, false);
    document.addEventListener('paste', this.onPasteDocument, false);
    this.el.addEventListener('mousedown', this.onMouseDown, false);
    this.el.addEventListener('mousemove', this.onMouseMove, false);
    this.el.addEventListener('mouseup', this.onMouseUp, false);
    this.el.addEventListener('click', this.onMouseClick, false);
    this.el.addEventListener('contextmenu', this.onRightMouseClick, false);
    this.el.addEventListener('dblclick', this.onMouseDoubleClick, false);
    this.el.addEventListener('mouseover', this.onMouseOver, false);
    this.el.addEventListener('mouseout', this.onMouseOut, false);
  }

  createView (): HTMLDivElement {
    const view = document.createElement('div');
    view.classList.add('view');
    view.addEventListener('mousedown', (e) => { }, false);
    view.addEventListener('touchstart', (e) => { }, false);
    view.addEventListener('click', (e) => { }, false);
    view.addEventListener('dblclick', (e) => { }, false);
    return view;
  }

  createGrid (): HTMLDivElement {
    const grid = document.createElement('div');
    grid.classList.add('grid');
    return grid;
  }

  appendElement (dom: HTMLElement): void {
    this.view.appendChild(dom);
    this.move(0, 0); // to fix a bug in Chrome
  }

  protected trackUIEvent (e: MouseEvent | KeyboardEvent): void {
  }

  protected onCopyDocument = (e: ClipboardEvent): void => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) { return; }
    e.preventDefault();
    if (this.selectedNodes.length <= 0) { return; }
    this.copyNodesToClipboard(this.selectedNodes, e);
  };

  protected onPasteDocument = (e: ClipboardEvent): void => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) { return; }
    e.preventDefault();
    this.pasteNodesFromClipboard(e);
  };

  protected onKeyDownWindow = (e: KeyboardEvent): void => {
    if (e.target !== document.body) { return; }

    this.trackUIEvent(e);
    this.panning = false;

    this.state = this.state.keyDown(this, e);

    if (e.ctrlKey || e.metaKey) {
      if (
        e.key === KeyCodeStrings.c ||
        e.key === KeyCodeStrings.v
      ) {
        // CAUTION: return to avoid e.preventDefault() for copy & paste command detection
        return;
      } else if (e.key === KeyCodeStrings.y || (e.key === KeyCodeStrings.Z)) {
        this.redo();
      } else if (e.key === KeyCodeStrings.z) {
        this.undo();
      } else if (e.key === KeyCodeStrings.e) {
        this.setEntireView();
      } else if (e.key === KeyCodeStrings.p) {
        this.togglePreview();
      } else if (e.key === KeyCodeStrings.d) {
        this.togglePerformance();
      }
    }

    e.preventDefault();
  };

  protected onKeyUpWindow = (e: KeyboardEvent): void => {
    // console.log('key up', e.keyCode, e.target !== document.body)
    if (e.target !== document.body) {
      return;
    }
    this.trackUIEvent(e);
    this.state = this.state.keyUp(this, e);
  };

  public prepareMousePosition (p: Vector2): void {
    this.prevMousePosition.copy(p);
  }

  protected onMouseDown = (e: MouseEvent): void => {
    this.trackUIEvent(e);
    this.panning = false;

    const input = new EditorMouseInput(this, e);
    this.state = this.state.mouseDown(this, input);
  };

  protected onMouseMove = (e: MouseEvent): void => {
    this.trackUIEvent(e);
    const input = new EditorMouseInput(this, e);

    if (this.panable(input.which, e.shiftKey)) {
      this.pan(input.position.x - this.prevMousePosition.x, input.position.y - this.prevMousePosition.y);

      // Reset drag points
      this.selectedNodes.forEach(node => node.prepareTransform());
    }

    this.state = this.state.mouseMove(this, input);

    this.prevMousePosition.copy(input.position);
  };

  protected onMouseUp = (e: MouseEvent): void => {
    this.trackUIEvent(e);
    const input = new EditorMouseInput(this, e);
    this.state = this.state.mouseUp(this, input);
    this.panning = false;
  };

  protected onMouseClick = (e: MouseEvent): void => {
    this.trackUIEvent(e);
  };

  protected onRightMouseClick = (e: MouseEvent): void => {
    this.trackUIEvent(e);
  };

  protected onMouseDoubleClick = (e: MouseEvent): void => {
    this.trackUIEvent(e);
    this.onNodeSearch.emit(e);
  };

  protected onMouseOver = (e: MouseEvent): void => {
    const input = new EditorMouseInput(this, e);
    this.state = this.state.mouseOver(this, input);
  };

  protected onMouseOut = (e: MouseEvent): void => {
    this.trackUIEvent(e);
    const input = new EditorMouseInput(this, e);
    this.state = this.state.mouseOut(this, input);
  };

  public toJSON (): GraphJSONType {
    this.popAllGraph();
    return this.currentGraph.toJSON();
  }

  // #endregion UI

  dispose (): void {
    this.clear();
    this.mainGraphView.dispose();

    [
      this.onStartProcess,
      this.onFinishProcess,
      this.onLoadedGraph,
      this.onConstructed,
      this.onNodeSearch,
      this.onNodeInspector,
      this.onNodeContext,
      this.onIOInspector,
      this.onIOInspectorOut,
      this.onIOContext,
      this.onGroupContext
    ].forEach(e => e.dispose());

    window.removeEventListener('keydown', this.onKeyDownWindow, false);
    window.removeEventListener('keyup', this.onKeyUpWindow, false);
    this.el.removeEventListener('mousedown', this.onMouseDown, false);
    this.el.removeEventListener('mousemove', this.onMouseMove, false);
    this.el.removeEventListener('mouseup', this.onMouseUp, false);
    this.el.removeEventListener('click', this.onMouseClick, false);
    this.el.removeEventListener('contextmenu', this.onRightMouseClick, false);
    this.el.removeEventListener('dblclick', this.onMouseDoubleClick, false);
    this.el.removeEventListener('mouseover', this.onMouseOver, false);
    this.el.removeEventListener('mouseout', this.onMouseOut, false);
    document.removeEventListener('copy', this.onCopyDocument, false);
    document.removeEventListener('paste', this.onPasteDocument, false);

    cancelAnimationFrame(this.requestAnimationId);
  }
}
