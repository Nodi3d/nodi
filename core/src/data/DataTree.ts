/* eslint no-console: ["error", { allow: ["warn"] }] */

import { IDisposable } from '../misc/IDisposable';
import { ISerializable } from '../misc/ISerializable';
import { BranchJSONType, Branch } from './Branch';
import { DataPath } from './DataPath';
import { PathMask } from './PathMask';

export type DataTreeJSONType = {
  branches: BranchJSONType[];
};

export class DataTree implements IDisposable, ISerializable {
  branches: Branch[] = [];

  constructor (branches: Branch[] = []) {
    this.branches = branches;
  }

  public dispose (): void {
  }

  public isEmpty (): boolean {
    return this.branches.length <= 0;
  }

  public clone (): DataTree {
    return new DataTree(this.branches.map(br => br.clone()));
  }

  public graft (): DataTree {
    const ntree = new DataTree();

    this.branches.forEach((br) => {
      let prev: DataPath = br.getPath().clone();
      prev = prev.append(0);
      br.getValue().forEach((v) => {
        ntree.add([v], prev);
        prev = prev.next();
      });
    });

    return ntree;
  }

  public traverse (f: (value: any) => void): void {
    this.branches.forEach((br) => {
      br.getValue().forEach(v => f(v));
    });
  }

  public shift (offset: number = 1): DataTree {
    // 1. shift all branches
    // 2. group {branches which has a same path} into one branch.

    const tree = this.clone();

    const map: { [name: string]: Branch[] } = { };
    tree.branches.forEach((br) => {
      br.getPath().shift(offset);
      if (!(br.getPath().key in map)) {
        map[br.getPath().key] = [];
      }
      map[br.getPath().key].push(br);
    });

    const nbranches = [];
    for (const key in map) {
      const path = map[key][0].getPath();
      const nvalue: any[] = [];
      map[key].forEach((br) => {
        br.getValue().forEach(v => nvalue.push(v));
      });
      nbranches.push(new Branch(path, nvalue));
    }

    tree.branches = nbranches;

    return tree;
  }

  simplify (): DataTree {
    const tree = this.clone();
    if (this.branches.length <= 0) { return tree; }

    let counter = 0;
    const limit = 50;
    while ((tree.simplifyHeadOnce() || tree.simplifyTailOnce()) && counter < limit) {
      counter++;
    }

    if (counter >= limit) {
      console.warn('simply bug');
    }

    return tree;
  }

  // simplify head index
  // 0:0:0, 0:0:1, 0:0:2, ... => 0, 1, 2
  simplifyHeadOnce (): boolean {
    // remove unused group
    const indices: number[] = [];
    this.branches.forEach((br) => {
      const index = br.getPath().indices[0];
      if (!indices.includes(index)) {
        indices.push(index);
      }
    });

    const last = (this.branches.length <= 1 && this.branches[0].getPath().indices.length <= 1);
    if (indices.length <= 1 && !last) {
      this.branches.forEach(br => br.getPath().simplifyHead());
      return true;
    }

    return false;
  }

  // simplify tail index
  // 0:0:0, 0:1:0, 0:2:0, ... => 0:0, 0:1, 0:2
  simplifyTailOnce (): boolean {
    // original
    const paths = this.branches.map(br => br.getPath().clone());
    const n = paths.length;

    let flag = false;

    this.branches.forEach((br, i) => {
      const path0 = br.getPath();
      const len = path0.indices.length - 1;

      if (len >= 1) {
        let existed = false;

        // check same path until (len) index
        for (let j = 0; j < n; j++) {
          if (i === j) { continue; }
          const path1 = paths[j];

          let match = true;

          for (let k = 0; k < len; k++) {
            match = match && (path0.indices[k] === path1.indices[k]);
            if (!match) { break; }
          }

          if (match) {
            existed = true;
            break;
          }
        }

        if (!existed) {
          br.getPath().simplifyTail();
          flag = true;
        }
      }
    });

    return flag;
  }

  public flatten (): DataTree {
    let flattend: any[] = [];
    this.branches.forEach((br) => {
      flattend = flattend.concat(br.getValue().slice());
    });
    const branches: Branch[] = [new Branch(new DataPath(undefined), flattend)];
    return new DataTree(branches);
  }

  public unflatten (guide: DataTree): DataTree {
    const unflattened: Branch[] = [];

    this.branches.forEach((src) => {
      const value = src.getValue().map(v => v); // copy

      const gbranches = guide.branches;
      for (let i = 0, n = gbranches.length; i < n; i++) {
        const dst = gbranches[i];
        const nvalue = [];
        for (let j = 0, m = dst.getValue().length; j < m; j++) {
          if (value.length <= 0) {
            throw new Error('Unflattened tree has fewer items than guide tree.');
          }
          nvalue.push(value.shift());
        }
        unflattened.push(new Branch(dst.getPath().clone(), nvalue));
      }

      if (value.length > 0) {
        throw new Error('Unflattened tree has more items than guide tree.');
      }
    });

    return new DataTree(unflattened);
  }

  // simplify last index
  // 0:0:0, 0:1:0, 0:2:0, ... => 0:0, 0:1, 0:2

  public reverse (): DataTree {
    const ntree = new DataTree();
    ntree.branches = this.branches.map((br) => {
      const reversed = [];
      const value = br.getValue();
      for (let i = value.length - 1; i >= 0; i--) {
        reversed.push(value[i]);
      }
      return new Branch(br.getPath(), reversed);
    });
    return ntree;
  }

