import { Vector3 } from 'three';
import { TWO_PI } from '../Constant';
import Helper from '../Helper';
import NPolylineCurve from './curve/NPolylineCurve';
import NPoint from './NPoint';

const findContactPoint = function (start: Vector3, dir: Vector3, dm: Vector3, radius: number, limit: number = 0.5) {
  const n = dir.clone().normalize();
  const cos = dm.dot(n);
  const theta = Math.acos(cos);
  const sin = Math.sin(theta);
  const a = radius / sin;
  const l = Math.min(cos * a, dir.length() * limit);

  return {
    point: n.multiplyScalar(l).add(start),
    radius: (l / cos) * sin // minを取った後のradiusを計算
  };
};

const getCornerFilletPoints = function (p0: NPoint, p1: NPoint, p2: NPoint, radius: number, resolution: number, limit: number = 0.5): NPoint[] {
  const d10 = (new NPoint()).subVectors(p0, p1);
  const d12 = (new NPoint()).subVectors(p2, p1);

  const n10 = d10.clone().normalize();
  const n12 = d12.clone().normalize();
  const nm = n10.clone().add(n12).multiplyScalar(0.5);

  let ip0 = findContactPoint(p1, d10, nm, radius, limit);
  let ip1 = findContactPoint(p1, d12, nm, radius, limit);
  const nradius = Math.min(ip0.radius, ip1.radius);

  ip0 = findContactPoint(p1, d10, nm, nradius, limit);
  ip1 = findContactPoint(p1, d12, nm, nradius, limit);
  const distance = Math.sqrt(nradius * nradius + ip0.point.distanceToSquared(p1));
  const center = nm.multiplyScalar(distance).add(p1);

  const points: NPoint[] = [];

  const dx = (new Vector3()).subVectors(ip0.point, center);
  const normal = Helper.normalFrom3Points(ip0.point, center, ip1.point);
  let dy = normal.cross(dx.clone().normalize()).setLength(dx.length());

  const dcp1 = (new Vector3()).subVectors(ip1.point, center);
  if (dcp1.dot(dy) < 0) {
    dy = dy.multiplyScalar(-1);
  }

  const a0 = 0;
  const a1 = dx.angleTo(dcp1);
  const angle = a1 - a0;

  const n = Math.ceil((angle / TWO_PI) * resolution);

  for (let i = 0; i < n; i++) {
    const r = (i / (n - 1)) * angle;
    const c = Math.cos(r);
    const s = Math.sin(r);
    const p = center.clone().add(dx.clone().multiplyScalar(c)).add(dy.clone().multiplyScalar(s));
    points.push(p);
  }

  return points;
};

const concatFilletPoints = function (sequence: NPoint[], points: NPoint[]): NPoint[] {
  if (sequence.length > 0 && points.length > 0) {
    const tail = sequence[sequence.length - 1];
    const head = points[0];
    if (tail.distanceToSquared(head) < 1e-10) {
      // Remove duplicated
      sequence.pop();
    }
  }

  return sequence.concat(points);
};

const getFilletedPoints = function (curve: NPolylineCurve, radius: number, resolution: number): NPoint[] {
  let sequence: NPoint[] = [];

  const points = curve.points;
  const l = points.length;
  for (let i = 0, n = l - 2; i < n; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const p2 = points[i + 2];
    sequence = concatFilletPoints(sequence, getCornerFilletPoints(p0, p1, p2, radius, resolution));
  }

  if (curve.closed && l >= 3) {
    const p0 = points[l - 2];
    const p1 = points[l - 1];
    const p2 = points[0];
    const p3 = points[1];
    sequence = concatFilletPoints(sequence, getCornerFilletPoints(p0, p1, p2, radius, resolution));
    sequence = concatFilletPoints(sequence, getCornerFilletPoints(p1, p2, p3, radius, resolution));
  }

  return sequence;
};

export {
  concatFilletPoints,
  getCornerFilletPoints,
  getFilletedPoints
};
