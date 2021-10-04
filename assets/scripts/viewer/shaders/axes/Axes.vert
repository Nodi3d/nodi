precision mediump float;
precision mediump int;

#ifndef PI
#define PI 3.1415926
#endif

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;

varying vec3 vColor;
varying vec3 vNormal;

void main() {
  vec4 mPosition = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * (viewMatrix * mPosition);

  vColor = color;

  // vec3 normal = vec3(0, 1, 0);
  vNormal = (viewMatrix * vec4((modelMatrix * vec4(normal, 0.0)).xyz, 0.0)).xyz;
}