shader_type canvas_item;

float sdf(vec2 p) {
	float x = p.x;
	float y = p.y;
	
	return x*x + y*y - (1.0 + sin(TIME)) / 2.0;
}

vec2 fixedUV(vec2 uv, vec2 screenPixelSize) {
	uv.y = 1.0 - uv.y;
	uv = 2.0 * (uv - 0.5);
	return uv;
}

void fragment() {
	vec2 uv = fixedUV(UV, SCREEN_PIXEL_SIZE);
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
