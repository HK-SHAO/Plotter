extends Node


func _ready() -> void:
	get_viewport().size_changed.connect(on_size_changed)


func on_size_changed() -> void:
	var size = get_viewport().size
	var node = get_parent() as Node2D

	node.position.x = size.x / 2
	node.position.y = size.y / 2

