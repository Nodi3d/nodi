
import { Vector2 } from 'three';

import { NodeBase, IO, IndicatorElement } from '@nodi/core';
import InputUtils from '../misc/InputUtils';
import { NodeIOViewEvent, NodeViewEvent } from '../misc/Events';
import View from './View';
import IOView from './IOView';
import ConnectingEdgeView from './ConnectingEdgeView';

export default class NodeView extends View {
  protected entity: WeakRef<NodeBase>;
  protected performanceLabel: HTMLSpanElement;

  inputs: IOView[] = [];
  outputs: IOView[] = [];

  public onTransformView: NodeViewEvent = new NodeViewEvent();
  public onSelectView: NodeViewEvent = new NodeViewEvent();
  public onClickView: NodeViewEvent = new NodeViewEvent();
  public onContextView: NodeViewEvent = new NodeViewEvent();

  public onMouseOverIOView: NodeIOViewEvent = new NodeIOViewEvent();
  public onMouseOutIOView: NodeIOViewEvent = new NodeIOViewEvent();
  public onMouseDownIOView: NodeIOViewEvent = new NodeIOViewEvent();
  public onMouseUpIOView: NodeIOViewEvent = new NodeIOViewEvent();

  private indicator: IndicatorElement = new IndicatorElement();
  private togglePreview: HTMLDivElement;

  constructor (node: NodeBase) {
    super('node');

    this.entity = new WeakRef(node);
    node.onTransformed.on(() => {
      this.transform();
    });
    node.onStateChanged.on((e) => {
      this.synchronize(e.node);
    });
    node.onValueChanged.on((e) => {
      this.synchronize(e.node);
    });
    this.performanceLabel = this.createPerformanceLabel();
    this.dom.appendChild(this.performanceLabel);
    this.dom.appendChild(this.indicator.dom);

    node.setupViewElement(this.dom);
    this.setupUIEvent();

    if (node.flowable) {
      this.createToggleUI('enable', (_e: MouseEvent) => {
        if (!this.enabled) {
          this.entity.deref()?.enable();
        } else {
          this.entity.deref()?.disable();
        }
      });
    }

    this.togglePreview = this.createToggleUI('preview', (_e: MouseEvent) => {
      if (!this.visible) {
        this.entity.deref()?.show();
      } else {
        this.entity.deref()?.hide();
      }
    });
    this.togglePreview.hidden = !node.previewable;

    this.inputs = node.inputManager.inputs.map((i) => {
      return this.addIOView(i);
    });
    this.outputs = node.outputManager.outputs.map((o) => {
      return this.addIOView(o);
    });
    this.alignIO(this.inputs);
    this.alignIO(this.outputs);

    node.inputManager.onAddIO.on((e) => {
      this.inputs.push(this.addIOView(e.io));
      this.alignIO(this.inputs);
    });
    node.inputManager.onRemoveIO.on((e) => {
      const found = this.inputs.find(v => v.getIO() === e.io);
      if (found !== undefined) {
        found.dispose();
        const index = this.inputs.indexOf(found);
        this.inputs.splice(index, 1);
        this.alignIO(this.inputs);
      }
    });
    node.outputManager.onAddIO.on((e) => {
      this.outputs.push(this.addIOView(e.io));
      this.alignIO(this.outputs);
    });
    node.outputManager.onRemoveIO.on((e) => {
      const found = this.outputs.find(v => v.getIO() === e.io);
      if (found !== undefined) {
        found.dispose();
        const index = this.outputs.indexOf(found);
        this.outputs.splice(index, 1);
        this.alignIO(this.outputs);
      }
    });

    this.synchronize(node);
  }

  protected addIOView (io: IO): IOView {
    const v = new IOView(io);
    this.dom.appendChild(v.dom);
    this.setupIOEvent(v);
    return v;
  }

  public getNode (): NodeBase {
    return this.entity.deref() as NodeBase;
  }

  public get uuid (): string {
    return this.getNode().uuid;
  }

  public get enabled (): boolean {
    return this.getNode().enabled;
  }

  public get visible (): boolean {
    return this.getNode().visible;
  }

  public get selected (): boolean {
    return this.getNode().selected;
  }

  public getPosition (): Vector2 {
    return this.getNode().getPosition().clone();
  }

