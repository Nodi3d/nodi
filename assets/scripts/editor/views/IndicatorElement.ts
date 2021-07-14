import IDisposable from '../../core/misc/IDisposable';

export default class IndicatorElement implements IDisposable {
  private interval: number;
  private glyphs: string[] = ['⠋', '⠙', '⠚', '⠞', '⠖', '⠦', '⠴', '⠲', '⠳'];
  private current: number = 0;
  private intervalId?: NodeJS.Timeout;
  public dom: HTMLSpanElement;

  constructor (interval: number = 105) {
    this.interval = interval;
    this.dom = this.createElement();
    this.start();
  }

  private createElement (): HTMLSpanElement {
    const el = document.createElement('span');
    el.classList.add('indicator');
    el.textContent = this.glyphs[this.current];
    return el;
  }

  public start () {
    this.intervalId = setInterval(() => {
      this.current = (this.current + 1) % this.glyphs.length;
      this.dom.textContent = this.glyphs[this.current];
    }, this.interval);
  }

  public stop () {
    if (this.intervalId !== undefined) { clearInterval(this.intervalId); }
  }

  public show () {
    this.dom.style.visibility = 'visible';
  }

  public hide () {
    this.dom.style.visibility = 'hidden';
  }

  dispose () {
    this.stop();
  }
}
