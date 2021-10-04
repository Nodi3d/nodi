import { Color, Sprite, SpriteMaterial, Texture, Vector3 } from 'three';
import { IDisposable } from '~/src/misc/IDisposable';
import { IElementable } from '@/src/misc/IElementable';
import { NodeBase } from '@/src/nodes/NodeBase';

export class NVTextSprite extends Sprite implements IElementable {
  private _text: string;
  private _textHeight: number;
  private _color: string;
  private _baseScale: Vector3;

  private _fontFace: string;
  private _fontSize: number;
  private _fontWeight: string;

  private _canvas: HTMLCanvasElement;
  private _texture: Texture;
  private _listener?: IDisposable;

  constructor (text = '', color = 'rgba(255, 255, 255, 1)', textHeight = 10) {
    super(new SpriteMaterial({
      map: new Texture(),
      sizeAttenuation: false,
      depthTest: false,
      depthWrite: false
    }));

    this._text = text;
    this._textHeight = textHeight;
    this._color = color;
    this._baseScale = new Vector3();

    this._fontFace = 'Consolas';
    this._fontSize = 90; // defines text resolution
    this._fontWeight = 'normal';

    this._canvas = document.createElement('canvas');
    this._texture = this.material.map as Texture;

    this.updateCanvas();
  }

  node: string = '';

  setup (node: NodeBase): void {
    this.node = node.uuid;
    this.visible = node.visible;
    this._listener?.dispose();
    this._listener = node.onStateChanged.on((e) => {
      const n = e.node;
      this.visible = n.visible;
      this.select(n);
    });
    this.select(node);
  }

  select (node: NodeBase): void {
    const material = this.material as SpriteMaterial;
    material.color = new Color(node.selected ? 0x00FF00 : 0xFF0000);
    material.depthTest = !node.selected;
    this.renderOrder = node.selected ? 10000 : 0;
  }

  get text () { return this._text; }
  set text (text: string) { this._text = text; this.updateCanvas(); }
  get textHeight () { return this._textHeight; }
  set textHeight (textHeight: number) { this._textHeight = textHeight; this.updateCanvas(); }
  get color () { return this._color; }
  set color (color: string) { this._color = color; this.updateCanvas(); }
  get fontFace () { return this._fontFace; }
  set fontFace (fontFace: string) { this._fontFace = fontFace; this.updateCanvas(); }
  get fontSize () { return this._fontSize; }
  set fontSize (fontSize: number) { this._fontSize = fontSize; this.updateCanvas(); }
  get fontWeight () { return this._fontWeight; }
  set fontWeight (fontWeight: string) { this._fontWeight = fontWeight; this.updateCanvas(); }

  private updateCanvas () {
    const canvas = this._canvas;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (ctx === null) { return; }

    const font = `${this.fontWeight} ${this.fontSize}px ${this.fontFace}`;

    ctx.font = font;
    const textWidth = ctx.measureText(this.text).width;
    canvas.width = textWidth;
    canvas.height = this.fontSize;

    ctx.font = font;
    ctx.fillStyle = this.color;
    ctx.textBaseline = 'bottom';
    ctx.fillText(this.text, 0, canvas.height);

    // Inject canvas into sprite
    this._texture.image = canvas;
    this._texture.needsUpdate = true;

    this._baseScale.set(this.textHeight * canvas.width / canvas.height, this.textHeight, 1);
    this.scale.copy(this._baseScale);
  }

  setResolution (w: number, h: number, zoom: number) {
    this.resize(w, h, zoom);
  }

  resize (_w: number, h: number, zoom: number) {
    const baseHeight = 640;
    const ratio = baseHeight / h;
    const tScale = (new Vector3(1, 1, 1)).multiplyScalar(ratio / zoom);
    // const tScale = (new THREE.Vector2(1, 1)).multiplyScalar(Math.min(ratio / zoom, 1.0))
    // const tScale = new THREE.Vector2(1, 1)
    this.scale.copy(tScale.clone().multiply(this._baseScale));
  }

  dispose () {
    this._texture.dispose();
    this._listener?.dispose();
  }
}
