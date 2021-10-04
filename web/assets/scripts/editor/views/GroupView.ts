import { NodeBase, GroupElement } from '@nodi/core';
import { GroupViewEvent } from '../misc/Events';
import NodeView from './NodeView';
import View from './View';

export default class GroupView extends View {
  public onChanged: GroupViewEvent = new GroupViewEvent();
  protected entity: WeakRef<GroupElement>;

  constructor (group: GroupElement) {
    super('group');
    this.entity = new WeakRef(group);

    group.onStateChanged.on(() => {
      this.onChanged.emit({ view: this, e: new MouseEvent('') });
    });
  }

  public get uuid (): string {
    return this.getGroup().uuid;
  }

  public hasNode (node: string): boolean {
    return this.getGroup().hasNode(node);
  }

  public select (): void {
    this.dom.classList.add('selected');
  }

  public unselect (): void {
    this.dom.classList.remove('selected');
  }

  private filter (nodes: NodeView[]): NodeView[] {
    const group = this.getGroup();
    return nodes.filter((n) => {
      return group.hasNode(n.uuid);
    });
  }

  public track (nodes: NodeView[]): void {
    const max = 1e8;
    const min = -1e8;
    let minX = max;
    let maxX = min;
    let minY = max;
    let maxY = min;

    const filtered = this.filter(nodes);
    filtered.forEach((n) => {
      const r = n.dom.getBoundingClientRect();
      const x1 = r.x;
      const y1 = r.y;
      const x2 = (x1 + r.width);
      const y2 = (y1 + r.height);
      minX = Math.min(minX, x1);
      minY = Math.min(minY, y1);
      maxX = Math.max(maxX, x2);
      maxY = Math.max(maxY, y2);
    });

    const parent = this.dom.parentElement?.parentElement as HTMLElement;
    const matrix = new DOMMatrixReadOnly(parent?.style.transform);
    const scale = matrix.m11;
    const ox = matrix.m41;
    const oy = matrix.m42;

    const offset = 16 * scale;
    const ol = parent.offsetLeft;
    const ot = parent.offsetTop;
    const l = ol / scale;
    const t = ot / scale;

    minX = this.convert(minX - offset, ox, scale) - l;
    minY = this.convert(minY - offset, oy, scale) - t;
    maxX = this.convert(maxX + offset, ox, scale) - l;
    maxY = this.convert(maxY + offset, oy, scale) - t;

    const w = maxX - minX;
    const h = maxY - minY;

    const x = minX;
    const y = minY;
    this.dom.style.left = `${x}px`;
    this.dom.style.top = `${y}px`;
    this.dom.style.width = `${w}px`;
    this.dom.style.height = `${h}px`;
  }

  private convert (v: number, p: number, scale: number): number {
    return (v - p) / scale;
  }

  public getGroup (): GroupElement {
    return this.entity.deref() as GroupElement;
  }

  public dispose (): void {
    super.dispose();
    this.onChanged.dispose();
  }
}
