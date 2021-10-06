
import { BufferGeometry, Matrix4, Mesh, Vector2, Vector3 } from 'three';
import { NDomain } from '../primitive/NDomain';
import { IBoundable } from './IBoundable';
import { TransformerType, ITransformable } from './ITransformable';
import { NMesh } from './mesh/NMesh';
import { NPlane } from './NPlane';
import { NPoint } from './NPoint';

export class NBoundingBox implements IBoundable, ITransformable {
  plane: NPlane;
  dx: NDomain;
  dy: NDomain;
  dz: NDomain;

  constructor (plane: NPlane, dx: NDomain, dy: NDomain, dz: NDomain) {
    this.plane = plane;
    this.dx = dx;
    this.dy = dy;
    this.dz = dz;
  }

  get isFlat (): boolean {
    return this.dx.size <= 0 || this.dy.size <= 0 || this.dz.size <= 0;
  }

  public static fromPoints (plane: NPlane, points: Vector3[]): NBoundingBox {
    const inf = 1e10;
    const dx = new NDomain(inf, -inf);
    const dy = new NDomain(inf, -inf);
    const dz = new NDomain(inf, -inf);

    points.forEach((p) => {
      p = p.clone().sub(plane.origin);
      const x = plane.xAxis.dot(p);
      const y = plane.yAxis.dot(p);
      const z = plane.normal.dot(p);

      dx.encapsulate(x);
      dy.encapsulate(y);
      dz.encapsulate(z);
    });

    return new NBoundingBox(plane, dx, dy, dz);
  }

  public static fromMesh (plane: NPlane, mesh: NMesh): NBoundingBox {
    return NBoundingBox.fromPoints(plane, mesh.vertices);
  }

  public point (u: number, v: number, w: number = 0): NPoint {
    let p = this.plane.origin.clone();
    p = p.add(this.plane.xAxis.clone().multiplyScalar(this.dx.min + this.dx.size * u));
    p = p.add(this.plane.yAxis.clone().multiplyScalar(this.dy.min + this.dy.size * v));
    p = p.add(this.plane.normal.clone().multiplyScalar(this.dz.min + this.dz.size * w));
    return p;
  }

  public center (): NPoint {
    return this.point(0.5, 0.5, 0.5);
  }

  public closestParam (point: Vector3): Vector2 {
    const plane = this.plane;
    const projected = point.clone().sub(plane.origin).projectOnPlane(plane.normal);
    const x = plane.xAxis.dot(projected);
    const y = plane.yAxis.dot(projected);
    return new Vector2(
      Math.max(0, Math.min((x - this.dx.min) / this.dx.size, 1)),
      Math.max(0, Math.min((y - this.dy.min) / this.dy.size, 1))
    );
  }

  private getDomain (plane: NPlane, points: NPoint[]): {
    x: NDomain;
    y: NDomain;
    z: NDomain;
  } {
    let xMin: number, xMax: number, yMin: number, yMax: number, zMin: number, zMax: number;
    xMin = yMin = zMin = 1e12;
    xMax = yMax = zMax = -1e12;
    points.forEach((p, i) => {
      p = p.sub(plane.origin.clone());
      const x = plane.xAxis.dot(p);
      const y = plane.yAxis.dot(p);
      const z = plane.normal.dot(p);
      if (i <= 0) {
        xMin = xMax = x;
        yMin = yMax = y;
        zMin = zMax = z;
      } else {
        xMin = Math.min(x, xMin);
        xMax = Math.max(x, xMax);
        yMin = Math.min(y, yMin);
        yMax = Math.max(y, yMax);
        zMin = Math.min(z, zMin);
        zMax = Math.max(z, zMax);
      }
    });

    return {
      x: new NDomain(
        Math.min(xMin, xMax), Math.max(xMin, xMax)
      ),
      y: new NDomain(
        Math.min(yMin, yMax), Math.max(yMin, yMax)
      ),
      z: new NDomain(
        Math.min(zMin, zMax), Math.max(zMin, zMax)
      )
    };
  }

