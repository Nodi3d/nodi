import { Color, LineSegments, RawShaderMaterial } from 'three';

import Vertex from '../shaders/grid/Grid.vert';
import Fragment from '../shaders/grid/Grid.frag';
import { GridGeometry } from './GridGeometry';

export class GridSegments extends LineSegments {
  unit: number;
  zoom: number;

  constructor (geom: GridGeometry, unit: number = 1, zoom: number = 1) {
    const mat = new RawShaderMaterial({
      vertexShader: Vertex,
      fragmentShader: Fragment,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      uniforms: {
        uUnit: {
          value: unit
        },
        uColor: {
          value: new Color(0x333)
        },
        uOpacity: {
          value: 1
        }
      }
    });

    super(geom, mat);
    this.unit = unit;
    this.zoom = zoom;
  }

  get opacity () {
    return (this.material as RawShaderMaterial).uniforms.uOpacity.value;
  }

  set opacity (v) {
    (this.material as RawShaderMaterial).uniforms.uOpacity.value = v;
  }
}
