import { Group, OrthographicCamera } from 'three';
import { GridGeometry } from './GridGeometry';
import { GridSegments } from './GridSegments';

export class GridGroup extends Group {
  grids: GridSegments[] = [];

  constructor (geom: GridGeometry) {
    super();

    for (let zoom = -1; zoom < 4; zoom++) {
      const u = Math.pow(10, zoom);
      const g = new GridSegments(geom, u, zoom);
      g.scale.set(u, u, u);
      this.add(g);
      this.grids.push(g);
    }
  }

  update (orth: OrthographicCamera) {
    const zoom = -Math.log10(orth.zoom);

    this.grids.forEach((g) => {
      let d = Math.abs(g.zoom - zoom);
      d = Math.max(0, 1.0 - d);
      d = Math.pow(d, 2.0);
      g.visible = d > 0.0;
      g.opacity = d;
    });
  }
}
