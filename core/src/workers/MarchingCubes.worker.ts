const wasm = import('@/wasm/marching-cubes/pkg');

export type MarchingCubesProps = {
  buffer: Float32Array;
  width: number;
  height: number;
  depth: number;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const ctx: Worker = self as any;
ctx.addEventListener('message', async (e) => {
  const { MarchingCubes } = await wasm;

  const { buffer, width, height, depth }: MarchingCubesProps = e.data;

  const mc = MarchingCubes.new();
  mc.set_volume(buffer, width, height, depth);
  const triangles = mc.marching_cubes(0.5);
  const array = new Float32Array(triangles);
  ctx.postMessage({
    triangles: array
  }, [array.buffer]);
  mc.free();
});
export default self as any;
