import { BufferAttribute, BufferGeometry, Matrix4, Vector2, Vector3 } from 'three';
import { IDisposable } from '../../../misc/IDisposable';
import { NBoundingBox } from '../NBoundingBox';
import { NPlane } from '../NPlane';
import { TransformerType, ITransformable } from '../ITransformable';
import { NMathHelper } from '../../NMathHelper';
import { NPoint } from '../NPoint';
import { NFace } from './NFace';
import { IBoundable } from '../IBoundable';

export class NMesh implements ITransformable, IBoundable, IDisposable {
  vertices: NPoint[] = [];
  normals: Vector3[] = [];
  uv: Vector2[] = [];
  faces: NFace[] = [];

  // eslint-disable-next-line no-useless-constructor
  constructor () {
  }

  public clone (): NMesh {
    const mesh = new NMesh();
    mesh.vertices = this.vertices.map(v => v.clone());
    mesh.normals = this.normals.map(n => n.clone());
    mesh.uv = this.uv.map(uv => uv.clone());
    mesh.faces = this.faces.map(face => face.clone());
    return mesh;
  }

  public computeFaceNormal (face: NFace): Vector3 {
    const v0 = this.vertices[face.a];
    const v1 = this.vertices[face.b];
    const v2 = this.vertices[face.c];
    return NMathHelper.normalFrom3Points(v0, v1, v2);
  }

  public computeFlatNormalsMesh (): NMesh {
    const mesh = new NMesh();

    const hasUv = this.uv.length > 0;

    for (let f = 0, fl = this.faces.length; f < fl; f++) {
      const face = this.faces[f];

      const vA = this.vertices[face.a];
      const vB = this.vertices[face.b];
      const vC = this.vertices[face.c];

      const norm = this.computeFaceNormal(face);

      const idx = mesh.vertices.length;
      mesh.vertices.push(vA);
      mesh.vertices.push(vB);
      mesh.vertices.push(vC);

      mesh.normals.push(norm);
      mesh.normals.push(norm);
      mesh.normals.push(norm);

      if (hasUv) {
        mesh.uv.push(this.uv[face.a]);
        mesh.uv.push(this.uv[face.b]);
        mesh.uv.push(this.uv[face.c]);
      }

      mesh.faces.push(new NFace(idx, idx + 1, idx + 2, norm));
    }

    return mesh;
  }

  public computeVertexNormals (): void {
    const normals = new Array(this.vertices.length);
    for (let v = 0, vl = this.vertices.length; v < vl; v++) {
      normals[v] = new Vector3();
    }

    // vertex normals weighted by triangle areas
    // http://www.iquilezles.org/www/articles/normals/normals.htm

    const cb = new Vector3(); const ab = new Vector3();
    for (let f = 0, fl = this.faces.length; f < fl; f++) {
      const face = this.faces[f];

      const vA = this.vertices[face.a];
      const vB = this.vertices[face.b];
      const vC = this.vertices[face.c];

      cb.subVectors(vC, vB);
      ab.subVectors(vA, vB);
      cb.cross(ab);

      normals[face.a].add(cb);
      normals[face.b].add(cb);
      normals[face.c].add(cb);
    }

    for (let v = 0, vl = this.vertices.length; v < vl; v++) {
      normals[v].normalize();
    }
    this.normals = normals;
  }

  public flip (): NMesh {
    const mesh = this.clone();

    mesh.normals = mesh.normals.map((normal) => {
      return normal.multiplyScalar(-1);
    });
    mesh.faces = mesh.faces.map((face) => {
      return face.flip();
    });

    return mesh;
  }

  public transform (f: TransformerType): NMesh {
    const mesh = this.clone();

    mesh.vertices = mesh.vertices.map((p) => {
      return f(p);
    });

    // recalculate props
    // m.geometry.computeFaceNormals();
    return mesh;
  }

  public applyMatrix (m: Matrix4): NMesh {
    const mesh = this.clone();
    mesh.vertices = mesh.vertices.map((v) => {
      return v.applyMatrix4(m);
    });
    return mesh;
  }

