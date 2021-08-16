const wasm = import('@/wasm/marching-cubes/pkg');

/* eslint-disable @typescript-eslint/no-explicit-any */
const ctx: Worker = self as any;

ctx.addEventListener('message', async (e) => {
  const { MarchingCubes } = await wasm;

  const { buffer, resolution }: {
    buffer: Uint8Array;
    resolution: number;
  } = e.data;

  const mc = MarchingCubes.new();
  mc.set_volume(buffer, resolution, resolution, resolution);
  const triangles = mc.marching_cubes(0.5);
  const array = new Float32Array(triangles);
  ctx.postMessage({
    triangles: array
  }, [array.buffer]);
});

export default self as any;
