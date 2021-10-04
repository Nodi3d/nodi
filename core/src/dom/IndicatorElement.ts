import { IDisposable } from '../misc/IDisposable';

export class IndicatorElement implements IDisposable {
  public get dom (): HTMLSpanElement {
    return this._dom;
  }

  private interval: number;
  private glyphs: string[] = ['⠋', '⠙', '⠚', '⠞', '⠖', '⠦', '⠴', '⠲', '⠳'];
  private current: number = 0;
  private intervalId?: number;
  private _dom: HTMLSpanElement;

  constructor (interval: number = 105) {
    this.interval = interval;
    this._dom = this.createElement();
    this.start();
  }

  private createElement (): HTMLSpanElement {
    const el = document.createElement('span');
    el.classList.add('indicator');
    el.textContent = this.glyphs[this.current];
    return el;
  }

  public start () {
    this.intervalId = window.setInterval(() => {
      this.current = (this.current + 1) % this.glyphs.length;
      this._dom.textContent = this.glyphs[this.current];
    }, this.interval);
  }

  public stop () {
    if (this.intervalId !== undefined) { clearInterval(this.intervalId); }
  }

  public show () {
    this._dom.style.visibility = 'visible';
  }

  public hide () {
    this._dom.style.visibility = 'hidden';
  }

  dispose () {
    this.stop();
  }
}
