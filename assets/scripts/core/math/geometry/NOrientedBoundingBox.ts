import { Vector3 } from 'three';
import NPolylineCurve from './curve/NPolylineCurve';
import NPoint from './NPoint';

export default class NOrientedBoundingBox {
  origin: NPoint = new NPoint();
  vertices: NPoint[] = [];
  faces: NPolylineCurve[] = [];

  constructor (vertices: Vector3[]) {
    this.build(vertices);
  }

  build (vertices: Vector3[]) {
    const eigenVectors = this.getEigenVectors(this.collectMatrix(vertices));

    let vec1: Vector3, vec2: Vector3, vec3: Vector3;
    {
      const x = eigenVectors[0][0];
      const y = eigenVectors[1][0];
      const z = eigenVectors[2][0];
      vec1 = new Vector3(x, y, z);
    }
    {
      const x = eigenVectors[0][1];
      const y = eigenVectors[1][1];
      const z = eigenVectors[2][1];
      vec2 = new Vector3(x, y, z);
    }
    {
      const x = eigenVectors[0][2];
      const y = eigenVectors[1][2];
      const z = eigenVectors[2][2];
      vec3 = new Vector3(x, y, z);
    }

    let min1: number, min2: number, min3: number, max1: number, max2: number, max3: number;
    min1 = min2 = min3 = max1 = max2 = max3 = 0;

    for (let i = 0, n = vertices.length; i < n; i++) {
      const pos = vertices[i];
      const dot1 = vec1.clone().dot(pos);
      const dot2 = vec2.clone().dot(pos);
      const dot3 = vec3.clone().dot(pos);
      if (i <= 0) {
        min1 = max1 = dot1;
        min2 = max2 = dot2;
        min3 = max3 = dot3;
      } else {
        min1 = Math.min(dot1, min1);
        min2 = Math.min(dot2, min2);
        min3 = Math.min(dot3, min3);
        max1 = Math.max(dot1, max1);
        max2 = Math.max(dot2, max2);
        max3 = Math.max(dot3, max3);
      }
    }

    const len1 = max1 - min1;
    const len2 = max2 - min2;
    const len3 = max3 - min3;

    const edge1 = vec1.clone().multiplyScalar(len1);
    const edge2 = vec2.clone().multiplyScalar(len2);
    const edge3 = vec3.clone().multiplyScalar(len3);
    const edges = [edge1, edge2, edge3];

    const center1 = (vec1.clone().multiplyScalar(max1 + min1)).multiplyScalar(0.5);
    const center2 = (vec2.clone().multiplyScalar(max2 + min2)).multiplyScalar(0.5);
    const center3 = (vec3.clone().multiplyScalar(max3 + min3)).multiplyScalar(0.5);

    this.origin.copy(center1.add(center2).add(center3));

    const ftr = this.origin.clone().add(edges[0].clone().multiplyScalar(0.5)).add(edges[1].clone().multiplyScalar(0.5)).add(edges[2].clone().multiplyScalar(0.5));
    const fbr = ftr.clone().sub(edges[2]);
    const ftl = ftr.clone().sub(edges[0]);
    const fbl = ftl.clone().sub(edges[2]);

    const btr = ftr.clone().sub(edges[1]);
    const bbr = btr.clone().sub(edges[2]);
    const btl = btr.clone().sub(edges[0]);
    const bbl = btl.clone().sub(edges[2]);

    this.vertices = [
      ftl, ftr, btr, btl,
      fbl, fbr, bbr, bbl
    ].map(v => NPoint.fromVector(v));

    this.faces = [
      new NPolylineCurve([ftl, ftr, btr, btl], true),
      new NPolylineCurve([fbl, fbr, bbr, bbl], true),
      new NPolylineCurve([ftl, btl, bbl, fbl], true),
      new NPolylineCurve([ftr, btr, bbr, fbr], true),
      new NPolylineCurve([ftl, ftr, fbr, fbl], true),
      new NPolylineCurve([btl, btr, bbr, bbl], true)
    ];
  }

