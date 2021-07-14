
import { Vector2 } from 'three';
import { Colors, DataTypes, getTypeNames } from '../../core/data/DataTypes';
import Input from '../../core/io/Input';
import IO from '../../core/io/IO';
import Output from '../../core/io/Output';
import View from './View';

const ioSize = 10;
const halfIoSize = ioSize * 0.5;

export default class IOView extends View {
  protected entity: WeakRef<IO>;
  svg: SVGSVGElement;

  constructor (io: IO) {
    super((io instanceof Input) ? 'input' : 'output');

    this.entity = new WeakRef(io);
    this.svg = this.setupType(io.getDataType());
    io.onStateChanged.on((e) => {
      this.synchronize(e.io);
    });

    this.onMouseOver.on(() => {
      // const io = this.entity.deref();
      // console.log(io?.getConnectionCount());
    });
  }

  public getIO (): IO {
    return this.entity.deref() as IO;
  }

  public isInput (): boolean {
    return (this.entity.deref() instanceof Input);
  }

  public isOutput (): boolean {
    return (this.entity.deref() instanceof Output);
  }

  public distanceTo (p: Vector2): number {
    const wp = this.getWorldPosition();
    const dx = wp.x - p.x;
    const dy = wp.y - p.y;
    return dx * dx + dy * dy;
  }

  protected synchronize (io: IO): void {
    if (io.selected) { this.select(); } else { this.unselect(); }
  }

  protected select (): void {
    this.dom.classList.add('selected');
  }

  protected unselect (): void {
    this.dom.classList.remove('selected');
  }

  protected setupType (type: DataTypes): SVGSVGElement {
    if (this.svg !== undefined) {
      this.svg.remove();
    }

    this.svg = this.createSvg(type);
    this.dom.appendChild(this.svg);
    return this.svg;
  }

  public highlight (valid: boolean): void {
    if (valid) {
      this.dom.classList.add('valid');
    } else {
      this.dom.classList.add('invalid');
    }
  }

  public unhighlight (): void {
    this.dom.classList.remove('valid');
    this.dom.classList.remove('invalid');
  }

  public nearest (): void {
    this.dom.classList.add('nearest');
  }

  public unnearest (): void {
    this.dom.classList.remove('nearest');
  }

  public getWorldPosition (): Vector2 {
    let x = this.dom.offsetLeft + this.dom.offsetWidth * 0.5;
    let y = this.dom.offsetTop + this.dom.offsetHeight * 0.5;
    const parent = this.dom.parentElement;
    const matrix = new DOMMatrixReadOnly(parent?.style.transform);
    x += matrix.m41;
    y += matrix.m42;
    return new Vector2(x, y);
  }

  protected createSvg (type: DataTypes): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', `${ioSize}`);
    svg.setAttribute('height', `${ioSize}`);

    const colors = getTypeNames(type).map(t => Colors[t.toUpperCase()]);
    const count = colors.length;
    if (count <= 1) {
      this.addCircle(svg, colors[0]);
    } else {
      colors.forEach((color: string, i: number) => {
        this.addArc(svg, color, i, count);
      });
    }
    return svg;
  }

  protected addCircle (svg: SVGSVGElement, color: string): SVGCircleElement {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', `${halfIoSize}`);
    circle.setAttribute('cy', '0');
    circle.setAttribute('r', `${halfIoSize}`);
    circle.style.stroke = color;
    svg.appendChild(circle);
    return circle;
  }

  protected addArc (svg: SVGSVGElement, color = 'rgb(255, 0, 0)', index: number, length: number): SVGPathElement {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    const sx = halfIoSize;
    const sy = 0;
    const radius = halfIoSize;
    const pi2 = Math.PI * 2;

    const r0 = index / length * pi2;
    const c0 = Math.cos(r0) * radius;
    const s0 = Math.sin(r0) * radius;

    const r1 = (index + 1) / length * pi2;
    const c1 = Math.cos(r1) * radius;
    const s1 = Math.sin(r1) * radius;

    const dx = c1 - c0;
    const dy = s1 - s0;

    // a means arcto
    // a rx, ry xAxisRotate LargeArcFlag, SweepFlag x, y
    path.setAttribute('d', `M ${c0 + sx} ${s0 + sy} a ${radius} ${radius} 0 0 1 ${dx} ${dy}`);
    path.style.stroke = color;

    svg.appendChild(path);

    return path;
  }

  public match (other: IOView): boolean {
    const io = this.entity.deref() as IO;
    return io.match(other.getIO());
  }
}
