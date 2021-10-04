import { FrontSide, LinearFilter, Matrix4, Mesh, MeshBasicMaterial, OneMinusSrcAlphaFactor, PlaneGeometry, SrcAlphaFactor, Texture, Vector3 } from 'three';
import IDisposable from '../../core/misc/IDisposable';
import IResolutionResponsible from '../misc/IResolutionResponsible';

const geometry = new PlaneGeometry(2, 2, 2, 2);

export default class TextLabel extends Mesh implements IDisposable, IResolutionResponsible {
  text: string;
  color: string;
  textHeight: number;
  baseScale: Vector3;

  canvas: HTMLCanvasElement;
  texture: Texture;
  fontFace: string;
  fontSize: number;
  fontWeight: string;

  constructor (text: string, color: string = '#000000', textHeight: number = 1, offset: number = 0) {
    let g = geometry.clone();
    const m = (new Matrix4()).makeTranslation(0, textHeight * 0.5 + textHeight * offset, 0);
    g = g.applyMatrix4(m);
    const map = new Texture();

    super(g, new MeshBasicMaterial({
      map,
      transparent: true,
      blendSrc: SrcAlphaFactor,
      blendDst: OneMinusSrcAlphaFactor,
      // depthTest: false,
      depthWrite: false,
      // side: DoubleSide
      side: FrontSide
    }));

    this.text = text;
    this.textHeight = textHeight;
    this.color = color;
    this.baseScale = new Vector3();

    this.fontFace = 'Consolas';
    this.fontSize = 90; // defines text resolution
    this.fontWeight = 'normal';

    this.canvas = document.createElement('canvas');
    this.texture = map;
    this.texture.minFilter = LinearFilter;

    this.genCanvas();
  }

  public setText (text: string): void {
    this.text = text;
    this.genCanvas();
  }

  public setHeight (height: number): void {
    this.textHeight = height;
    this.genCanvas();
  }

  public setFontFace (face: string): void {
    this.fontFace = face;
    this.genCanvas();
  }

  public setFontSize (size: number): void {
    this.fontSize = size;
    this.genCanvas();
  }

  public setFontWeight (weight: string): void {
    this.fontWeight = weight;
    this.genCanvas();
  }

  public setColor (color: string): void {
    this.color = color;
    this.genCanvas();
  }

  private genCanvas (): void {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const font = `${this.fontWeight} ${this.fontSize}px ${this.fontFace}`;

    ctx.font = font;
    const textWidth = ctx.measureText(this.text).width;
    canvas.width = textWidth;
    canvas.height = this.fontSize;

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = font;
    ctx.fillStyle = this.color;
    ctx.textBaseline = 'bottom';
    ctx.fillText(this.text, 0, canvas.height);

    // Inject canvas into sprite
    this.texture.image = canvas;
    this.texture.needsUpdate = true;

    this.baseScale.set(this.textHeight * canvas.width / canvas.height, this.textHeight, 1);
    this.scale.copy(this.baseScale);
  }

  setResolution (w: number, h: number, zoom: number) {
    this.resize(w, h, zoom);
  }

  resize (_w: number, _h: number, zoom: number) {
    let ratio = 1 / zoom;
    ratio = Math.min(ratio, 25);
    this.scale.copy(this.baseScale.clone().multiplyScalar(ratio));
  }

  dispose () {
    this.texture.dispose();
  }
}
