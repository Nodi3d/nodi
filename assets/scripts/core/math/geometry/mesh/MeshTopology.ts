import { BufferAttribute, BufferGeometry } from 'three';
import NFace from './NFace';
import NMesh from './NMesh';

class MeshEdge {
  index0: number;
  index1: number;
  faces: NFace[];

  constructor (index0: number, index1: number, face: NFace) {
    this.index0 = index0;
    this.index1 = index1;
    this.faces = [face];
  }

  // add a face which has this edge
  public addFace (face: NFace): void {
    this.faces.push(face);
  }

  public hasCommonFace (face: NFace): boolean {
    return this.faces.includes(face);
  }

  public isNeighborEdge (other: MeshEdge): boolean {
    return other.index0 === this.index0 || other.index1 === this.index0 || other.index0 === this.index1 || other.index1 === this.index1;
  }

  public isEqualEdge (other: MeshEdge): boolean {
    return this.isEqual(other.index0, other.index1);
  }

  public isEqual (i0: number, i1: number): boolean {
    return (this.index0 === i0 && this.index1 === i1) || (this.index0 === i1 && this.index1 === i0);
  }
}

class MeshTopology {
  faces: NFace[];
  edges: MeshEdge[] = [];

  constructor (mesh: NMesh) {
    this.faces = mesh.faces;

    const dict: { [index: string]: MeshEdge } = {};
    const addEdge = (i0: number, i1: number, face: NFace) => {
      let a: number = 0;
      let b: number = 0;
      if (i0 <= i1) {
        a = i0;
        b = i1;
      } else {
        a = i1;
        b = i0;
      }
      const key = `${a}-${b}`;
      if (!(key in dict)) {
        const edge = new MeshEdge(a, b, face);
        this.edges.push(edge);
        dict[key] = edge;
      } else {
        dict[key].addFace(face);
      }
    };

    this.faces.forEach((face) => {
      const indices = face.toArray();
      for (let i = 0, n = indices.length; i < n; i++) {
        addEdge(indices[i], indices[(i + 1) % n], face);
      }
    });
  }

  public getEdge (i0: number, i1: number): MeshEdge | undefined {
    return this.edges.find((e) => {
      return e.isEqual(i0, i1);
    });
  }
}

export {
  MeshEdge,
  MeshTopology
};
