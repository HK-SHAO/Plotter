extends Node

@export var camera: Camera3D

var material: ShaderMaterial


func _ready() -> void:
	material = get_parent().material


func _process(delta: float) -> void:
	material.set_shader_parameter(
		"camera_position", camera.global_position)

	material.set_shader_parameter(
		"camera_theta", 0.0)
