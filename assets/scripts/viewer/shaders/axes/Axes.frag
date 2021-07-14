precision mediump float;
precision mediump int;

varying vec3 vColor;
varying vec3 vNormal;

void main() {
  float d = 1.0 - abs(dot(normalize(vNormal), vec3(0, 0, 1)));
  gl_FragColor = vec4(vColor, d);
}