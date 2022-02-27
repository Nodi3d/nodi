
uniform vec3 bmin, bmax, bsize;
uniform float width, height, depth;
uniform float iwidth, iheight, idepth;
uniform float iU, iV;

#include <frep_common>

// replace to compiled custom function
#include <frep_custom_function>

float scene(vec3 p) {
  return SCENE_CODE;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy; // 0.0 ~ 1.0

  // float nx = mod(uv.x, iwidth) * width;
  // float ny = floor(uv.x * width) * iheight;
  float nx = mod(gl_FragCoord.x, width) * iwidth;
  float ny = floor(gl_FragCoord.x * iwidth) * iheight;
  float nz = uv.y; // 0.0 ~ 1.0
  vec3 p = vec3(nx, ny, nz) * bsize + bmin;

  float d = scene(p);
  float nd = d + 0.5;

  /*
  const float eps = 1e-2;
  if (
    nx <= eps || 1.0 - eps <= nx ||
    ny <= eps || 1.0 - eps <= ny ||
    nz <= eps || 1.0 - eps <= nz
  ) {
    // TODO: generate inverted value for boundary
    // float nd = mix(-d + 0.5, d + 0.5, step(d, 0.0));
    if (d < 0.0) {
      nd = -d + 0.5;
    }
  }
  */

  nd = clamp(nd, 0.0, 1.0);
  gl_FragColor = vec4(nd, nd, nd, nd);
  // gl_FragColor = vec4(p.x, p.y, p.z, 1);
  // gl_FragColor = vec4(uv, 1, 1);
  // gl_FragColor = vec4(1, 1, 1, 1);
}