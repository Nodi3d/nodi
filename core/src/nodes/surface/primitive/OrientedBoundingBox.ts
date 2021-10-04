
import { AccessTypes } from '../../../data/AccessTypes';
import { DataAccess } from '../../../data/DataAccess';
import { DataTypes } from '../../../data/DataTypes';
import { InputManager } from '../../../io/InputManager';
import { OutputManager } from '../../../io/OutputManager';
import { NCurve } from '../../../math/geometry/curve/NCurve';
import { NPolylineCurve } from '../../../math/geometry/curve/NPolylineCurve';
import { NMesh } from '../../../math/geometry/mesh/NMesh';
import { NOrientedBoundingBox } from '../../../math/geometry/NOrientedBoundingBox';
import { NGeometryUtils } from '../../../math/NGeometryUtils';
import { NodeBase } from '../../NodeBase';

export class OrientedBoundingBox extends NodeBase {
  get displayName (): string {
    return 'OBBox';
  }

  public registerInputs (manager: InputManager): void {
    manager.add('g', 'Geometry to contain', DataTypes.CURVE | DataTypes.MESH, AccessTypes.ITEM);
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('p', 'Corner points for oriented bounding box', DataTypes.POINT, AccessTypes.LIST);
    manager.add('c', 'Face curves for oriented bounding box', DataTypes.CURVE, AccessTypes.LIST);
  }

  public solve (access: DataAccess): void {
    const geom = access.getData(0);

    if (geom instanceof NMesh) {
      const g = geom.build();
      const vertices = NGeometryUtils.getVertices(g);
      const bb = new NOrientedBoundingBox(vertices);
      access.setDataList(0, bb.vertices);
      access.setDataList(1, bb.faces);
    } else if (geom instanceof NCurve) {
      let bb: NOrientedBoundingBox;
      if (geom instanceof NPolylineCurve) {
        bb = new NOrientedBoundingBox(geom.points);
      } else {
        const resolution = 32;
        const nurbs = geom.toNurbsCurve();
        const points = nurbs.getPoints(resolution);
        bb = new NOrientedBoundingBox(points);
      }

      access.setDataList(0, bb.vertices);
      access.setDataList(1, bb.faces);
    }
  }
}
