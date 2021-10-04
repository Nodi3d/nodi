import { NodesEvent, GraphEvent, NodeConnectEvent, NodeConnectEventArg, NodeEvent, GroupEvent } from './misc/Events';

import { NodeJSONType, NodeBase } from './nodes/NodeBase';
import { Nodes } from './nodes/NodeDictionary';
import { GroupJSONType, GroupElement } from './GroupElement';
import { Process } from './Process';
import { DirectedAcyclicGraph } from './DirectedAcyclicGraph';
import { KilledProcessError } from './misc/KilledProcessError';
import { IO } from './io/IO';
import { NodeConstructorType } from './NodeConstructorType';
import { GraphJSONTypeV0, migrate } from './Migration';
import { Unknown } from './nodes/Unknown';
import { IDisposable } from './misc/IDisposable';

export const GraphJSONVersion = 1;

export type GraphJSONType = {
  version: number;
  nodes: NodeJSONType[],
  groups: GroupJSONType[],
};

export class Graph implements IDisposable {
  public onAddNode: NodeEvent = new NodeEvent();
  public onRemoveNode: NodeEvent = new NodeEvent();
  public onConnectNode: NodeConnectEvent = new NodeConnectEvent();
  public onDisconnectNode: NodeConnectEvent = new NodeConnectEvent();
  public onAddGroup: GroupEvent = new GroupEvent();
  public onRemoveGroup: GroupEvent = new GroupEvent();

  public onStartProcess: GraphEvent = new GraphEvent();
  public onFinishProcess: GraphEvent = new GraphEvent();
  public onConstructed: NodesEvent = new NodesEvent();

  private nodes: NodeBase[] = [];
  private groups: GroupElement[] = [];
  private processQueue: Process[] = [];

  constructor (nodes: NodeBase[] = [], groups: GroupElement[] = []) {
    this.nodes = nodes.slice();
    this.groups = groups.slice();

    this.onConnectNode.on(this.onConnectedNode.bind(this));
    this.onDisconnectNode.on(this.onDisconnectedNode.bind(this));
  }

  addNode (uuid: string, constructor: NodeConstructorType, x: number = 0, y: number = 0): NodeBase {
    const node = new constructor(uuid);
    this.nodes.push(node);

    node.onConnect.on(this.onConnectNode.emit);
    node.onDisconnect.on(this.onDisconnectNode.emit);
    node.onValueChanged.on((e) => {
      this.stepNode(e.node);
    });

    // for SubGraphNode only
    // node.on(Events.EDIT_SUBGRAPH, this.onEditSubGraph.bind(this))
    // node.on(Events.EXPAND_SUBGRAPH, this.onExpandSubGraph.bind(this))

    this.onAddNode.emit({ node });

    node.moveTo(x, y);
    this.stepNode(node);

    return node;
  }

  removeNode (node: NodeBase, fire = true) {
    node.disconnectAllIO();
    node.dispose();

    const idx = this.nodes.indexOf(node);
    this.nodes.splice(idx, 1);

    for (let i = this.groups.length - 1; i >= 0; i--) {
      const grp = this.groups[i];
      grp.removeNode(node.uuid);
      if (grp.isEmpty()) {
        this.removeGroup(grp);
      }
    }

    this.onRemoveNode.emit({ node });
  }

  public removeNodes (UUIDs: string[], fire = true): string[] {
    UUIDs.forEach((id) => {
      const node = this.nodes.find(n => n.uuid === id);
      if (node !== undefined) {
        this.removeNode(node, fire);
      }
    });

    this.notifyGraphConstructed();

    return UUIDs;
  }

  public addGroup (group: GroupElement): void {
    this.groups.push(group);
    this.onAddGroup.emit({ group });
  }

  public removeGroup (group: GroupElement): void {
    group.dispose();
    const idx = this.groups.indexOf(group);
    this.groups.splice(idx, 1);

    this.onRemoveGroup.emit({ group });
  }

  public removeGroups (IDs: string[]): void {
    for (let i = IDs.length - 1; i >= 0; i--) {
      const group = this.groups.find(grp => grp.uuid === IDs[i]);
      if (group !== undefined) {
        this.removeGroup(group);
      }
    }
  }

  public stepNode (node: NodeBase): void {
    this.onStartProcess.emit({ graph: this });

    this.resetNode(node);
    this.processNode(node);
  }

  private processNode (node: NodeBase): Promise<void> {
    const steppable = node.isSteppable();

    if (!(steppable && node.enabled)) {
      this.resetNode(node);
      this.checkProcessesDone();
      return Promise.resolve();
    }

    // nodeを処理しているすべてのprocessをkillして削除
    const others = this.findProcesses(node);
    others.forEach((other) => {
      this.removeProcess(other.pid);
    });

    const proc = new Process(node);
    this.processQueue.push(proc);

    // いきなりstartでなく、tickを挟むことで連続的にstepNodeが呼び出された際に無駄な処理を省く（process.killがコールされるので）
    return proc.tick()
      .then(() => proc.execute())
      .then((_) => {
        node.safe();

        const nexts = node.getNexts();
        nexts.forEach((next) => {
          this.processNode(next);
        });
      }).catch((err: Error) => {
        // 途中でKillされた場合はResetしない & エラー扱いにしない
        if (!(err instanceof KilledProcessError)) {
          this.resetNode(node);
          node.error(err.toString());
          if ((process.env.NODE_ENV === 'development') || process.env.TEST) {
            // console.warn(err);
          }
        }
      }).finally(() => {
        // nexts後にremoveProcessすることですべてのprocessの終わりを検知(processes.length <= 0)できる
        this.removeProcess(proc.pid);
      });
  }

