import { InputManager } from '../io/InputManager';
import { OutputManager } from '../io/OutputManager';
import { NodeBase } from '../nodes/NodeBase';
import { AccessTypes } from './AccessTypes';
import { Branch } from './Branch';
import { DataPath } from './DataPath';
import { DataTree } from './DataTree';
import { DataAccess } from './DataAccess';

export class DataAccessor {
  private input: WeakRef<InputManager>;
  private trees: (DataTree | undefined)[];
  private output: WeakRef<OutputManager>;

  private principalDataTreeIndex: number = 0;
  private inAccessTypes: AccessTypes[];
  private outAccessTypes: AccessTypes[];
  private inValues: (DataTree | Branch[])[] = [];
  private inValueLength: number = 0;
  private result: DataAccess[] = [];
  private counter: { [index: string]: number } = {};

  public getResult (): DataAccess[] {
    return this.result;
  }

  public getCount (path: DataPath): number {
    const key = path.key;
    if (key in this.counter) {
      return this.counter[key];
    }
    return 0;
  }

  constructor (inputManager: InputManager, outputManager: OutputManager) {
    this.input = new WeakRef(inputManager);
    this.output = new WeakRef(outputManager);

    const inputs = inputManager.inputs;
    this.trees = inputs.map(io => io.getData());
    const trees = this.trees.map(tr => tr ?? new DataTree());
    this.inAccessTypes = inputs.map(input => input.getAccessType());
    this.outAccessTypes = outputManager.outputs.map(output => output.getAccessType());

    this.principalDataTreeIndex = this.getPrincipalDataTreeIndex(trees);

    // create (Branch | Tree) pairs

    this.inValues = trees.map((tree, idx) => {
      switch (this.inAccessTypes[idx]) {
        case AccessTypes.ITEM:
        case AccessTypes.LIST: {
          return tree.branches;
        }
        case AccessTypes.TREE: {
          return tree;
        }
      }
      return tree;
    });

    if (this.inValues.length > 0) {
      this.inValueLength = Math.max(...this.inValues.map((i) => {
        if (Array.isArray(i)) { return i.length; }
        return 1;
      }));
    }
  }

  public async solve (node: NodeBase): Promise<void> {
    const count = this.getInCount();
    const hasNoInputs = this.inAccessTypes.length <= 0;
    if (node.async) {
      if (count > 0) {
        for (let index = 0; index < count; index++) {
          await this.iterateAsync(node, index, this.oneAsync.bind(this));
        }
      } else if (hasNoInputs) {
        // in case of no inputs
        const access = this.createDefaultDataAccess();
        await this.oneAsync(node, access);
      }
    } else if (count > 0) {
      for (let index = 0; index < count; index++) {
        this.iterate(node, index, this.one.bind(this));
      }
    } else if (hasNoInputs) {
      // in case of no inputs
      const access = this.createDefaultDataAccess();
      this.one(node, access);
    }
    return Promise.resolve();
  }

  public createDefaultDataAccess (): DataAccess {
    const access = new DataAccess(0, new DataPath(), this.inAccessTypes, [], this.outAccessTypes);
    return access;
  }

  public one (node: NodeBase, access: DataAccess): void {
    node.solve(access);
    this.result.push(access);
  }

  public async oneAsync (node: NodeBase, access: DataAccess): Promise<void> {
    await node.solve(access);
    this.result.push(access);
    return Promise.resolve();
  }

  private getDataAccesses (index: number): {
    accesses: DataAccess[];
    hasUndefined: boolean;
  } {
    const input = this.input.deref() as InputManager;
    const trees = this.trees;

    let path: DataPath = new DataPath();
    let hasUndefined = false;

    const args = trees.map((tree, idx) => {
      const access = this.inAccessTypes[idx];
      const optional = input.inputs[idx].isOptional();
      switch (access) {
        case AccessTypes.ITEM:
        case AccessTypes.LIST: {
          const br = tree?.getBranchByIndex(index);
          if (idx === this.principalDataTreeIndex) {
            path = br?.getPath() ?? path;
          }
          const arr = br?.getValue() ?? [];
          hasUndefined = hasUndefined || (arr.length <= 0 && !optional);

          // 1 dim array or 2 dim array
          return (access === AccessTypes.ITEM) ? arr : [arr];
        }
        case AccessTypes.TREE: {
          return [tree ?? new DataTree()];
        }
      }
      return [];
    });

    const lengthes = args.map(arg => arg.length);
    const maxCount = Math.max(...lengthes);

    const accesses: DataAccess[] = [];

    // increment
    const key = path.key;
    if (!(key in this.counter)) {
      this.counter[key] = 0;
    }
    path = path.increment(this.counter[key]);
    this.counter[key]++;

    // if pass through undefined inputs or not
    if (hasUndefined) {
      // principal.add([], path);
    } else {
      for (let i = 0; i < maxCount; i++) {
        const inValues = args.map((arg, j) => {
          const len = lengthes[j] - 1;
          if (len < 0) { return undefined; }
          const idx = Math.min(i, len);
          return arg[idx];
        });
        const access = new DataAccess(i, path, this.inAccessTypes, inValues, this.outAccessTypes);
        accesses.push(access);
      }
    }

    return {
      accesses, hasUndefined
    };
  }

  public iterate (node: NodeBase, index: number, callback: (node: NodeBase, access: DataAccess) => void): void {
    const { accesses, hasUndefined } = this.getDataAccesses(index);
    if (hasUndefined) {
      return;
    }
    accesses.forEach((access) => {
      callback(node, access);
    });
  }

  public async iterateAsync (
    node: NodeBase,
    index: number,
    callback: (node: NodeBase, access: DataAccess) => Promise<void>
  ): Promise<void> {
    const { accesses, hasUndefined } = this.getDataAccesses(index);
    if (hasUndefined) {
      return Promise.resolve();
    }

    for (let i = 0, n = accesses.length; i < n; i++) {
      const access = accesses[i];
      await callback(node, access);
    }
    return Promise.resolve();
  }

  public getInCount (): number {
    return this.inValueLength;
  }

  protected getPrincipalDataTreeIndex (trees: DataTree[]): number {
    let depth = -1;
    let principal: number = -1;
    let levels: DataTree[] = [];

    trees.forEach((tree, i) => {
      const d = tree.getMaxDepth();
      if (d > depth) {
        depth = d;
        principal = i;
        levels = [tree];
      } else if (d === depth) {
        levels.push(tree);
      }
    });

    // 同じ深さのDataTreeが複数ある場合、
    // indicesの長さで比較
    if (levels.length > 1) {
      let length = -1;
      let longest: DataTree;

      levels.forEach((t) => {
        if (!t.isEmpty()) {
          const last = t.branches[t.branches.length - 1];
          const i0 = last.getPath().indices[0];
          if (i0 > length) {
            length = i0;
            longest = t;
          }
        }
      });

      if (longest!!) {
        principal = trees.indexOf(longest);
      }
    }

    return principal;
  }
}
