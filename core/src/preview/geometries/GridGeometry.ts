import { BufferAttribute, BufferGeometry } from 'three';

export class GridGeometry extends BufferGeometry {
  constructor (count: number, unit: number) {
    super();

    const vertices: number[] = [];

    const hs = count * unit * 0.5;
    for (let x = 0; x <= count; x++) {
      const px = x * unit - hs;
      // vertices.push(new Vector3(px, 0, hs), new Vector3(px, 0, -hs));
      vertices.push(px, 0, hs);
      vertices.push(px, 0, -hs);
    }
    for (let y = 0; y <= count; y++) {
      const py = y * unit - hs;
      // vertices.push(new Vector3(-hs, 0, py), new Vector3(hs, 0, py));
      vertices.push(-hs, 0, py);
      vertices.push(hs, 0, py);
    }

    const array = new Float32Array(vertices);
    this.setAttribute('position', new BufferAttribute(array, 3));
  }
}
