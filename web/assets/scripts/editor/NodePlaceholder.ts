
import { Vector2 } from 'three';
import { NodeConstructorType } from '@nodi/core';

export default class NodePlaceholder {
  el: HTMLDivElement;
  position: Vector2 = new Vector2(0, 0);
  nodeConstructor: NodeConstructorType | null = null;

  constructor () {
    this.el = this.createElement();
  }

  createElement (): HTMLDivElement {
    const el = document.createElement('div');
    el.classList.add('placeholder');
    return el;
  }

  prepare (nodeConstructor: NodeConstructorType) {
    this.nodeConstructor = nodeConstructor;
  }

  move (x: number, y: number): void {
    this.el.style.transform = `translate(${x}px, ${y}px)`;
    this.position.x = x;
    this.position.y = y;
  }

  show (x: number, y: number): void {
    this.el.hidden = false;
    this.move(x, y);
  }

  hide (): void {
    this.el.hidden = true;
  }
}
