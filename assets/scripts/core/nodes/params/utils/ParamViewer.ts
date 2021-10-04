import { AccessTypes } from '../../../data/AccessTypes';
import Branch from '../../../data/Branch';
import DataAccess from '../../../data/DataAccess';
import DataTree from '../../../data/DataTree';
import { DataTypes } from '../../../data/DataTypes';
import InputManager from '../../../io/InputManager';
import OutputManager from '../../../io/OutputManager';
import { TypedEvent } from '../../../misc/TypedEvent';
import NodeBase from '../../NodeBase';

const width = 140; const height = 140;
const cx = width * 0.5; const cy = height * 0.5;
const radius = 60;
const theta = Math.PI * 2 * 0.75;

class ViewerNode {
  public get cx (): number {
    return this._cx;
  }

  public get cy (): number {
    return this._cy;
  }

  public get count (): number {
    return this._count;
  }

  public get children (): ViewerNode[] {
    return this._children;
  }

  private _cx: number = 0;
  private _cy: number = 0;
  private path: string = '';
  private _count: number = 0;
  private parent?: ViewerNode;
  private _children: ViewerNode[] = [];

  constructor (path: string, parent?: ViewerNode) {
    this.path = path;
    this.parent = parent;
    this._count = 0;
    if (this.parent !== undefined) {
      this.parent.spawn(this);
    }
  }

  add () {
    this._count++;
  }

  spawn (child: ViewerNode) {
    this._children.push(child);
  }

  place (cx: number, cy: number) {
    this._cx = cx;
    this._cy = cy;
  }
}

export default class ParamViewer extends NodeBase {
  private onParamChanged: TypedEvent<{ branches: Branch[]; hierarchies: { [index: string]: ViewerNode}[] }> = new TypedEvent();

  public get displayName (): string {
    return 'ParamViewer';
  }

  public get flowable (): boolean {
    return false;
  }

  public get previewable (): boolean {
    return false;
  }

  public setupViewElement (container: HTMLDivElement): void {
    const textView = document.createElement('div');
    textView.classList.add('param-viewer-text');

    const graphView = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    graphView.classList.add('param-viewer-graph');

    container.appendChild(textView);
    container.appendChild(graphView);

    textView.style.display = 'none';
    graphView.style.display = '';
    container.addEventListener('dblclick', (e) => {
      // swap display
      const temp = textView.style.display;
      textView.style.display = graphView.style.display;
      graphView.style.display = temp;

      e.preventDefault();
      e.stopPropagation();
    });

    this.onParamChanged.on(({ branches, hierarchies }) => {
      this.setupTextView(textView, branches);
      this.setupGraphView(graphView, hierarchies);
    });
  }

