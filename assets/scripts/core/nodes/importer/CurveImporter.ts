import { CubicBezierCurve, EllipseCurve, FileLoader, LineCurve, QuadraticBezierCurve, Vector3 } from 'three';
import { Helper } from 'dxf';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { AccessTypes } from '../../data/AccessTypes';
import DataAccess from '../../data/DataAccess';
import { DataTypes } from '../../data/DataTypes';
import OutputManager from '../../io/OutputManager';
import NCurve from '../../math/geometry/curve/NCurve';
import NPlane from '../../math/geometry/NPlane';
import NPoint from '../../math/geometry/NPoint';
import NEllipseCurve from '../../math/geometry/curve/NEllipseCurve';
import NLineCurve from '../../math/geometry/curve/NLineCurve';
import NPolylineCurve from '../../math/geometry/curve/NPolylineCurve';
import NArcCurve from '../../math/geometry/curve/NArcCurve';
import NCircleCurve from '../../math/geometry/curve/NCircleCurve';
import { TWO_PI } from '../../math/Constant';
import NNurbsCurve from '../../math/geometry/curve/NNurbsCurve';
import verb from '../../lib/verb/verb';
import NEllipseArcCurve from '../../math/geometry/curve/NEllipseArcCurve';
import ImporterNodeBase from './ImporterNodeBase';

export default class CurveImporter extends ImporterNodeBase {
  public get displayName (): string {
    return 'Curve Importer';
  }

  protected get folder (): string {
    return 'curves';
  }

  public registerOutputs (manager: OutputManager): void {
    manager.add('m', 'Imported curves', DataTypes.CURVE, AccessTypes.LIST);
  }

  public async solve (access: DataAccess): Promise<void> {
    if (this.fileUrl.length > 0) {
      const curves = await this.loadFile(this.fileUrl);
      access.setDataList(0, curves);
    } else {
      access.setDataList(0, []);
    }
    return Promise.resolve();
  }