  public build (): BufferGeometry {
    const geometry = new BufferGeometry();

    const position = new Float32Array(this.vertices.length * 3);
    this.vertices.forEach((v, idx) => {
      const i = idx * 3;
      position[i] = v.x;
      position[i + 1] = v.y;
      position[i + 2] = v.z;
    });
    geometry.setAttribute('position', new BufferAttribute(position, 3));

    if (this.uv.length > 0) {
      const uv = new Float32Array(this.uv.length * 2);
      this.uv.forEach((v, idx) => {
        const i = idx * 2;
        uv[i] = v.x;
        uv[i + 1] = v.y;
      });
      geometry.setAttribute('uv', new BufferAttribute(uv, 2));
    }

    if (this.normals.length > 0) {
      const normal = new Float32Array(this.normals.length * 3);
      this.normals.forEach((v, idx) => {
        const i = idx * 3;
        normal[i] = v.x;
        normal[i + 1] = v.y;
        normal[i + 2] = v.z;
      });
      geometry.setAttribute('normal', new BufferAttribute(normal, 3));
    }

    const len = this.faces.length * 3;
    const index = this.vertices.length < 65535 ? new Uint16Array(len) : new Uint32Array(len);
    this.faces.forEach((f, idx) => {
      const i = idx * 3;
      index[i] = f.a;
      index[i + 1] = f.b;
      index[i + 2] = f.c;
    });
    geometry.setIndex(new BufferAttribute(index, 1));

    return geometry;
  }

  public area (): number {
    let area = 0;
    this.faces.forEach((face) => {
      const va = this.vertices[face.a];
      const vb = this.vertices[face.b];
      const vc = this.vertices[face.c];
      const ab = (new Vector3()).subVectors(vb, va);
      const ac = (new Vector3()).subVectors(vc, va);
      area += 0.5 * ab.length() * ac.length() * Math.sin(ab.angleTo(ac));
    });
    return Math.abs(area);
  }

  public center (): NPoint {
    const mid = new NPoint();
    this.vertices.forEach((v) => {
      mid.add(v);
    });
    mid.divideScalar(this.vertices.length);
    return mid;
  }

  public bounds (plane: NPlane): NBoundingBox {
    return NBoundingBox.fromMesh(plane, this);
  }

  public static fromBufferGeometry (geometry: BufferGeometry): NMesh {
    const mesh = new NMesh();

    const positionArray = geometry.getAttribute('position').array;
    for (let i = 0; i < positionArray.length; i += 3) {
      const x = positionArray[i];
      const y = positionArray[i + 1];
      const z = positionArray[i + 2];
      const v = new NPoint(x, y, z);
      mesh.vertices.push(v);
    }

    const uv = geometry.getAttribute('uv');
    if (uv !== undefined) {
      const uvArray = uv.array;
      for (let i = 0; i < uvArray.length; i += 2) {
        const u = uvArray[i];
        const v = uvArray[i + 1];
        const uv = new Vector2(u, v);
        mesh.uv.push(uv);
      }
    }

    const normal = geometry.getAttribute('normal');
    if (normal !== undefined) {
      const normalArray = normal.array;
      for (let i = 0; i < normalArray.length; i += 3) {
        const x = normalArray[i];
        const y = normalArray[i + 1];
        const z = normalArray[i + 2];
        const n = new Vector3(x, y, z);
        mesh.normals.push(n);
      }
    }

    const index = geometry.index;
    if (index !== null) {
      const indexArray = index.array;
      for (let i = 0; i < indexArray.length; i += 3) {
        const a = indexArray[i];
        const b = indexArray[i + 1];
        const c = indexArray[i + 2];
        mesh.faces.push(new NFace(a, b, c));
      }
    } else {
      const n = mesh.vertices.length;
      for (let i = 0; i < n; i += 3) {
        const face = new NFace(i, i + 1, i + 2);
        mesh.faces.push(face);
      }
    }

    return mesh;
  }

  public mergeVertices (tolerance: number = 1e-4) : void {
    tolerance = Math.max(tolerance, Number.EPSILON);
    const hashToIndex: { [index:string]: any } = {};
    const decimalShift = Math.log10(1 / tolerance);
    const shiftMultiplier = Math.pow(10, decimalShift);

    // next value for triangle indices
    let nextIndex = 0;
    const newIndices: number[] = [];
    const newVertices: NPoint[] = [];

    this.vertices.forEach((p) => {
      let hash = '';
      // double tilde truncates the decimal value
      hash += `${~~(p.x * shiftMultiplier)},`;
      hash += `${~~(p.y * shiftMultiplier)},`;
      hash += `${~~(p.z * shiftMultiplier)},`;
      if (hash in hashToIndex) {
        newIndices.push(hashToIndex[hash]);
      } else {
        newVertices.push(p);
        hashToIndex[hash] = nextIndex;
        newIndices.push(nextIndex);
        nextIndex++;
      }
    });

    this.vertices = newVertices;
    this.uv = [];
    this.normals = [];
    this.faces = this.faces.map((face) => {
      return new NFace(newIndices[face.a], newIndices[face.b], newIndices[face.c]);
    });
  }

  public toString (): string {
    return 'NMesh';
  }

  dispose () {
  }
}
