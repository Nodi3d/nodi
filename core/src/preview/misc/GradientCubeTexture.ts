import { CubeTexture, DataTexture, RGBFormat } from 'three';

export class GradientCubeTexture extends CubeTexture {
  constructor (bottom = '#4488aa', top = '#aaddff', size = 64) {
    super();

    // px, nx, py, ny, pz, nz
    this.images[0] = this.create(top, bottom, size);
    this.images[1] = this.create(top, bottom, size);
    this.images[2] = this.create(top, top, size);
    this.images[3] = this.create(bottom, bottom, size);
    this.images[4] = this.create(top, bottom, size);
    this.images[5] = this.create(top, bottom, size);
    this.needsUpdate = true;
  }

  create (color0: string, color1: string, size: number) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    // create vertical linear gradient
    const grad = context.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, color0);
    grad.addColorStop(1, color1);
    context.fillStyle = grad;
    context.fillRect(0, 0, size, size);

    const img = context.getImageData(0, 0, size, size);

    // stride of THREE.DataTexture array is 3
    // Convert stride:4 to stride:3
    const pixels = new Uint8Array(size * size * 3);
    for (let i = 0; i < img.data.length; i += 4) {
      const r = img.data[i];
      const g = img.data[i + 1];
      const b = img.data[i + 2];
      const idx = i / 4 * 3;
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
    }

    // stride = 3
    return new DataTexture(pixels, size, size, RGBFormat);
  }
}
