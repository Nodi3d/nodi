
import NodeBase, { NodeJSONType } from './nodes/NodeBase';

class DAGNode {
  entity: NodeBase;
  prev: string[] = [];
  next: string[] = [];
  index: number = Number.MAX_SAFE_INTEGER;

  constructor (entity: NodeBase) {
    this.entity = entity;
  }

  get uuid () {
    return this.entity.uuid;
  }

  connect (to: DAGNode) {
    if (to.uuid === this.uuid) { return; }
    if (!this.next.includes(to.uuid)) {
      this.next.push(to.uuid);
    }
    if (!to.prev.includes(this.uuid)) {
      to.prev.push(this.uuid);
    }
  }
}

export default class DirectedAcyclicGraph {
  private nodes: { [index: string]: DAGNode } = {};
  hierarchy: { [index: number]: NodeBase[] } = {};

  constructor (jsons: NodeJSONType[], entities: NodeBase[]) {
    // Construct directed acyclic graph

    jsons.forEach((json: NodeJSONType) => {
      const from = entities.find(n => n.uuid === json.uuid);
      if (from === undefined) {
        return;
      }

      const inNode = this.findNode(from.uuid, from);
      json.outputs.forEach((io) => {
        io.connections.forEach((con) => {
          const to = entities.find(other => other.uuid === con.uuid);
          if (to !== undefined) {
            const dst = this.findNode(to.uuid, to);
            inNode.connect(dst);
          }
        });
      });
    });

    this.align();
    this.construct();
  }

  findNode (uuid: string, entity: NodeBase): DAGNode {
    if (!(uuid in this.nodes)) {
      this.nodes[uuid] = new DAGNode(entity);
    }
    return this.nodes[uuid];
  }

  align () {
    const roots = Object.values(this.nodes).filter((n) => {
      return (n.prev.length <= 0);
    });

    let index = 0;
    let next = roots;

    while (next.length > 0) {
      const current = [...next];
      next = [];

      current.forEach((n) => {
        /*
        if(n.index > index) {
        } // else already visited
        */
        n.index = index;
        n.next.forEach((uuid) => {
          const child = this.nodes[uuid];
          if (child !== undefined && !next.includes(child)) {
            next.push(child);
          }
        });
      });

      index++;
    }
  }

  construct () {
    Object.values(this.nodes).forEach((node) => {
      if (!(node.index in this.hierarchy)) {
        this.hierarchy[node.index] = [];
      }
      this.hierarchy[node.index].push(node.entity);
    });
  }
}