  public flip (): DataTree {
    const flipped: Branch[] = [];

    const rows = this.branches.length;
    if (rows > 0) {
      const item0 = this.branches[0];
      let path = item0.getPath().clone();
      const columns = item0.getValue().length;

      const found = this.branches.find(br => br.getValue().length !== columns);
      if (found !== undefined) {
        throw new Error('Input tree is not matrix-shaped data');
      }

      for (let i = 0; i < columns; i++) {
        const value = this.branches.map(br => br.getValue()[i]);
        flipped.push(new Branch(path.clone(), value));
        path = path.next();
      }
    } else {
      console.warn('flip empty data');
    }

    return new DataTree(flipped);
  }

  public copy (tree: DataTree): void {
    this.branches = tree.branches.slice();
  }

  public merge (tree: DataTree): DataTree {
    const a = this.branches.map(br => br.clone());
    const b = tree.branches.map(br => br.clone());

    b.forEach((br) => {
      const found = a.find(br2 => br2.getPath().equals(br.getPath()));
      if (found === undefined) {
        a.push(br);
      } else {
        br.getValue().forEach((v) => {
          found?.getValue().push(v);
        });
      }
    });

    return new DataTree(this.sort(a));
  }

  public split (sources: string[] = []): { positive: DataTree; negative: DataTree } {
    const positive: Branch[] = [];
    const negative: Branch[] = [];

    const masks = sources.map((m) => {
      const left = m[0];
      const right = m[m.length - 1];
      if (left !== '{' || right !== '}') {
        throw new Error(`Invalid mask format ${m}`);
      }

      const pattern = m.substr(1, m.length - 2);
      return new PathMask(pattern);
    });

    this.branches.forEach((br) => {
      const key = br.getPath().toString();
      const result = masks.find(mask => mask.match(key));
      if (result !== undefined) {
        positive.push(br);
      } else {
        negative.push(br);
      }
    });

    return {
      positive: new DataTree(positive),
      negative: new DataTree(negative)
    };
  }

  public add (value: any[] = [], path: DataPath | undefined = undefined): DataTree {
    if (path === undefined) {
      // add to last
      this.push(value);
    } else {
      const found = this.branches.find(br => br.getPath().key === path.key);
      if (found !== undefined) {
        found.setValue(found.getValue().concat(value));
      } else {
        this.create(path, value);
      }
    }

    return this;
  }

  public push (value: any[] = []): DataTree {
    if (this.branches.length <= 0) {
      const path = new DataPath(undefined);
      this.create(path, value);
    } else {
      // console.trace('push more', value)
      const last = this.branches[this.branches.length - 1];
      const path = last.getPath().next();
      this.create(path, value);
    }

    return this;
  }

  public create (path: DataPath, value: any): DataTree {
    const branch = new Branch(path, value);
    this.branches.push(branch);
    this.branches = this.sort(this.branches);

    return this;
  }

  // sort by path
  public sort (branches: Branch[]): Branch[] {
    branches.sort((a, b) => {
      return a.getPath().compare(b.getPath());
    });
    return branches;
  }

  public getMaxDepth (): number {
    let max = 0;
    this.branches.forEach((br) => {
      max = Math.max(max, br.getPath().getDepth());
    });
    return max;
  }

  public getBranchCount (): number {
    return this.branches.length;
  }

  public getBranchByIndex (idx: number): Branch | undefined {
    if (this.branches.length <= 0) { return undefined; }
    return this.branches[Math.min(idx, this.branches.length - 1)];
  }

  public getBranchByPath (path: DataPath, debug: boolean = false): Branch | undefined {
    if (this.branches.length <= 0) { return undefined; }
    let candidates = this.branches;

    for (let depth = 0, maxDepth = path.indices.length; depth < maxDepth; depth++) {
      const index = path.indices[depth];
      const ncandidates = [];

      const n = candidates.length;
      for (let j = 0; j < n; j++) {
        const cand = candidates[j];
        const cp = cand.getPath();
        if (depth < cp.indices.length && cp.indices[depth] === index) {
          ncandidates.push(cand);
        }
      }

      const nlen = ncandidates.length;
      if (nlen <= 0) {
        return candidates[n - 1];
      }

      candidates = ncandidates;
    }

    if (candidates.length > 0) {
      return candidates[candidates.length - 1];
    }

    return this.branches[this.branches.length - 1];
  }

  public getItemsByPath (path: DataPath, debug: boolean = false): any[] {
    const br = this.getBranchByPath(path, debug);
    if (br !== undefined) {
      return br.getValue();
    }
    return [];
  }

  public getItemsByIndex (idx: number, debug: boolean = false): any[] {
    const br = this.getBranchByIndex(idx);
    if (br !== undefined) {
      return br.getValue();
    }
    return [];
  }

  public getItemCount (): number {
    let count = 0;
    this.branches.forEach((br) => {
      count += br.getValue().length;
    });
    return count;
  }

  public toJSON (): DataTreeJSONType {
    return {
      branches: this.branches.map(br => br.toJSON())
    };
  }

  fromJSON (json: DataTreeJSONType): void {
    this.branches.forEach((br, index) => {
      if (index < json.branches.length) {
        const source = json.branches[index];
        br.fromJSON(source);
      }
    });
  }
}
