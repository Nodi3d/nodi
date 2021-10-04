
import { UINumber } from './UINumber';

export class UINumberSlider extends UINumber {
  get displayName (): string {
    return 'UINumberSlider';
  }

  private numberSliderTimeout: number | undefined;

  public setupViewElement (container: HTMLDivElement): void {
    container.classList.add('slider-number-node');

    const numberSliderElement = this.createSliderElement(this.prev);
    container.appendChild(numberSliderElement);

    super.setupViewElement(container);
  }

  public setupGUIElement (container: HTMLDivElement): void {
    const span = this.createGUILabelSpan();
    container.appendChild(span);

    const slider = this.createSliderElement(this.prev);
    slider.style.marginRight = '8px';
    slider.style.width = '120px';
    container.appendChild(slider);

    const input = this.createNumberElement();
    input.style.width = '80px';
    container.appendChild(input);
  }

  private createSliderElement (value: number): HTMLInputElement {
    const slider = document.createElement('input');
    slider.setAttribute('type', 'range');
    slider.addEventListener('mousedown', (e) => { e.stopPropagation(); }, false);
    slider.addEventListener('input', this.onSliderValueChanged.bind(this));
    slider.addEventListener('change', this.onSliderValueChanged.bind(this));

    slider.min = this.min.toString();
    slider.max = this.max.toString();
    slider.step = this.interval.toString();
    slider.value = value.toString();

    this.onValueChanged.on(() => {
      slider.value = this.prev.toString();
    });
    this.onSettingsChanged.on(() => {
      slider.min = this.min.toString();
      slider.max = this.max.toString();
      slider.step = this.interval.toString();
    });

    return slider;
  }

  protected onNumberValueChanged (e: Event): void {
    const source = e.target as HTMLInputElement;
    const value = source.value;
    this.triggerChanged(value);
  }

  private onSliderValueChanged (e: Event): void {
    const source = e.target as HTMLInputElement;
    const value = source.value;
    this.triggerChanged(value);
  }

  private triggerChanged (v: string) {
    this.clearTimeout();

    const current = Number(v);
    this.numberSliderTimeout = window.setTimeout(() => {
      const prev = this.prev;
      this.prev = current;
      if (prev !== current) {
        this.notifyValueChanged();
      }
      this.clearTimeout();
    }, 5);
  }

  private clearTimeout () {
    if (this.numberSliderTimeout !== undefined) { clearTimeout(this.numberSliderTimeout); }
    this.numberSliderTimeout = undefined;
  }
}