  protected setupUIEvent (): void {
    this.onMouseDown.on((e) => {
      const which = InputUtils.getMouseWhich(e);
      if (which !== 1) { return; }
      e.stopPropagation();
      this.onSelectView.emit({ e, view: this });
    });
    this.onMouseClick.on((e) => {
      e.stopPropagation();
      this.onClickView.emit({ e, view: this });
    });
    this.onMouseUp.on((e) => {
      const which = InputUtils.getMouseWhich(e);
      if (which !== 3) { return; }

      this.onContextView.emit({ e, view: this });
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // #region html

  createToggleUI (cls: string, onToggle: (e: MouseEvent) => void): HTMLDivElement {
    const toggle = document.createElement('div');
    toggle.classList.add('toggle');
    toggle.classList.add(cls);

    const button = document.createElement('div');
    button.classList.add('button');

    toggle.appendChild(button);

    this.dom.appendChild(toggle);
    this.setupToggleEvent(button, onToggle);

    return toggle;
  }

  calculateMinHeight (count: number) {
    const node = this.getNode();
    return Math.max(node.minHeight, count * 16);
  }

  alignIO (ioViews: IOView[]) {
    const count = ioViews.length;
    const ratio = 100 / count;
    const off = 100 / (count * 2);

    ioViews.forEach((io, i) => {
      io.dom.style.top = `calc(${ratio * i + off}% - 5px)`;
    });

    const max = Math.max(this.inputs.length, this.outputs.length);
    this.dom.style.minHeight = `${this.calculateMinHeight(max)}px`;

    this.transform();
  }

  setupToggleEvent (div: HTMLDivElement, onToggle: (e: MouseEvent) => void) {
    div.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
    }, false);
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      onToggle(e);
    }, false);
    div.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      e.preventDefault();
    }, false);
  }

  setupIOEvent (ioView: IOView) {
    ioView.onMouseOver.on((e) => { this.onMouseOverIOView.emit({ e, node: this, io: ioView }); });
    ioView.onMouseOut.on((e) => { this.onMouseOutIOView.emit({ e, node: this, io: ioView }); });
    ioView.onMouseDown.on((e) => { this.onMouseDownIOView.emit({ e, node: this, io: ioView }); });
    ioView.onMouseUp.on((e) => { this.onMouseUpIOView.emit({ e, node: this, io: ioView }); });
  }

  createElement (): HTMLDivElement {
    const el = document.createElement('div');
    el.classList.add('node');
    return el;
  }

  protected createPerformanceLabel (): HTMLSpanElement {
    const span = document.createElement('span');
    span.classList.add('performance');
    span.classList.add('invisible');
    return span;
  }

  public showPerformance (): void {
    this.performanceLabel.textContent = `${this.getNode().executionTime}ms`;
    this.performanceLabel.classList.remove('invisible');
  }

  public hidePerformance (): void {
    this.performanceLabel.classList.add('invisible');
  }

  createLabel (text: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
  }

  // #endregion html

  public transform (): void {
    const position = this.getNode().getPosition();
    this.dom.style.transform = `translate(${position.x}px, ${position.y}px)`;
    this.onTransformView.emit({ e: new MouseEvent(''), view: this });
  }

  // public alignTo (x: number, y: number, r: number): void {}

  protected synchronize (node: NodeBase): void {
    if (node.selected) { this.select(); } else { this.unselect(); }
    if (node.enabled) { this.enable(); } else { this.disable(); }
    if (node.visible) { this.show(); } else { this.hide(); }
    if (node.processing) { this.showIndicator(); } else { this.hideIndicator(); }
    this.togglePreview.hidden = !node.previewable;

    const error = node.getErrorMessage();
    if (error !== null && error.length > 0) {
      this.dom.classList.add('error');
    } else {
      this.dom.classList.remove('error');
    }

    this.performanceLabel.textContent = `${node.executionTime}ms`;
  }

  protected select (): void {
    this.dom.classList.add('selected');
  }

  protected unselect (): void {
    this.dom.classList.remove('selected');
  }

  protected enable (): void {
    this.dom.classList.remove('disabled');
  }

  protected disable (): void {
    this.dom.classList.add('disabled');
  }

  protected show (): void {
    this.dom.classList.remove('invisible');
  }

  protected hide (): void {
    this.dom.classList.add('invisible');
  }

  protected showIndicator (): void {
    this.indicator.show();
  }

  protected hideIndicator (): void {
    this.indicator.hide();
  }

  public isConnectable (io: IOView, edge: ConnectingEdgeView): boolean {
    const isDestination = edge.IsDestinationNode();

    if (
      (edge.getIOView() === io) ||
      (isDestination === io.isInput()) // in case of source to input or dest to output
    ) {
      return false;
    }
    const node = this.getNode();
    const target = edge.getIOView().getIO().getParent();
    if (target === undefined || target === node) { return false; }
    return !target.isConnected(node, !isDestination) && io.match(edge.getIOView());
  }

  public isConnected (other: NodeView, toInputDirection: boolean): boolean {
    return this.getNode().isConnected(other.getNode(), toInputDirection);
  }

  public hasIOView (ioView: IOView): boolean {
    return this.inputs.includes(ioView) || this.outputs.includes(ioView);
  }

  public dispose (): void {
    this.inputs.forEach(io => io.dispose());
    this.outputs.forEach(io => io.dispose());

    this.onTransformView.dispose();
    this.onSelectView.dispose();
    this.onClickView.dispose();
    this.onContextMenu.dispose();
    this.onMouseOverIOView.dispose();
    this.onMouseOutIOView.dispose();
    this.onMouseDownIOView.dispose();
    this.onMouseUpIOView.dispose();

    super.dispose();
  }
}
