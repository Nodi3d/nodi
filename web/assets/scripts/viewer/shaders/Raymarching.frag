
uniform float time;

uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform samplerCube tEnv;

uniform vec2 resolution;
uniform mat4 cameraWorldMatrix;
uniform mat4 cameraProjectionMatrixInverse;

uniform mat4 cameraViewMatrix, cameraProjectionMatrix;

uniform vec3 cameraDirection, cameraUp, cameraRight;
uniform vec2 cameraOrthRect;

uniform vec3 ambient, lightDir;
uniform vec3 defaultColor, selectedColor;
uniform bool isNormal;

varying vec2 vUv;

const float PI = 3.1415926;
const float EPS = 1e-4, NEPS = 1e-5;

const vec4 bg = vec4(1.0, 1.0, 1.0, 1);

uniform float threshold;
uniform float nearClip, farClip;

#include <packing>

// replace to frep.glsl
#include <frep_common>

// replace to compiled custom function
#include <frep_custom_function>

float getDepth(const in vec2 screenPosition ) {
  #if DEPTH_PACKING == 1
  return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
  #else
  return texture2D( tDepth, screenPosition ).x;
  #endif
}

float getViewZ(const in float depth ) {
  #if PERSPECTIVE_CAMERA == 1
  return perspectiveDepthToViewZ( depth, nearClip, farClip );
  #else
  return orthographicDepthToViewZ( depth, nearClip, farClip );
  #endif
}

float dScene(vec3 p) {
  #if EXISTS_SCENE == 1
  SCENE_CODE
  #else
  return sdSphere(p, 1.0);
  #endif
}

float sScene(vec3 p) {
  #if EXISTS_SELECTED_SCENE == 1
  SELECTED_SCENE_CODE
  #else
  return sdSphere(p, 1.0);
  #endif
}

float scene(vec3 p) {
  #if EXISTS_SCENE == 1 && EXISTS_SELECTED_SCENE == 1
  return min(dScene(p), sScene(p));
  #elif EXISTS_SCENE == 1
  return dScene(p);
  #elif EXISTS_SELECTED_SCENE == 1
  return sScene(p);
  #else
  return sdSphere(p, 1.0);
  #endif
}

vec3 getNormal(vec3 p) {
  return normalize(vec3(
    scene(p + vec3(NEPS, 0.0, 0.0)) - scene(p + vec3(-NEPS, 0.0, 0.0)),
    scene(p + vec3(0.0, NEPS, 0.0)) - scene(p + vec3(0.0, -NEPS, 0.0)),
    scene(p + vec3(0.0, 0.0, NEPS)) - scene(p + vec3(0.0, 0.0, -NEPS))
 ));
}

vec3 inverseTransformDirection(in vec3 dir, in mat4 matrix) {
	return normalize((vec4(dir, 0.0) * matrix).xyz);
}

vec4 lighting(in vec3 rayOrigin, in vec3 rayDirection) {
  vec3 normal = getNormal(rayOrigin);
  if (isNormal) {
    return vec4(((normal + 1.0) * 0.5).xyz, 1);
  }

  #if EXISTS_SCENE == 1 && EXISTS_SELECTED_SCENE == 1
  float d0 = dScene(rayOrigin);
  float d1 = sScene(rayOrigin);
  vec3 color = (d0 < d1) ? defaultColor : selectedColor;
  #elif EXISTS_SCENE == 1
  vec3 color = defaultColor;
  #else
  vec3 color = selectedColor;
  #endif

  vec3 worldNormal = inverseTransformDirection(normal, cameraViewMatrix);
  vec3 worldLightDir = inverseTransformDirection(lightDir, cameraViewMatrix);
  float diff = clamp(dot(worldLightDir, worldNormal), 0.0, 1.0);
  vec3 reflectVec = reflect(-rayDirection, worldNormal);
  vec4 env = textureCube(tEnv, normalize(reflectVec.xyz));
  return vec4(clamp(env.xyz * 0.1 + ambient * 0.5 + diff * color, 0.0, 1.0), 1.0);
}

vec3 GetCameraForward()     { return - vec3(cameraViewMatrix[0][2], cameraViewMatrix[1][2], cameraViewMatrix[1][2]);    }
vec3 GetCameraUp()          { return vec3(cameraViewMatrix[0][1], cameraViewMatrix[1][1], cameraViewMatrix[2][1]);     }
vec3 GetCameraRight()       { return vec3(cameraViewMatrix[0][0], cameraViewMatrix[1][0], cameraViewMatrix[2][0]);     }
float GetCameraFocalLength() { return abs(cameraProjectionMatrix[1][1]); }

void GetCameraRay(out vec3 rayOrigin, out vec3 rayDirection) {
#if PERSPECTIVE_CAMERA == 1
  vec2 screenPos = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
  rayOrigin = cameraPosition;
  rayDirection = normalize(
    (cameraRight * screenPos.x) + 
    (cameraUp * screenPos.y) + 
    (cameraDirection * GetCameraFocalLength())
  );
#else
  vec2 screenPos = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.xy;
  rayOrigin = cameraPosition + cameraRight * screenPos.x * cameraOrthRect.x + cameraUp * screenPos.y * cameraOrthRect.y;
  rayDirection = normalize(cameraDirection);
#endif
}

vec3 getCameraRayDirection(vec2 screenPos) {
  vec4 ndcRay = vec4(screenPos.xy, 1.0, 1.0);
  vec3 rayDirection = (cameraWorldMatrix * cameraProjectionMatrixInverse * ndcRay).xyz;
  return normalize(rayDirection);
}

void main() {
  vec3 rayOrigin = vec3(0.);
  vec3 rayDirection = vec3(0.);
  GetCameraRay(rayOrigin, rayDirection);

  bool flag = false;
  vec3 ro = rayOrigin;
  float dist = 0.0;
  float rLen = 0.0;
  for (int i = 0; i < ITERATIONS; i++) {
    dist = scene(rayOrigin);
    rLen += dist;
    rayOrigin = ro + rayDirection * rLen;

    flag = (abs(dist) < threshold);
    if(flag) break;
  }

  // gl_FragColor = texture2D(tDepth, vUv);
  // return;

  vec4 diffuse = texture2D(tDiffuse, vUv);
  if(flag) {
#if DEPTH_TEST == 1
    vec4 raymarched = lighting(rayOrigin, rayDirection);
    float depth = -getViewZ(getDepth(vUv));
    if (rLen <= depth) {
      gl_FragColor = raymarched;
    } else {
      gl_FragColor = mix(raymarched, mix(bg, diffuse, diffuse.a), diffuse.a);
      // gl_FragColor = diffuse;
    }
#else
    gl_FragColor = lighting(rayOrigin, rayDirection);
#endif
  } else {
    gl_FragColor = mix(bg, diffuse, diffuse.a);
  }

  // gl_FragColor = texture2D(tDepth, vUv);
}
