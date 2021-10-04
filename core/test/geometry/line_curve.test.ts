import { Matrix4, Vector3 } from 'three';
import { NLineCurve } from '~/src/math/geometry/curve/NLineCurve';
import { NPoint } from '~/src/math/geometry/NPoint';

describe('NLineCurve', (): void => {
  const a = new NPoint(0, 0, 0);
  const b = new NPoint(10, 0, 0);
  const line = new NLineCurve(a, b);
  const tangent = line.getTangent();

  test('closed', (done) => {
    expect(line.closed).toBe(false);
    done();
  });

  test('length', (done) => {
    expect(a.distanceTo(b)).toBe(line.length());
    done();
  });

  test('area', (done) => {
    expect(line.area()).toBe(0);
    done();
  });

  test('domain', (done) => {
    const domain = line.domain();
    expect(domain.start).toBe(0);
    expect(domain.end).toBe(1);
    done();
  });

  test('getPointAt, getTangentAt', (done) => {
    const p0 = line.getPointAt(0);
    const p1 = line.getPointAt(1);
    expect(p0).toStrictEqual(a);
    expect(p1).toStrictEqual(b);

    const t0 = line.getTangentAt(0);
    const t1 = line.getTangentAt(1);
    expect(t0).toStrictEqual(tangent);
    expect(t1).toStrictEqual(tangent);
    done();
  });

  test('applyMatrix', (done) => {
    const translation = new Matrix4().makeTranslation(0, 5, 0);
    const rotation = new Matrix4().makeRotationAxis(new Vector3(0, 0, 1), Math.PI * 0.25);
    const scale = new Matrix4().makeScale(3, 2, 1);
    const matrix = translation.multiply(rotation).multiply(scale);

    const translated = line.applyMatrix(matrix);
    const ta = a.applyMatrix(matrix);
    const tb = b.applyMatrix(matrix);

    const p0 = translated.getPointAt(0);
    const p1 = translated.getPointAt(1);
    expect(p0).toStrictEqual(ta);
    expect(p1).toStrictEqual(tb);
    done();
  });

  test('transform', (done) => {
    const translation = new Matrix4().makeTranslation(0, 5, 0);
    const rotation = new Matrix4().makeRotationAxis(new Vector3(0, 0, 1), Math.PI * 0.25);
    const scale = new Matrix4().makeScale(3, 2, 1);
    const matrix = translation.multiply(rotation).multiply(scale);
    const transformer = (p: NPoint) => {
      return p.applyMatrix(matrix);
    };
    const translated = line.transform(transformer);
    const ta = a.transform(transformer);
    const tb = b.transform(transformer);
    const p0 = translated.getPointAt(0);
    const p1 = translated.getPointAt(1);
    expect(p0).toStrictEqual(ta);
    expect(p1).toStrictEqual(tb);
    done();
  });

  test('trim', (done) => {
    const l0 = line.trim(0, 0.5);
    const l1 = line.trim(0.5, 1.0);
    const center = line.center();
    expect(l0.getPointAt(1)).toStrictEqual(center);
    expect(l1.getPointAt(0)).toStrictEqual(center);

    const division = 10;
    const parameters = [...new Array(division + 1).keys()].map(i => i / division);
    line.trims(parameters).forEach((trim, i) => {
      expect(line.getPointAt(parameters[i])).toStrictEqual(trim.getPointAt(0));
      expect(line.getPointAt(parameters[i + 1])).toStrictEqual(trim.getPointAt(1));
    });

    done();
  });

  test('flip', (done) => {
    const flipped = line.flip();
    expect(flipped.getPointAt(0)).toStrictEqual(b);
    expect(flipped.getPointAt(1)).toStrictEqual(a);
    done();
  });
});