  private findProcesses (node: NodeBase): Process[] {
    return this.processQueue.filter(proc => proc.has(node));
  }

  private removeProcess (pid: string): void {
    const idx = this.processQueue.findIndex(other => other.pid === pid);
    if (idx >= 0) {
      const proc = this.processQueue[idx];
      proc.kill();
      this.processQueue.splice(idx, 1);
    }
    this.checkProcessesDone();
  }

  private removeAllProcesses (): void {
    this.processQueue.forEach((proc) => {
      proc.kill();
    });
    this.processQueue = [];
    this.checkProcessesDone();
  }

  private checkProcessesDone (): void {
    if (this.processQueue.length <= 0) {
      this.onFinishProcess.emit({ graph: this });
      this.notifyGraphConstructed();
    }
  }

  protected resetNode (node: NodeBase): void {
    const next = node.reset();
    next.forEach((n) => {
      n.reset();
      this.resetNode(n);
    });
  }

  public getParentNode (io: IO): NodeBase | undefined {
    return this.nodes.find(n => n.hasIO(io));
  }

  public connectIO (srcN: NodeBase, srcO: number = 0, dstN: NodeBase, dstI: number = 0): void {
    if (srcN.existIO(srcO, dstN, dstI)) {
      return;
    }
    srcN.connectIO(srcO, dstN, dstI);
  }

  disconnectIO (srcN: NodeBase, srcO: number, dstN: NodeBase, dstI: number): void {
    if (!srcN.existIO(srcO, dstN, dstI)) {
      return;
    }
    srcN.disconnectIO(srcO, dstN, dstI);
  }

  protected onConnectedNode (e: NodeConnectEventArg) {
    this.stepNode(e.destination);
  }

  protected onDisconnectedNode (e: NodeConnectEventArg) {
    this.stepNode(e.destination);
  }

  public dispose (): void {
    this.removeNodes(this.nodes.map(n => n.uuid), false);
    this.removeGroups(this.groups.map(grp => grp.uuid));
    this.removeAllProcesses();

    // dispose listeners
    this.onAddNode.dispose();
    this.onRemoveNode.dispose();
    this.onConnectNode.dispose();
    this.onDisconnectNode.dispose();
    this.onAddGroup.dispose();
    this.onRemoveGroup.dispose();
    this.onStartProcess.dispose();
    this.onFinishProcess.dispose();
    this.onConnectNode.dispose();
  }

  public createNodesJSON (jsons: NodeJSONType[]): NodeBase[] {
    return jsons.map((json, i) => {
      const map = Nodes as { [name: string]: NodeConstructorType };
      let constructor = map[json.name] as NodeConstructorType;
      if (constructor === undefined) {
        constructor = Unknown;
      }
      const instance = this.addNode(json.uuid, constructor);
      instance.fromJSON(json);
      return instance;
    });
  }

  public connectNodesJSON (jsons: NodeJSONType[], candidates: NodeBase[]): void {
    // Process nodes based on DAG order to resolve errors.
    const tree = new DirectedAcyclicGraph(jsons, candidates);
    const hierarchy = tree.hierarchy;

    const indices = Object.keys(hierarchy).map(s => Number(s)).sort((a, b) => { return (a - b); });
    indices.forEach((idx) => {
      const layer = hierarchy[idx];
      layer.forEach((target) => {
        const json = jsons.find(json => json.uuid === target.uuid);
        if (json === undefined) { return; }

        json.inputs.forEach((input, dstI) => {
          input.connections.forEach((con) => {
            // Connection from the node (which is not includeded in jsons) to `target`
            const found = jsons.find(json => json.uuid === con.uuid);
            if (found === undefined) {
              const srcNode = this.nodes.find(other => (other.uuid === con.uuid));
              if (srcNode !== undefined && srcNode !== target) {
                this.connectIO(srcNode, con.index, target, dstI);
              }
            }
          });
        });

        json.outputs.forEach((output, srcO) => {
          output.connections.forEach((con) => {
            const dst = candidates.find(cand => cand.uuid === con.uuid);
            if (dst !== undefined && target !== dst) {
              this.connectIO(target, srcO, dst, con.index);
            }
          });
        });
      });
    });
  }

  public createGroupsJSON (json: GroupJSONType[]) : GroupElement[] {
    return json.map((el) => {
      const group = new GroupElement(el.uuid, el.nodes);
      this.addGroup(group);
      return group;
    });
  }

  public notifyGraphConstructed (): void {
    this.onConstructed.emit({ nodes: this.nodes });
  }

  public fromJSON (json: any): NodeBase[] {
    if (json.version === undefined) {
      const v0 = json as GraphJSONTypeV0;
      json = migrate(v0);
    }
    const nodes = this.createNodesJSON(json.nodes);
    this.connectNodesJSON(json.nodes, nodes);
    this.createGroupsJSON(json.groups);
    return nodes;
  }

  public toJSON (): GraphJSONType {
    return {
      version: GraphJSONVersion,
      nodes: this.nodes.map(n => n.toJSON()),
      groups: this.groups.map(g => g.toJSON())
    };
  }
}