  private collectMatrix (vertices: Vector3[]): number[][] {
    const len = vertices.length;
    let avg = new Vector3();
    for (let i = 0; i < len; i++) {
      avg = avg.add(vertices[i].clone());
    }
    avg = avg.divideScalar(len);

    let c11: number = 0; let c22: number = 0; let c33: number = 0;
    let c12: number = 0; let c13: number = 0; let c23: number = 0;

    for (let i = 0; i < len; i++) {
      const dx = (vertices[i].x - avg.x);
      const dy = (vertices[i].y - avg.y);
      const dz = (vertices[i].z - avg.z);
      c11 += dx * dx;
      c22 += dy * dy;
      c33 += dz * dz;
      c12 += dx * dy;
      c13 += dx * dz;
      c23 += dy * dz;
    }

    c11 /= len;
    c22 /= len;
    c33 /= len;
    c12 /= len;
    c13 /= len;
    c23 /= len;

    return [
      [c11, c12, c13],
      [c12, c22, c23],
      [c13, c23, c33]
    ];
  }

  private getMaxValue (matrix: number[][]): { max: number; p: number; q: number } {
    let p = 0;
    let q = 0;

    const rank = 2;
    let max = -1e5;

    for (let i = 0; i < rank; i++) {
      const len = 3;
      for (let j = 0; j < len; j++) {
        if (i === j) {
          continue;
        }

        const absmax = Math.abs(matrix[i][j]);
        if (max <= absmax) {
          max = absmax;
          p = i;
          q = j;
        }
      }
    }

    if (p > q) {
      const temp = p;
      p = q;
      q = temp;
    }

    return {
      max,
      p,
      q
    };
  }

  private getEigenVectors (matrix: number[][]): number[][] {
    const eigenVectors = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        eigenVectors[i][j] = (i === j) ? 1 : 0;
      }
    }

    const limit = 100;
    let counter = 0;
    while (true) {
      counter++;
      if (counter >= limit) {
        throw new Error('Something was wrong in oriented bounding box calculation.');
      }

      const result = this.getMaxValue(matrix);
      const max = result.max;
      const p = result.p;
      const q = result.q;
      if (max <= 0.0001) {
        break;
      }

      const app = matrix[p][p];
      const apq = matrix[p][q];
      const aqq = matrix[q][q];

      const alpha = (app - aqq) / 2;
      const beta = -apq;
      const gamma = Math.abs(alpha) / Math.sqrt(alpha * alpha + beta * beta);

      let sin = Math.sqrt((1 - gamma) / 2);
      const cos = Math.sqrt((1 + gamma) / 2);

      if (alpha * beta < 0) {
        sin = -sin;
      }

      for (let i = 0; i < 3; i++) {
        const temp = cos * matrix[p][i] - sin * matrix[q][i];
        matrix[q][i] = sin * matrix[p][i] + cos * matrix[q][i];
        matrix[p][i] = temp;
      }

      for (let i = 0; i < 3; i++) {
        matrix[i][p] = matrix[p][i];
        matrix[i][q] = matrix[q][i];
      }

      matrix[p][p] = cos * cos * app + sin * sin * aqq - 2 * sin * cos * apq;
      matrix[p][q] = sin * cos * (app - aqq) + (cos * cos - sin * sin) * apq;
      matrix[q][p] = sin * cos * (app - aqq) + (cos * cos - sin * sin) * apq;
      matrix[q][q] = sin * sin * app + cos * cos * aqq + 2 * sin * cos * apq;

      for (let i = 0; i < 3; i++) {
        const temp = cos * eigenVectors[i][p] - sin * eigenVectors[i][q];
        eigenVectors[i][q] = sin * eigenVectors[i][p] + cos * eigenVectors[i][q];
        eigenVectors[i][p] = temp;
      }
    }

    return eigenVectors;
  }
}
