import { Matrix4, Vector3 } from 'three';
import { NMathHelper } from '../../NMathHelper';
import { NPoint } from '../NPoint';

export class FrenetFrame {
  origin: NPoint;
  tangent: Vector3;
  normal: Vector3;
  binormal: Vector3;

  constructor (origin: NPoint, tangent: Vector3, normal: Vector3, binormal: Vector3) {
    this.origin = origin;
    this.tangent = tangent;
    this.normal = normal;
    this.binormal = binormal;
  }

  public clone (): FrenetFrame {
    return new FrenetFrame(this.origin.clone(), this.tangent.clone(), this.normal.clone(), this.binormal.clone());
  }
}

const computeFrenetFrames = function (points: NPoint[], tangents: Vector3[], closed = false): FrenetFrame[] {
  // see http://www.cs.indiana.edu/pub/techreports/TR425.pdf

  const segments = points.length - 1;

  const normal = new Vector3();

  const normals: Vector3[] = [];
  const binormals: Vector3[] = [];

  const vec = new Vector3();
  const mat = new Matrix4();

  let i: number, theta: number;

  // select an initial normal vector perpendicular to the first tangent vector,
  // and in the direction of the minimum tangent xyz component

  normals[0] = new Vector3();
  binormals[0] = new Vector3();
  let min = Number.MAX_VALUE;
  const tx = Math.abs(tangents[0].x);
  const ty = Math.abs(tangents[0].y);
  const tz = Math.abs(tangents[0].z);

  if (tx <= min) {
    min = tx;
    normal.set(1, 0, 0);
  }

  if (ty <= min) {
    min = ty;
    normal.set(0, 1, 0);
  }

  if (tz <= min) {
    normal.set(0, 0, 1);
  }

  vec.crossVectors(tangents[0], normal).normalize();

  normals[0].crossVectors(tangents[0], vec);
  binormals[0].crossVectors(tangents[0], normals[0]);

  // compute the slowly-letying normal and binormal vectors for each segment on the curve
  for (i = 1; i <= segments; i++) {
    normals[i] = normals[i - 1].clone();
    binormals[i] = binormals[i - 1].clone();
    vec.crossVectors(tangents[i - 1], tangents[i]);
    if (vec.length() > Number.EPSILON) {
      vec.normalize();
      theta = Math.acos(NMathHelper.clamp(tangents[i - 1].dot(tangents[i]), -1, 1)); // clamp for floating pt errors
      normals[i].applyMatrix4(mat.makeRotationAxis(vec, theta));
    }
    binormals[i].crossVectors(tangents[i], normals[i]);
  }

  // if the curve is closed, postprocess the vectors so the first and last normal vectors are the same
  if (closed) {
    theta = Math.acos(NMathHelper.clamp(normals[0].dot(normals[segments]), -1, 1));
    theta /= segments;
    if (tangents[0].dot(vec.crossVectors(normals[0], normals[segments])) > 0) {
      theta = -theta;
    }
    for (i = 1; i <= segments; i++) {
      normals[i].applyMatrix4(mat.makeRotationAxis(tangents[i], theta * i));
      binormals[i].crossVectors(tangents[i], normals[i]);
    }
  }

  const frames: FrenetFrame[] = points.map((p, i) => {
    return new FrenetFrame(p, tangents[i], normals[i], binormals[i]);
  });
  if (closed && frames.length > 0) {
    frames.push(frames[0].clone());
  }
  return frames;
};

export {
  computeFrenetFrames
};
