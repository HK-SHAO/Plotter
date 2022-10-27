shader_type canvas_item;

uniform float ratio = 1.0;

float sdf(vec2 p) {
	float x = p.x;
	float y = p.y;
	
	return x*x + y*y - (1.0 + sin(TIME)) / 2.0;
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
	
	vec4 color = vec4(0., 0., 0., 0.);
	
	float d= sdf(uv);
	
	color = vec4(0.0, 0.0, 0.0, 1.0);
	color = 1.0 - sign(d) * color;
	color *= 1.0 - exp(-3.0 * abs(d));
	
	const vec4 cyan = vec4(0.0, 1.0, 1.0, 1.0);
	color *= 0.8 + 0.2 * sin(150.0 * abs(d));
	color = mix(color, cyan, smoothstep(.005,.004, abs(d)));

	COLOR = color;
}
