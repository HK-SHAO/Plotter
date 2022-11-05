shader_type canvas_item;

void fragment() {
	COLOR = texture(TEXTURE, UV);
	COLOR = vec4(sqrt(COLOR.rgb/COLOR.a), 1.0);
}