  protected import (): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.svg,.SVG,.dxf,.DXF';
    input.onchange = (evt: Event) => {
      const input = evt.target as HTMLInputElement;
      const files = input.files as FileList;
      if (files.length > 0) {
        this.read(files[0]);
      }
    };
    input.click();
  }

  private async loadFile (url: string): Promise<NCurve[]> {
    const separated = url.split('/');
    const last = separated[separated.length - 1];
    const arr = last.split('?');
    const name = arr[0];
    const q = name.split('.');
    const ext = q[q.length - 1];

    const loader = new FileLoader();
    const content = await loader.loadAsync(url);

    return new Promise((resolve, reject) => {
      switch (ext) {
        case 'dxf':
        case 'DXF': {
          const helper = new Helper(content);
          return resolve(this.parseDXF(helper));
        }
        case 'svg':
        case 'SVG': {
          return resolve(this.parseSVG(content as string));
        }
        default:
          return reject(new Error(`${ext} format is not allowed`));
      }
    });
  }

  private parseDXF (helper: any): NCurve[] {
    const result: NCurve[] = [];

    for (const key in helper.groups) {
      const group = helper.groups[key];
      group.forEach((el: any) => {
        // https://www.autodesk.com/techpubs/autocad/acad2000/dxf/entities_section.htm
        switch (el.type) {
          case 'LINE': {
            result.push(new NLineCurve(new NPoint(el.start.x, el.start.y, el.start.z), new NPoint(el.end.x, el.end.y, el.end.z)));
            break;
          }
          case 'LWPOLYLINE':
          case 'POLYLINE':
          {
            result.push(new NPolylineCurve(
              el.vertices.map((v: any) => new NPoint(v.x, v.y, v.z)),
              el.closed
            ));
            break;
          }
          case 'ARC': {
            const plane = new NPlane(new NPoint(el.x, el.y, el.z));
            result.push(new NArcCurve(plane, el.startAngle, el.endAngle, el.r));
            break;
          }
          case 'CIRCLE': {
            const plane = new NPlane(new NPoint(el.x, el.y, el.z));
            result.push(new NCircleCurve(plane, el.r));
            break;
          }
          case 'ELLIPSE': {
            const start = el.startAngle;
            const end = el.endAngle;
            const arc = Math.abs(TWO_PI - (end - start)) > 1e-10;

            // axis
            const mx = el.majorX;
            const my = el.majorY;
            const mz = el.majorZ;

            const majorAxis = new Vector3(mx, my, mz);
            const r = majorAxis.length();
            const xAxis = majorAxis.clone().normalize();
            const normal = new Vector3(0, 0, 1);
            const yAxis = (new Vector3()).crossVectors(xAxis, normal);

            // https://www.autodesk.com/techpubs/autocad/acad2000/dxf/ellipse_dxf_06.htm
            const plane = new NPlane(new NPoint(el.x, el.y, el.z), xAxis, yAxis, normal);

            const ratio = el.axisRatio;
            if (!arc) {
              result.push(new NEllipseCurve(plane, r, r * ratio));
            }
            break;
          }
          case 'SPLINE': {
            let knots = el.knots as number[];
            const last = knots[knots.length - 1];
            knots = knots.map(v => v / last);
            const points = el.controlPoints.map((p: any) => [p.x, p.y, p.z]);
            const data = verb.geom.NurbsCurve.byKnotsControlPointsWeights(el.degree, knots, points);
            const crv = new NNurbsCurve(data);
            result.push(crv);
            break;
          }
          default: {
            break;
          }
        }
      });
    }

    return result;
  }

  parseSVG (svg: string) {
    let result: NCurve[] = [];

    const loader = new SVGLoader();
    const parsed = loader.parse(svg);
    parsed.paths.forEach((shape) => {
      const paths = shape.subPaths;

      paths.forEach((path) => {
        const curves = path.curves as any[];
        const group: NCurve[] = [];

        curves.forEach((curve) => {
          if (curve instanceof LineCurve) {
            group.push(
              new NLineCurve(
                new NPoint(
                  curve.v1.x,
                  curve.v1.y,
                  0
                ),
                new NPoint(
                  curve.v2.x,
                  curve.v2.y,
                  0
                )
              )
            );
          } else if (curve instanceof EllipseCurve) {
            const rx = curve.xRadius;
            const ry = curve.yRadius;
            const start = curve.aStartAngle;
            const end = curve.aEndAngle;

            const arc = Math.abs(TWO_PI - (end - start)) > 1e-10;
            const plane = new NPlane(new NPoint(curve.aX, curve.aY, 0));
            if (rx === ry) {
              // circle
              if (arc) {
                group.push(new NArcCurve(plane, start, end, rx));
              } else {
                group.push(new NCircleCurve(plane, rx));
              }
            } else if (arc) {
              group.push(new NEllipseArcCurve(plane, start, end, rx, ry));
            } else {
              group.push(new NEllipseCurve(plane, rx, ry));
            }
          // } else if (curve instanceof QuadraticBezierCurve) {
          } else if (curve instanceof CubicBezierCurve) {
            const vb = new verb.geom.BezierCurve([
              [curve.v0.x, curve.v0.y, 0],
              [curve.v1.x, curve.v1.y, 0],
              [curve.v2.x, curve.v2.y, 0],
              [curve.v3.x, curve.v3.y, 0]
            ]);
            const crv = new NNurbsCurve(vb);
            group.push(crv);
          }
        });

        if (path.autoClose && group.length >= 2) {
          const first = group[0];
          const last = group[group.length - 1];
          const lp = last.getPointAt(1);
          const fp = first.getPointAt(0);
          if (lp.distanceTo(fp) > 1e-6) {
            group.push(new NLineCurve(lp, fp));
          }
        }

        result = result.concat(group);
      });
    });

    return result;
  }
}
