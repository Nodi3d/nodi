
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

float dot2( in vec2 v ) { return dot(v, v); }
float dot2( in vec3 v ) { return dot(v, v); }
float ndot( in vec2 a, in vec2 b ) { return a.x*b.x - a.y*b.y; }

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

float sdSphere(const vec3 p, const float r) {
  return length(p) - r;
}

float sdBox(const vec3 p, const vec3 size) {
  vec3 d = abs(p) - size / 2.0;
  return length(max(d,0.0)) + min(max(d.x,max(d.y,d.z)),0.0);
}

float sdCylinder(const vec3 p, const float radius, const float height) {
  vec2 d = vec2(length(p.xz)-radius, abs(p.y) - height / 2.0);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdCappedCone(vec3 p, float h, float r1, float r2)
{
  vec2 q = vec2(length(p.xz), p.y);
  vec2 k1 = vec2(r2, h);
  vec2 k2 = vec2(r2 - r1, 2.0 * h);
  vec2 ca = vec2(q.x - min(q.x, (q.y < 0.0) ? r1 : r2), abs(q.y) - h);
  vec2 cb = q - k1 + k2*clamp(dot(k1 - q, k2) / dot2(k2), 0.0, 1.0);
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s * sqrt(min(dot2(ca), dot2(cb)));
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r )
{
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

// TPMS functions
// https://github.com/dbt-ethz/Axolotl/blob/master/code/lTMPS.py

float opGyroid(const vec3 p, const float scale, const float thickness, const float bias) {
  vec3 q = p * scale;
  return abs(dot(sin(q), cos(q.zxy)) - bias) / scale - thickness;
}

float opSchwarzP(const vec3 p, const float scale, const float thickness, const float bias) {
  vec3 q = p * scale;
  vec3 c = cos(q);
  return abs((c.x + c.y + c.z) - bias) / scale - thickness;
}

float opDiamond(const vec3 p, const float scale, const float thickness, const float bias) {
  vec3 q = p * scale;
  vec3 s = sin(q);
  vec3 c = cos(q);
  return abs(((s.x * s.y * s.z) + (s.x * c.y * c.z) + (c.x * s.y * c.z) + (c.x * c.y * s.z)) - bias) / scale - thickness;
}

float opFischerKoch(const vec3 p, const float scale, const float thickness, const float bias) {
  vec3 q = p * scale * 0.5;
  vec3 s = sin(q);
  vec3 c = cos(q);
  vec3 c2 = cos(q * 2.0);
  float ht = thickness * 0.5;
  return abs((c2.x * s.y * c.z) + (c2.y * s.z * c.x) + (c2.z * s.x * c.y) - bias) / scale - ht;
}

float opLidinoid(const vec3 p, const float scale, const float thickness, const float bias) {
  vec3 q = p * scale * 0.5;
  vec3 q2 = q * 2.0;
  vec3 s = sin(q);
  vec3 s2 = sin(q2);
  vec3 c = cos(q);
  vec3 c2 = cos(q2);
  float v1 = (0.5 * (s2.x * c.y * s.z + s2.y * c.z * s.y + s2.z * c.x * s.y));
  float v2 = (0.5 * dot(c2.xyz, c2.yzx));
  float ht = thickness * 0.5;
  return abs(v1 - v2 - bias) / scale - ht;
}

float opNeovius(const vec3 p, const float scale, const float thickness, const float bias) {
  vec3 q = p * scale;
  vec3 c = cos(q);
  return abs((3.0 * (c.x + c.y + c.z) + 4.0 * (c.x * c.y * c.z)) - bias) / scale - thickness;
}

float sdRoundBox(const vec3 p, const vec3 b, const float r)
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float sdTorus(const vec3 p, const vec2 t)
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float opOnion(const float sdf, const float thickness)
{
    return abs(sdf) - thickness;
}

float opUnion(const float d1, const float d2) { return min(d1, d2); }
float opDifference(const float d1, const float d2) { return max(d1, -d2); }
float opIntersection(const float d1, const float d2) { return max(d1, d2); }

float opSmoothUnion( float d1, float d2, float k ) {
  float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
  return mix( d2, d1, h ) - k*h*(1.0-h); 
}

float opSmoothDifference( float d1, float d2, float k ) {
  float h = clamp( 0.5 - 0.5*(d1+d2)/k, 0.0, 1.0 );
  return mix( d1, -d2, h ) + k*h*(1.0-h); 
}

float opSmoothIntersection( float d1, float d2, float k ) {
  float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
  return mix( d2, d1, h ) + k*h*(1.0-h); 
}

vec3 opTwist(vec3 p)
{
    const float k = 10.0; // or some other amount
    float c = cos(k*p.y);
    float s = sin(k*p.y);
    mat2 m = mat2(c,-s,s,c);
    vec3 q = vec3(m*p.xz,p.y);
    return q;
}

vec3 opCheapBend(const vec3 p, const float k)
{
    float c = cos(k*p.x);
    float s = sin(k*p.x);
    mat2  m = mat2(c,-s,s,c);
    return vec3(m*p.xy,p.z);
}

vec3 opTx(const in vec3 p, const in mat4 m) {
  vec4 q = m * vec4(p.xyz, 1);
  return q.xyz;
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
