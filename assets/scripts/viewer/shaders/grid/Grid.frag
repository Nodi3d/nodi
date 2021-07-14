precision mediump float;
precision mediump int;

uniform vec3 uColor;
uniform float uOpacity;

varying vec3 vNormal;

void main() {
  if(uOpacity <= 0.0) discard;

  float d = abs(dot(normalize(vNormal), vec3(0, 0, 1)));
  gl_FragColor = vec4(uColor, uOpacity * 0.5 * pow(d, 1.5));
}