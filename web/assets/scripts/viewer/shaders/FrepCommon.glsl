
float dot2( const in vec2 v ) { return dot(v, v); }
float dot2( const in vec3 v ) { return dot(v, v); }
float ndot( const in vec2 a, const in vec2 b ) { return a.x*b.x - a.y*b.y; }

float sdSphere(const in vec3 p, const in float r) {
  return length(p) - r;
}

float sdBox(const in vec3 p, const in vec3 size) {
  vec3 d = abs(p) - size / 2.0;
  return length(max(d,0.0)) + min(max(d.x,max(d.y,d.z)),0.0);
}

float sdCylinder(const in vec3 p, const in float radius, const in float height) {
  vec2 d = vec2(length(p.xz)-radius, abs(p.y) - height / 2.0);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdCappedCone(const in vec3 p, const in float h, const in float r1, const in float r2)
{
  vec2 q = vec2(length(p.xz), p.y);
  vec2 k1 = vec2(r2, h);
  vec2 k2 = vec2(r2 - r1, 2.0 * h);
  vec2 ca = vec2(q.x - min(q.x, (q.y < 0.0) ? r1 : r2), abs(q.y) - h);
  vec2 cb = q - k1 + k2*clamp(dot(k1 - q, k2) / dot2(k2), 0.0, 1.0);
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s * sqrt(min(dot2(ca), dot2(cb)));
}

float sdCapsule(const in vec3 p, const in vec3 a, const in vec3 b, const in float r)
{
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

// TPMS functions
// https://github.com/dbt-ethz/Axolotl/blob/master/code/lTMPS.py

float opGyroid(const in vec3 p, const in float scale, const in float thickness, const in float bias) {
  vec3 q = p * scale;
  return abs(dot(sin(q), cos(q.zxy)) - bias) / scale - thickness;
}

float opSchwarzP(const in vec3 p, const in float scale, const in float thickness, const in float bias) {
  vec3 q = p * scale;
  vec3 c = cos(q);
  return abs((c.x + c.y + c.z) - bias) / scale - thickness;
}

float opDiamond(const in vec3 p, const in float scale, const in float thickness, const in float bias) {
  vec3 q = p * scale;
  vec3 s = sin(q);
  vec3 c = cos(q);
  return abs(((s.x * s.y * s.z) + (s.x * c.y * c.z) + (c.x * s.y * c.z) + (c.x * c.y * s.z)) - bias) / scale - thickness;
}

float opFischerKoch(const in vec3 p, const in float scale, const in float thickness, const in float bias) {
  vec3 q = p * scale * 0.5;
  vec3 s = sin(q);
  vec3 c = cos(q);
  vec3 c2 = cos(q * 2.0);
  float ht = thickness * 0.5;
  return abs((c2.x * s.y * c.z) + (c2.y * s.z * c.x) + (c2.z * s.x * c.y) - bias) / scale - ht;
}

float opLidinoid(const in vec3 p, const in float scale, const in float thickness, const in float bias) {
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

float opNeovius(const in vec3 p, const in float scale, const in float thickness, const in float bias) {
  vec3 q = p * scale;
  vec3 c = cos(q);
  return abs((3.0 * (c.x + c.y + c.z) + 4.0 * (c.x * c.y * c.z)) - bias) / scale - thickness;
}

float sdRoundBox(const in vec3 p, const in vec3 b, const in float r)
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float sdTorus(const in vec3 p, const vec2 t)
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float opOnion(const in float sdf, const in float thickness)
{
    return abs(sdf) - thickness;
}

float opUnion(const in float d1, const in float d2) { return min(d1, d2); }
float opDifference(const in float d1, const in float d2) { return max(d1, -d2); }
float opIntersection(const in float d1, const in float d2) { return max(d1, d2); }

float opSmoothUnion(const in float d1, const in float d2, const in float k) {
  float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
  return mix( d2, d1, h ) - k*h*(1.0-h); 
}

float opSmoothDifference(const in float d1, const in float d2, const in float k) {
  float h = clamp( 0.5 - 0.5*(d1+d2)/k, 0.0, 1.0 );
  return mix( d1, -d2, h ) + k*h*(1.0-h); 
}

float opSmoothIntersection(const in float d1, const in float d2, const in float k) {
  float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
  return mix( d2, d1, h ) + k*h*(1.0-h); 
}

vec3 opTwist(const in vec3 p)
{
    const float k = 10.0; // or some other amount
    float c = cos(k*p.y);
    float s = sin(k*p.y);
    mat2 m = mat2(c,-s,s,c);
    vec3 q = vec3(m*p.xz,p.y);
    return q;
}

vec3 opCheapBend(const in vec3 p, const in float k)
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
