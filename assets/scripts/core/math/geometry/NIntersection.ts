import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import verb from '../../lib/verb/verb.js';
import GeometryUtils from '../GeometryUtils';
import NCurve from './curve/NCurve';
import NLineCurve from './curve/NLineCurve';
import NNurbsCurve from './curve/NNurbsCurve';
import NPolylineCurve from './curve/NPolylineCurve';
import NPoint from './NPoint';
import NFace from './mesh/NFace';

class CurveIntersectionPoint {
  position: NPoint;
  ta: number;
  tb: number;

  constructor (position: NPoint, ta: number = 0, tb: number = 0) {
    this.position = position;
    this.ta = (ta > 1.0) ? (ta % 1.0) : ta;
    this.tb = (tb > 1.0) ? (tb % 1.0) : tb;
  }
}

export type SuccessPointResultType = {
  result: boolean;
  point: NPoint;
};

export type SuccessCurveResultType = {
  result: boolean;
  point: CurveIntersectionPoint;
};

export type FailedResultType = {
  result: boolean;
};

export type PointResultType = SuccessPointResultType | FailedResultType;
export type CurveResultType = SuccessCurveResultType | FailedResultType;

const failed = () => {
  return {
    result: false
  };
};

const getControlPointLengths = (crv: NCurve) => {
  const lengths = [];
  const all = crv.length();

  if (
    (crv instanceof NPolylineCurve)
  ) {
    const points = crv.points;
    if (crv.closed) {
      points.push(points[0].clone());
    }

    let accumulated = 0;
    for (let i = 0, n = points.length - 1; i < n; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      const length = p0.distanceTo(p1);

      lengths.push({
        length,
        accumulated,
        t: (accumulated <= 0) ? 0 : (accumulated / all)
      });

      accumulated += length;
    }
  }

  return {
    all,
    lengths
  };
};

/*
 * https://gist.github.com/hanigamal/6556506
 * Check if segment intersection
 *  sa: [p0, p1], sb: [p0, p1]
 */
const intersectsSegmentSegment = function (sa: Vector3[], sb: Vector3[]): CurveResultType {
  const da = (new Vector3()).subVectors(sa[1], sa[0]);
  const db = (new Vector3()).subVectors(sb[1], sb[0]);
  const dc = (new Vector3()).subVectors(sb[0], sa[0]);

  const crossAB = (new Vector3()).crossVectors(da, db);
  const epsilon = 1e-8;
  if (Math.abs(dc.dot(crossAB)) > epsilon) {
    return { result: false };
  }

  const crossCB = (new Vector3()).crossVectors(dc, db);
  const t = crossCB.dot(crossAB) / crossAB.lengthSq();
  if (t >= 0.0 && t <= 1.0) {
    const p = da.multiplyScalar(t).add(sa[0]);

    // check t2
    const db2 = p.clone().sub(sb[0]);
    if (db.dot(db2) < -epsilon || db2.lengthSq() > db.lengthSq() - epsilon) {
      return {
        result: false
      };
    }

    return {
      result: true,
      point: new CurveIntersectionPoint(NPoint.fromVector(p), t, 1.0 - t)
    };
  }

  return failed();
};

const getParameterAt = (segment: Vector3[], p: Vector3): number => {
  const l = segment[0].distanceTo(segment[1]);
  return segment[0].distanceTo(p) / l;
};

const intersectsLineLine = (ca: NCurve, cb: NCurve): CurveResultType => {
  // same interval for each points
  let pa, pb;

  if (ca instanceof NLineCurve) {
    pa = ca.points;
  } else {
    // console.warn('LineIntersection not correspond with CURVE', ca);
    return failed();
  }

  if (cb instanceof NLineCurve) {
    pb = cb.points;
  } else {
    // console.warn('LineIntersection not correspond with CURVE', cb);
    return failed();
  }

  const intersection = intersectsSegmentSegment(pa, pb);
  if (intersection.result) {
    const r = intersection as SuccessCurveResultType;
    const ta = getParameterAt(pa, r.point.position);
    const tb = getParameterAt(pb, r.point.position);
    return {
      result: true,
      point: new CurveIntersectionPoint(r.point.position, ta, tb)
    };
  }

  return failed();
};

const intersectsPolylinePolyline = (ca: NPolylineCurve | NLineCurve, cb: NPolylineCurve | NLineCurve) => {
  const pointsA = ca.points;
  if (ca.closed) {
    pointsA.push(pointsA[0].clone());
  }

  const pointsB = cb.points;
  if (cb.closed) {
    pointsB.push(pointsB[0].clone());
  }

  // TODO: brute-forth
  const la = getControlPointLengths(ca);
  const lb = getControlPointLengths(cb);
  const intersections = [];

  for (let ia = 0, na = pointsA.length - 1; ia < na; ia++) {
    const pa0 = pointsA[ia];
    const pa1 = pointsA[ia + 1];
    const sa = [pa0, pa1];

    for (let ib = 0, nb = pointsB.length - 1; ib < nb; ib++) {
      const pb0 = pointsB[ib];
      const pb1 = pointsB[ib + 1];
      const sb = [pb0, pb1];
      const intersection = intersectsSegmentSegment(sa, sb);
      if (intersection.result) {
        const r = intersection as SuccessCurveResultType;
        const ta = la.lengths[ia].t + (la.lengths[ia].length / la.all) * getParameterAt(sa, r.point.position);
        const tb = lb.lengths[ib].t + (lb.lengths[ib].length / lb.all) * getParameterAt(sb, r.point.position);
        intersections.push(new CurveIntersectionPoint(r.point.position, ta, tb));
      }
    }
  }

  return intersections;
};

