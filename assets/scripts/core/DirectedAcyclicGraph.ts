
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
    this.next.push(to.uuid);
    to.prev.push(this.uuid);
  }
}

export default class DirectedAcyclicGraph {
  nodes: DAGNode[] = [];
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
    let found = this.nodes.find(n => n.uuid === uuid);
    if (found === undefined) {
      found = new DAGNode(entity);
      this.nodes.push(found);
    }
    return found;
  }

  align () {
    const roots = this.nodes.filter((n) => {
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
          const child = this.nodes.find(n => n.uuid === uuid);
          // let child = this.findNode(uuid);
          if (child !== undefined && !next.includes(child)) {
            next.push(child);
          }
        });
      });

      index++;
    }
  }

  construct () {
    this.nodes.forEach((node) => {
      if (!(node.index in this.hierarchy)) {
        this.hierarchy[node.index] = [];
      }
      this.hierarchy[node.index].push(node.entity);
    });
  }
}
