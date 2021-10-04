import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import NFace from './geometry/mesh/NFace';

export default {

  /*
  mergeVertices(geometry: BufferGeometry, tolerance: number = 1e-4): BufferGeometry {
    tolerance = Math.max( tolerance, Number.EPSILON );
  }
  */

  getVertices (geometry: BufferGeometry): Vector3[] {
    const vertices: Vector3[] = [];
    const position = geometry.getAttribute('position') as BufferAttribute;
    const array = position.array;
    for (let i = 0; i < array.length; i += 3) {
      vertices.push(new Vector3(array[i], array[i + 1], array[i + 2]));
    }
    return vertices;
  },

  getPositionAttribute (vertices: Vector3[]): BufferAttribute {
    const position = new Float32Array(vertices.length * 3);
    for (let i = 0; i < vertices.length; i++) {
      const idx = i * 3;
      const v = vertices[i];
      position[idx] = v.x;
      position[idx + 1] = v.y;
      position[idx + 2] = v.z;
    }
    return new BufferAttribute(position, 3);
  },

  getFaces (geometry: BufferGeometry): NFace[] {
    const faces: NFace[] = [];
    const index = geometry.index as BufferAttribute;
    const array = index.array;
    for (let i = 0; i < array.length; i += 3) {
      faces.push(new NFace(array[i], array[i + 1], array[i + 2]));
    }
    return faces;
  }

};
