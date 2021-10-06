import { Color, Vector3 } from 'three';
import { NVArrow } from '@/src/preview/elements/NVArrow';
import { NVTextSprite } from '@/src/preview/elements/NVTextSprite';
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataAccessor } from '../../../data/DataAccessor';
import { DataTree } from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NLineCurve } from '../../../math/geometry/curve/NLineCurve';
import { NPolylineCurve } from '../../../math/geometry/curve/NPolylineCurve';
import { NPlane } from '../../../math/geometry/NPlane';
import { IElementable } from '../../../misc/IElementable';
import { IDisplayNode } from '../../IDisplayNode';
import { NodeBase } from '../../NodeBase';

export class LineDisplay extends NodeBase implements IDisplayNode {
  public get displayName (): string {
    return 'L Dis';
  }

  public get previewable (): true {
    return true;
  }

  public registerInputs (manager: InputManager): void {
    manager.add('c', 'Polyline curve or Line curve to display', DataTypes.CURVE, AccessTypes.ITEM);
    manager.add('b', 'Base plane for measure', DataTypes.PLANE, AccessTypes.ITEM).setDefault(new DataTree().add([new NPlane()]));
    manager.add('o', 'Label offfset', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('p', 'Precision for displayed length', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([3]));
    manager.add('t', 'Text size', DataTypes.NUMBER, AccessTypes.ITEM).setDefault(new DataTree().add([1]));
    manager.add('d', 'Forward direction or not', DataTypes.BOOLEAN, AccessTypes.ITEM).setDefault(new DataTree().add([true]));
  }

  public registerOutputs (_manager: OutputManager): void {
  }

  public solve (_access: DataAccess): void {
  }

  public display (): IElementable[] {
    const da = new DataAccessor(this.inputManager, this.outputManager);
    const count = da.getInCount();

    const elements: IElementable[] = [];
    for (let i = 0; i < count; i++) {
      da.iterate(this, i, (_, access) => {
        const curve = access.getData(0) as NCurve;
        const plane = access.getData(1) as NPlane;
        const offset = access.getData(2) as number;
        const precision = access.getData(3) as number;
        const size = access.getData(4) as number;
        const forward = access.getData(5) as boolean;

        if (curve instanceof NLineCurve || curve instanceof NPolylineCurve) {
          const points = curve.points.slice();
          if (curve.closed && points.length > 0) {
            points.push(points[0]);
          }
          for (let i = 0, n = points.length - 1; i < n; i++) {
            this.createDisplay(points[i], points[i + 1], plane, offset, precision, size, forward).forEach((el) => {
              elements.push(el);
            });
          }
        }
        return [];
      });
    }

    return elements;
  }

  private createDisplay (a: Vector3, b: Vector3, plane: NPlane, offset: number, precision: number, size: number, forward: boolean): IElementable[] {
    const dir = (new Vector3()).subVectors(b, a);
    const len = dir.length();
    const tangent = dir.clone().normalize();
    let normal = plane.normal;
    if (tangent.dot(normal) >= 0.99999) {
      normal = plane.xAxis;
    }
    let binormal = (new Vector3()).crossVectors(tangent, normal).multiplyScalar(offset);
    if (!forward) {
      binormal = binormal.multiplyScalar(-1);
    }

    const pow = Math.pow(10, Math.max(Math.round(precision), 1));
    const dispLength = Math.round(len * pow) / pow;
    const sprite = new NVTextSprite(dispLength.toString(), 'black', size);

    const m = a.clone().add(dir.clone().multiplyScalar(0.5));
    const center = m.add(binormal);
    sprite.position.copy(center);

    const hl = size * 0.25;
    const al = len * 0.5 - size;
    const arrow0 = new NVArrow(tangent, center.clone().add(tangent.clone().multiplyScalar(size)), al, new Color(0, 0, 0), hl, hl);
    const arrow1 = new NVArrow(tangent.clone().multiplyScalar(-1), center.clone().add(tangent.clone().multiplyScalar(-size)), al, new Color(0, 0, 0), hl, hl);

    return [
      sprite, arrow0, arrow1
    ];
  }
}
