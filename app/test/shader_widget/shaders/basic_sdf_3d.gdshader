shader_type canvas_item;

#define TMIN 0.1
#define TMAX 20.0
#define RAYMARCH_TIME 128
#define PRECISION 0.001

float sdBoxFrame( vec3 p, vec3 b, float e )
{
       p = abs(p  )-b;
  vec3 q = abs(p+e)-e;
  return min(min(
      length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
      length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
      length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}

float sdf3d(vec3 p) {
	float d = sdBoxFrame(p, vec3(3.0), 0.5);
	
	return d;
}

vec2 fixedUV(vec2 uv, vec2 screenPixelSize) {
	uv.y = 1.0 - uv.y;
	uv = 2.0 * (uv - 0.5);
	return uv;
}

float rayMarch(in vec3 ro, in vec3 rd) {
    float t = TMIN;
    for(int i = 0; i < RAYMARCH_TIME && t < TMAX; i++) {
        vec3 p = ro + t * rd;
        float d = sdf3d(p);
        if(d < PRECISION) {
            break;
		}
        t += d;
    }
    return t;
}

vec3 calcNormal(in vec3 p) {
    const float h = 0.0001;
    const vec2 k = vec2(1, -1);
    return normalize(k.xyy * sdf3d(p + k.xyy * h) +
        k.yyx * sdf3d(p + k.yyx * h) +
        k.yxy * sdf3d(p + k.yxy * h) +
        k.xxx * sdf3d(p + k.xxx * h));
}

mat3 setCamera(vec3 ta, vec3 ro, float cr) {
    vec3 z = normalize(ta - ro);
    vec3 cp = vec3(sin(cr), cos(cr), 0.);
    vec3 x = normalize(cross(z, cp));
    vec3 y = cross(x, z);
    return mat3(x, y, z);
}

vec4 render(vec2 uv) {
    vec4 color = vec4(1.0);

    vec3 ro = vec3(10. * cos(TIME), 10.0 * sin(TIME), 10. * sin(TIME));
	
	vec3 ta = vec3(0.);
    mat3 cam = setCamera(ta, ro, 0.);
    vec3 rd = normalize(cam * vec3(uv, 1.));
	
    float t = rayMarch(ro, rd);
    if(t >= TMAX) {
		color = vec4(0.0);
		return color;
	}
	
	vec3 p = ro + t * rd;
	vec3 n = calcNormal(p);
	
	vec3 light = vec3(2. * cos(TIME - 2.0), 1., 2. * sin(TIME - 2.0));
	
	float dif = clamp(dot(normalize(light - p), n), 0., 1.);
	float amb = 0.8 + 0.2 * dot(n, vec3(0., 1., 0.));
	color.rgb = amb * vec3(0.2) + dif * vec3(0.8);
	
	color = sqrt(color);
	return color;
}

void fragment() {
	vec2 uv = fixedUV(UV, SCREEN_PIXEL_SIZE);
	vec4 color = vec4(0.0);
	
	color = render(uv);

	COLOR = color;
}
