import { BufferGeometry, Color, Float32BufferAttribute, LineSegments, RawShaderMaterial } from 'three';
import Vertex from '../shaders/axes/Axes.vert';
import Fragment from '../shaders/axes/Axes.frag';

export class Axes extends LineSegments {
  constructor (length = 10, xColor = new Color(0xFF0000), yColor = new Color(0x00FF00), zColor = new Color(0x0000FF)) {
    const geom = new BufferGeometry();

    const vertices = [];
    const normals = [];
    const colors = [];

    const hl = length * 0.5;
    vertices.push(-hl, 0, 0, hl, 0, 0);
    normals.push(1, 0, 0, 1, 0, 0);
    colors.push(xColor.r, xColor.g, xColor.b, xColor.r, xColor.g, xColor.b);

    vertices.push(0, -hl, 0, 0, hl, 0);
    normals.push(0, 1, 0, 0, 1, 0);
    colors.push(yColor.r, yColor.g, yColor.b, yColor.r, yColor.g, yColor.b);

    vertices.push(0, 0, -hl, 0, 0, hl);
    normals.push(0, 0, 1, 0, 0, 1);
    colors.push(zColor.r, zColor.g, zColor.b, zColor.r, zColor.g, zColor.b);

    geom.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geom.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    geom.setAttribute('color', new Float32BufferAttribute(colors, 3));

    const mat = new RawShaderMaterial({
      vertexShader: Vertex,
      fragmentShader: Fragment,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      uniforms: {
      }
    });
    super(geom, mat);
  }
}
