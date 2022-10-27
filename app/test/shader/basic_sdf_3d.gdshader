shader_type canvas_item;

uniform float ratio = 1.0;

#define TMIN 0.1
#define TMAX 20.0
#define RAYMARCH_TIME 128
#define PRECISION 0.001

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float sdf3d(vec3 p) {
	float d = sdSphere(p, 1.0);
	
	return d;
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

    vec3 ro = vec3(2. * cos(TIME), 2.0 * cos(TIME), 2. * sin(TIME));
	
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
	
	vec3 light = vec3(3. * cos(TIME), 1., 3. * sin(TIME - 2.0));
	
	float dif = clamp(dot(normalize(light - p), n), 0., 1.);
	float amb = 0.5 + 0.5 * dot(n, vec3(0., 1., 0.));
	color.rgb = amb * vec3(0.2) + dif * vec3(0.8);
	
	color = sqrt(color);
	return color;
}

vec2 fixedUV(vec2 uv, float r) {
	vec2 p = 2.0*vec2(uv.x, 1.0 - uv.y) - 1.0;
	if (r > 1.0){
		p = vec2(p.x, p.y*r);
	} else {
		p = vec2(p.x/r, p.y);
	}
	return p;
}

void fragment() {
	vec2 uv = fixedUV(UV, ratio);
	vec4 color = vec4(0.0);
	
	color = render(uv);

	COLOR = color;
}
