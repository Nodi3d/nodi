
uniform vec3 bmin, bmax, bsize;
uniform float width, height, depth;
uniform float iwidth, iheight, idepth;

#include <frep_common>

float scene(vec3 p) {
  return SCENE_CODE;
}

void main() {
  vec2 iresol = vec2(1.0, 1.0) / resolution.xy;
  vec2 uv = gl_FragCoord.xy / resolution.xy; // 0.0 ~ 1.0
  float u = uv.x * width * height;
  float nx = mod(u, width) * iwidth;
  float ny = floor(u * iwidth) * iheight;
  float nz = uv.y; // 0.0 ~ 1.0
  vec3 p = vec3(nx, ny, nz) * bsize + bmin;

  float d = scene(p);

  const float eps = 1e-2;
  if (
    nx <= eps || 1.0 - eps <= nx ||
    ny <= eps || 1.0 - eps <= ny ||
    nz <= eps || 1.0 - eps <= nz
  ) {
    // TODO: generate inverted value for boundary
    // float nd = mix(-d + 0.5, d + 0.5, step(d, 0.0));
    float nd = d + 0.5;
    if (d < 0.0) {
      nd = -d + 0.5;
    }
    nd = clamp(nd, 0.0, 1.0);
    gl_FragColor = vec4(nd, nd, nd, nd);
  } else {
    float nd = d + 0.5;
    nd = clamp(nd, 0.0, 1.0);
    gl_FragColor = vec4(nd, nd, nd, nd);
  }
  // gl_FragColor = vec4(uv, 1, 1);
  // gl_FragColor = vec4(1, 1, 1, 1);
}