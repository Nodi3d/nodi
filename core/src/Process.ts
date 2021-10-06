import { v4 } from 'uuid';
import { KilledProcessError } from './misc/KilledProcessError';
import { NodeBase } from './nodes/NodeBase';

export class Process {
  pid: string = v4();
  node: NodeBase;
  private killed: boolean = false;

  constructor (node: NodeBase) {
    this.node = node;
  }

  public tick (): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve);
    });
  }

  public has (node: NodeBase): boolean {
    return this.node.uuid === node.uuid;
  }

  public execute (): Promise<any> {
    if (this.killed) { return Promise.reject(new KilledProcessError()); }

    return this.node.step().then(() => {
      if (!this.killed) {
        return Promise.resolve(this.node);
      }
      return Promise.reject(new KilledProcessError());
    }).catch((err: Error) => {
      // console.warn(err);
      return Promise.reject(err);
    });
  }

  public kill () {
    this.node.kill();
    this.killed = true;
  }
}
