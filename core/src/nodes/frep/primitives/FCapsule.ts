import { Vector3 } from 'three';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NFrepShape } from '../../../math/frep/NFrepShape';
import { NBoundingBox } from '../../../math/geometry/NBoundingBox';
import { NPoint } from '../../../math/geometry/NPoint';
import { NPlane } from '../../../math/geometry/NPlane';
import { NDomain } from '../../../math/primitive/NDomain';
import { FrepNodeBase } from '../FrepNodeBase';

export class FCapsule extends FrepNodeBase {
  public get displayName (): string {
    return 'FCapsule';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('s', 'Start point of capsule', DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint()]));
    manager.add('e', 'End point of capsule', DataTypes.POINT, AccessTypes.ITEM).setDefault(new DataTree().add([new NPoint(0, 0, 1)]));
    manager.add('r', 'Radius', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([0.5]));
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('f', 'Frep capsule', DataTypes.FREP, AccessTypes.ITEM);
  }

  public solve (access: DataAccess): void {
    const start = access.getData(0) as NPoint;
    const end = access.getData(1) as NPoint;
    let r = access.getData(2) as number;
    r = Math.max(r, Number.EPSILON);

    const f = function (p: string) {
      return `sdCapsule(${p}, vec3(${start.x}, ${start.y}, ${start.z}), vec3(${end.x}, ${end.y}, ${end.z}), ${r.toFixed(2)})`;
    };

    const dir = (new Vector3()).subVectors(end, start);
    const offset = start.clone().add(dir.clone().multiplyScalar(0.5));
    const plane = new NPlane(offset);
    const dx = dir.clone().projectOnVector(plane.xAxis);
    const dy = dir.clone().projectOnVector(plane.yAxis);
    const dz = dir.clone().projectOnVector(plane.normal);
    const lx = dx.length() * 0.5;
    const ly = dy.length() * 0.5;
    const lz = dz.length() * 0.5;
    const bb = new NBoundingBox(
      plane,
      new NDomain(-lx - r, lx + r),
      new NDomain(-ly - r, ly + r),
      new NDomain(-lz - r, lz + r)
    );
    const frep = new NFrepShape(f, bb);
    access.setData(0, frep);
  }
}