const intersectsNurbsNurbs = (ca: NCurve, cb: NCurve, precision: number = 1e-10): CurveIntersectionPoint[] => {
  let na: NNurbsCurve;
  let nb: NNurbsCurve;

  if (ca instanceof NNurbsCurve) {
    na = ca;
  } else {
    na = ca.toNurbsCurve();
  }

  if (cb instanceof NNurbsCurve) {
    nb = cb;
  } else {
    nb = cb.toNurbsCurve();
  }

  const intersections = verb.geom.Intersect.curves(na.verb, nb.verb, precision);
  return intersections.map((intersection: any) => {
    const p = intersection.point0 as number[];
    return new CurveIntersectionPoint(
      new NPoint(p[0], p[1], p[2]),
      intersection.u0 as number,
      intersection.u1 as number
    );
  });
};

const intersectsCurveCurve = (ca: NCurve, cb: NCurve, precision = 1e-10): CurveIntersectionPoint[] => {
  if (
    (ca instanceof NLineCurve) && (cb instanceof NLineCurve)
  ) {
    const result = intersectsLineLine(ca, cb);
    if (result.result) {
      const r = result as SuccessCurveResultType;
      return [r.point];
    }
    return [];
  } else if (
    (ca instanceof NPolylineCurve) && (cb instanceof NPolylineCurve)
  ) {
    return intersectsPolylinePolyline(ca, cb);
  } else {
    return intersectsNurbsNurbs(ca, cb, precision);
  }
};

const intersectsRayTriangle = (orig: Vector3, dir: Vector3, vertices: Vector3[], face: NFace): PointResultType => {
  const l = vertices.length;
  if (face.a >= l || face.b >= l || face.c >= l) { return failed(); }

  const v0 = vertices[face.a].clone();
  const v1 = vertices[face.b].clone();
  const v2 = vertices[face.c].clone();

  // compute plane's normal
  const e1 = (new Vector3()).subVectors(v1, v0);
  const e2 = (new Vector3()).subVectors(v2, v0);
  const h = (new Vector3()).crossVectors(dir, e2);
  const a = e1.dot(h);

  // check if ray and plane are parallel ?
  const epsilon = 1e-12;
  if (Math.abs(a) < epsilon) { return failed(); } // they are parallel so they don't intersect !

  const f = 1.0 / a;
  const s = (new Vector3()).subVectors(orig, v0);
  const u = f * s.dot(h);

  if (u < 0 || u > 1) { return failed(); }

  const q = (new Vector3()).crossVectors(s, e1);
  const v = f * dir.dot(q);

  if (v < 0 || u + v > 1) { return failed(); }

  const t = f * e2.dot(q);
  if (t >= 0) {
    const P = orig.clone().add(dir.clone().multiplyScalar(t));
    return {
      result: true,
      point: NPoint.fromVector(P)
    };
  }

  return failed();
};

const intersectsLineTriangle = (line: NLineCurve, vertices: Vector3[], face: NFace): CurveResultType => {
  const dir = (new Vector3()).subVectors(line.b, line.a);
  const rayDir = dir.clone().normalize();
  const intersection = intersectsRayTriangle(line.a.clone(), rayDir, vertices, face);
  if (intersection.result) {
    const r = intersection as SuccessPointResultType;
    const point = r.point;
    const dir2 = (new Vector3()).subVectors(point, line.a);
    const l = dir.lengthSq();
    const l2 = dir2.lengthSq();
    if (l > l2) {
      const tSq = l2 / l;
      return {
        result: true,
        point: new CurveIntersectionPoint(point, Math.sqrt(tSq))
      };
    }
  }

  return failed();
};

const intersectsLineTriangles = (line: NLineCurve, vertices: Vector3[], faces: NFace[]): SuccessCurveResultType[] => {
  const intersections: SuccessCurveResultType[] = [];
  faces.forEach((face) => {
    const intersection = intersectsLineTriangle(line, vertices, face);
    if (intersection.result) {
      const r = intersection as SuccessCurveResultType;
      intersections.push(r);
    }
  });
  return intersections;
};

const intersectsLineMesh = (line: NLineCurve, geometry: BufferGeometry): SuccessCurveResultType[] => {
  const intersections: SuccessCurveResultType[] = [];

  const vertices = GeometryUtils.getVertices(geometry);
  const faces = GeometryUtils.getFaces(geometry);
  faces.forEach((face) => {
    const intersection = intersectsLineTriangle(line, vertices, face);
    if (intersection.result) {
      const r = intersection as SuccessCurveResultType;
      intersections.push(r);
    }
  });

  return intersections;
};

export {
  intersectsSegmentSegment,
  intersectsLineLine,
  intersectsPolylinePolyline,
  intersectsCurveCurve,

  intersectsRayTriangle,
  intersectsLineTriangle,
  intersectsLineTriangles,
  intersectsLineMesh
};