  private createCircle (cx: number, cy: number, r: number): SVGCircleElement {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx.toString());
    circle.setAttribute('cy', cy.toString());
    circle.setAttribute('r', r.toString());
    circle.setAttribute('stroke', '#555555');
    circle.setAttribute('stroke-width', '0.2');
    circle.setAttribute('fill', 'none');
    return circle;
  }

  private createRoot (cx: number, cy: number, r: number = 1.0) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx.toString());
    circle.setAttribute('cy', cy.toString());
    circle.setAttribute('r', r.toString());
    circle.setAttribute('fill', '#333333');
    return circle;
  }

  private createNode (cx: number, cy: number, leaf: boolean = false, r: number = 1.5) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx.toString());
    circle.setAttribute('cy', cy.toString());
    circle.setAttribute('r', r.toString());
    circle.setAttribute('stroke', '#333333');
    circle.setAttribute('stroke-width', '0.4');
    const color = leaf ? '#18a0fb' : '#eafeff';
    circle.setAttribute('fill', color);
    return circle;
  }

  private createEdge (x1: number, y1: number, x2: number, y2: number) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());
    line.setAttribute('stroke', '#333333');
    line.setAttribute('stroke-width', '0.4');
    return line;
  }

  private offset (angle: number, theta: number) {
    const sub = theta * 0.5 - Math.PI * 0.5;
    return angle - sub + Math.PI;
  }

  private clearView (element: Element) {
    while (element.firstChild) {
      element.firstChild.remove();
    }
  }

  public registerInputs (manager: InputManager): void {
    manager.add('i', 'Data to visualize', DataTypes.ANY, AccessTypes.TREE);
  }

  public registerOutputs (manager: OutputManager): void {
  }

  public clear (dispose: boolean = true): void {
    super.clear(dispose);
    this.onParamChanged.emit({
      branches: [],
      hierarchies: []
    });
  }

  public solve (access: DataAccess): void {
    const tree = access.getDataTree(0);
    const branches = tree.branches;

    // 各階層の数を取得する
    const hierarchies: { [index: string]: ViewerNode }[] = [];

    branches.forEach((br) => {
      const path = br.getPath();
      const route: number[] = [];
      let parent: ViewerNode | undefined;
      path.indices.forEach((i, depth) => {
        route.push(i);

        if (hierarchies[depth] === undefined) {
          hierarchies[depth] = {};
        }

        const key = route.join(';');
        if (!(key in hierarchies[depth])) {
          hierarchies[depth][key] = new ViewerNode(key, parent);
        }
        hierarchies[depth][key].add();

        parent = hierarchies[depth][key];
      });
    });

    this.onParamChanged.emit({
      branches,
      hierarchies
    });
  }

  private setupTextView (div: HTMLDivElement, branches: Branch[]) {
    this.clearView(div);

    const p = document.createElement('p');
    p.classList.add('branches');
    p.classList.add('text-mono');
    p.textContent = `${branches.length} branches`;
    div.appendChild(p);
    branches.forEach((br) => {
      this.insertBranchText(div, br);
    });
  }

  private insertBranchText (div: HTMLDivElement, br: Branch) {
    const s0 = document.createElement('span');
    s0.classList.add('path');
    s0.classList.add('text-mono');
    s0.textContent = `{${br.getPath()}}`;

    const s1 = document.createElement('span');
    s1.classList.add('N');
    s1.classList.add('text-mono');
    s1.textContent = `N = ${br.getValue().length}`;

    const p = document.createElement('p');
    p.classList.add('branch');
    p.classList.add('text-mono');
    p.appendChild(s0);
    p.appendChild(s1);

    div.appendChild(p);
  }

  private setupGraphView (svg: SVGElement, hierarchies: { [index: string]: ViewerNode }[]) {
    this.clearView(svg);

    const layers = hierarchies.length;
    if (layers <= 0) { return; }

    // root positions
    for (const key in hierarchies[0]) {
      const node = hierarchies[0][key];
      node.place(cx, cy);
    }

    if (layers <= 1) {
      svg.appendChild(this.createCircle(cx, cy, radius));

      const nodes = Object.values(hierarchies[0]);
      this.spread(nodes, radius);
      this.drawEdges(svg, cx, cy, nodes);
      this.drawNodes(svg, 0, layers, hierarchies[0]);
      return;
    }

    // visualize hierarchy depth by layered circles
    for (let layer = 0; layer < layers; layer++) {
      const depth = (layer / (layers - 1)) * radius;
      svg.appendChild(this.createCircle(cx, cy, depth));
    }

    for (let layer = 0; layer < layers; layer++) {
      const depth = layer / (layers - 1) * radius;
      const hierarchy = hierarchies[layer];
      const nodes = Object.values(hierarchy);
      this.spread(nodes, depth);
    }

    for (let layer = 0; layer < layers; layer++) {
      const nodes = hierarchies[layer];

      // draw edges first
      for (const key in nodes) {
        const node = nodes[key];
        this.drawEdges(svg, node.cx, node.cy, node.children);
      }

      // draw nodes
      if (layer <= 0) {
        svg.appendChild(this.createNode(cx, cy));
      } else {
        this.drawNodes(svg, layer, layers, nodes);
      }
    }
  }

  private drawEdges (svg: SVGElement, x: number, y: number, nodes: ViewerNode[]): void {
    nodes.forEach((child) => {
      svg.appendChild(this.createEdge(x, y, child.cx, child.cy));
    });
  }

  private drawNodes (svg: SVGElement, layer: number, layers: number, nodes: {[index:string]: ViewerNode}): void {
    for (const key in nodes) {
      const node = nodes[key];
      svg.appendChild(this.createNode(node.cx, node.cy, layer >= layers - 1));
    }
  }

  private spread (nodes: ViewerNode[], depth: number): void {
    const sum = nodes.reduce((pre, cur) => {
      return pre + cur.count;
    }, 0);
    let offset = 0;
    nodes.forEach((node) => {
      const ratio = node.count / sum;
      const r = offset + ratio * 0.5;
      const angle = this.offset(r * theta, theta);

      const dx = Math.cos(angle) * depth;
      const dy = Math.sin(angle) * depth;
      const px = cx + dx;
      const py = cy + dy;

      node.place(px, py);

      offset += ratio;
    });
  }

  public dispose (): void {
    super.disable();
    this.onParamChanged.dispose();
  }
}
