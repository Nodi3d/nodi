
import { IDisposable } from '@nodi/core';
import { GUIEvent, ViewEvent } from '../misc/Events';

export default abstract class View implements IDisposable {
  public dom: HTMLDivElement;
  public onMouseEnter: GUIEvent = new GUIEvent();
  public onMouseDown: GUIEvent = new GUIEvent();
  public onMouseClick: GUIEvent = new GUIEvent();
  public onMouseUp: GUIEvent = new GUIEvent();
  public onMouseOver: GUIEvent = new GUIEvent();
  public onMouseOut: GUIEvent = new GUIEvent();
  public onContextMenu: GUIEvent = new GUIEvent();
  public onDispose: ViewEvent = new ViewEvent();

  constructor (className: string) {
    this.dom = this.createElement(className);
    this.setupEvent(this.dom);
  }

  protected createElement (className: string): HTMLDivElement {
    const el = document.createElement('div');
    el.classList.add(className);
    return el;
  }

  private setupEvent (el: HTMLDivElement) {
    el.addEventListener('mouseenter', this.onMouseEnter.emit, false);
    el.addEventListener('mousedown', this.onMouseDown.emit, false);
    el.addEventListener('click', this.onMouseClick.emit, false);
    el.addEventListener('mouseup', this.onMouseUp.emit, false);
    el.addEventListener('mouseover', this.onMouseOver.emit, false);
    el.addEventListener('mouseout', this.onMouseOut.emit, false);
    el.addEventListener('contextmenu', this.onContextMenu.emit, false);
  }

  public dispose (): void {
    this.onDispose.emit({ view: this });
    this.dom.remove();
    this.onMouseEnter.dispose();
    this.onMouseDown.dispose();
    this.onMouseClick.dispose();
    this.onMouseUp.dispose();
    this.onMouseOver.dispose();
    this.onMouseOut.dispose();
    this.onContextMenu.dispose();
    this.onDispose.dispose();
  }
}
