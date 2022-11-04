extends Node

@export var viewport: SubViewport

var material: ShaderMaterial
var textureRect: TextureRect

var image: Image

func _ready() -> void:
	textureRect = get_parent()
	material = textureRect.material


func _process(_delta: float) -> void:

	if (is_instance_valid(image)):
		material.set_shader_parameter(
			"backbuffer", ImageTexture.create_from_image(image))

	image = viewport.get_texture().get_image()
