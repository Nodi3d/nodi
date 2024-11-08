
import { Vector2 } from 'three';
import { XorShift as Xorshift } from './XorShift';

const getGrid = (count: number, lmin: number, lmax: number): number => {
  let division = 1;
  while (true) {
    const unit = (lmin / division);
    const c = lmax / unit;
    const sum = c * division;
    if (sum >= count) {
      // console.log('unit', division, unit, count, sum)
      return unit;
    }
    division++;
  }
};

const getIndex = (p: Vector2, min: Vector2, size: Vector2, width: number, height: number): { x: number; y: number; } => {
  const x = Math.floor((p.x - min.x) / size.x * width);
  const y = Math.floor((p.y - min.y) / size.y * height);
  return {
    x,
    y
  };
};

class Grid {
  found: boolean = false;
  point: Vector2 | null = null;

  sample (point: Vector2) {
    this.found = true;
    this.point = point;
  }
}

const PoissonDiskSampling = {

  sample (points: Vector2[], count: number, seed: number, r: number = 0.725, tries: number = 16): Vector2[] {
    const rnd = new Xorshift(seed);

    const min = points[0].clone();
    const max = points[0].clone();
    points.forEach((p) => {
      min.x = Math.min(min.x, p.x);
      min.y = Math.min(min.y, p.y);
      max.x = Math.max(max.x, p.x);
      max.y = Math.max(max.y, p.y);
    });
    const size = new Vector2(max.x - min.x, max.y - min.y);

    const unit = getGrid(count, Math.min(size.x, size.y), Math.max(size.x, size.y));
    const width = Math.floor(size.x / unit);
    const height = Math.floor(size.y / unit);

    if (!Number.isInteger(width) || !Number.isInteger(height)) {
      throw new TypeError('Invalid input');
    }

    const radius = r * unit;
    const radius2 = radius * 2.0;

    // construct grids
    const grids = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push(new Grid());
      }
      grids.push(row);
    }

    const p = new Vector2(rnd.randFloat(min.x, max.x), rnd.randFloat(min.y, max.y));

    const actives = [p];
    const result = [p];

    const index = getIndex(p, min, size, width, height);
    grids[index.y][index.x].sample(p);

    const pi2 = Math.PI * 2;

    while (actives.length > 0 && result.length < count) {
      let found = false;
      const idx = rnd.randInt(0, actives.length);
      const pos = actives[idx];

      for (let i = 0; i < tries; i++) {
        const rad = rnd.randFloat(0, pi2);
        const len = rnd.randFloat(radius, radius2);
        const sample = (new Vector2()).addVectors(pos, (new Vector2(Math.cos(rad), Math.sin(rad))).multiplyScalar(len));
        const index = getIndex(sample, min, size, width, height);
        const inside = (index.x >= 0 && index.x < width && index.y >= 0 && index.y < height);
        if (inside && !grids[index.y][index.x].found) {
          let ok = true;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ix = index.x + dx;
              const iy = index.y + dy;
              if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
                const neighbor = grids[iy][ix];
                if (neighbor.found && neighbor.point!.distanceTo(sample) < radius) {
                  ok = false;
                  break;
                }
              }
            }
          }

          if (ok) {
            found = true;
            grids[index.y][index.x].sample(sample);
            result.push(sample);
            actives.push(sample);
            break;
          }
        }
      }

      if (!found) {
        actives.splice(idx, 1);
      }
    }

    return result;
  }

};

export { PoissonDiskSampling };
