precision mediump float;
precision mediump int;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;

attribute vec3 position;
attribute vec3 normal;

varying vec3 vNormal;

#if NUM_CLIPPING_PLANES > 0 && ! defined( STANDARD ) && ! defined( PHONG ) && ! defined( MATCAP )
	varying vec3 vViewPosition;
#endif

void main() {
  vec4 mPosition = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = (viewMatrix * mPosition);
  gl_Position = projectionMatrix * mvPosition;
  vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

#if NUM_CLIPPING_PLANES > 0 && ! defined( STANDARD ) && ! defined( PHONG ) && ! defined( MATCAP )
	vViewPosition = - mvPosition.xyz;
#endif
}