  public applyMatrix (matrix: Matrix4): NBoundingBox {
    const plane = this.plane.applyMatrix(matrix);
    const points = this.projectPoints(this.plane).map((p) => {
      return p.applyMatrix(matrix);
    });
    const { x, y, z } = this.getDomain(plane, points);
    return new NBoundingBox(plane, x, y, z);
  }

  public transform (f: TransformerType): NBoundingBox {
    const plane = this.plane.transform(f);
    const points = this.projectPoints(this.plane).map((p) => {
      return f(p);
    });
    const { x, y, z } = this.getDomain(plane, points);
    return new NBoundingBox(plane, x, y, z);
  }

  public encapsulate (other: NBoundingBox): void {
    this.dx.min = Math.min(this.dx.min, other.dx.min);
    this.dy.min = Math.min(this.dy.min, other.dy.min);
    this.dz.min = Math.min(this.dz.min, other.dz.min);

    this.dx.max = Math.max(this.dx.max, other.dx.max);
    this.dy.max = Math.max(this.dy.max, other.dy.max);
    this.dz.max = Math.max(this.dz.max, other.dz.max);
  }

  public area (): number {
    const sx = this.dx.size;
    const sy = this.dy.size;
    const sz = this.dz.size;

    // Area of a Flat Box
    if (this.isFlat) {
      if (sx <= 0) {
        return sy * sz;
      } else if (sy <= 0) {
        return sx * sz;
      }
      return sy * sz;
    }

    const ax = sy * sz;
    const ay = sx * sz;
    const az = sx * sy;
    return ax * 2 + ay * 2 + az * 2;
  }

  public bounds (plane: NPlane): NBoundingBox {
    throw new Error('Method not implemented.');
  }

  public projectPoints (plane: NPlane): NPoint[] {
    const x0 = this.dx.min;
    const x1 = this.dx.max;
    const y0 = this.dy.min;
    const y1 = this.dy.max;
    const z0 = this.dz.min;
    const z1 = this.dz.max;

    const origin = plane.origin;
    const dx0 = plane.xAxis.clone().multiplyScalar(x0);
    const dx1 = plane.xAxis.clone().multiplyScalar(x1);
    const dy0 = plane.yAxis.clone().multiplyScalar(y0);
    const dy1 = plane.yAxis.clone().multiplyScalar(y1);
    const dz0 = plane.normal.clone().multiplyScalar(z0);
    const dz1 = plane.normal.clone().multiplyScalar(z1);

    return [
      // bottom
      origin.clone().add(dx0).add(dy0).add(dz0),
      origin.clone().add(dx1).add(dy0).add(dz0),
      origin.clone().add(dx1).add(dy0).add(dz1),
      origin.clone().add(dx0).add(dy0).add(dz1),

      // up
      origin.clone().add(dx0).add(dy1).add(dz0),
      origin.clone().add(dx1).add(dy1).add(dz0),
      origin.clone().add(dx1).add(dy1).add(dz1),
      origin.clone().add(dx0).add(dy1).add(dz1)
    ];
  }

  public getMinMax (): { min: Vector3, max: Vector3 } {
    const points = this.projectPoints(this.plane);
    let minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number;
    minX = minY = minZ = 1e5;
    maxX = maxY = maxZ = -1e5;
    points.forEach((p) => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      minZ = Math.min(minZ, p.z);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
      maxZ = Math.max(maxZ, p.z);
    });
    return {
      min: new Vector3(minX, minY, minZ),
      max: new Vector3(maxX, maxY, maxZ)
    };
  }

  public get points (): Vector3[] {
    return this.projectPoints(this.plane);
  }

  public get flatPoints (): Vector3[] {
    if (!this.isFlat) {
      throw new Error('BoundingBox is not Flat');
    }

    const points = this.points;
    if (this.dx.size <= 0) {
      return [
        points[0], points[4], points[6], points[2]
      ];
    } else if (this.dy.size <= 0) {
      return [
        points[0], points[1], points[2], points[3]
      ];
    }
    return [
      points[0], points[1], points[5], points[4]
    ];
  }

  public toString (): string {
    return `NBoundingBox (x:${this.dx.min}~${this.dx.max}, y:${this.dy.min}~${this.dy.max}, z:${this.dz.min}~${this.dz.max})`;
  }
}
