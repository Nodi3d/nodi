import { Matrix4 } from 'three';
import IBoundable, { isBoundable } from '../geometry/IBoundable';
import ITransformable, { isTransformable, TransformerType } from '../geometry/ITransformable';
import NBoundingBox from '../geometry/NBoundingBox';
import NPlane from '../geometry/NPlane';
import NDomain from './NDomain';

export default class NGroup implements IBoundable, ITransformable {
  objects: any[];

  constructor (objects: any = []) {
    this.objects = objects;
  }

  add (object: any) {
    this.objects.push(object);
  }

  clone () {
    return new NGroup(this.objects.slice());
  }

  dispose () {
  }

  bounds (plane: NPlane): NBoundingBox {
    const min = Number.MAX_VALUE;
    const max = -Number.MAX_VALUE;
    let bb = new NBoundingBox(plane, new NDomain(min, max), new NDomain(min, max), new NDomain(min, max));
    const boundables = this.objects.filter(o => isBoundable(o));
    if (boundables.length > 0) {
      bb = boundables[0].bounds(plane);
    }
    for (let i = 1, n = boundables.length; i < n; i++) {
      bb.encapsulate(boundables[i].bounds(plane));
    }
    return bb;
  }

  area (): number {
    throw new Error('Method not implemented.');
  }

  applyMatrix (matrix: Matrix4): ITransformable {
    const transformables = this.objects.filter(o => isTransformable(o));
    const objects = transformables.map(o => o.applyMatrix(matrix));
    return new NGroup(objects);
  }

  transform (f: TransformerType): ITransformable {
    const transformables = this.objects.filter(o => isTransformable(o));
    const objects = transformables.map(o => o.transform(f));
    return new NGroup(objects);
  }
}
