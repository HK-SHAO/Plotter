shader_type canvas_item;

uniform sampler2D backbuffer;

void fragment() {
    vec4 data = texture(TEXTURE, UV);
	vec4 data2 = texture(backbuffer, UV);
	
	COLOR = data;
//	if (TIME > 2.0) {
//		COLOR = data2;
//	}
	// COLOR = abs(data - data2);
	
	COLOR = vec4(sqrt(COLOR.rgb/COLOR.a), 1.0);
}
