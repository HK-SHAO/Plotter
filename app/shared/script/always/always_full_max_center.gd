extends Node


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	get_viewport().size_changed.connect(on_size_changed)


func on_size_changed() -> void:
	var size = get_viewport().size
	var node = get_parent() as Control

	var min_size = min(size.x, size.y)
	node.size.x = min_size
	node.size.y = min_size

	node.anchors_preset = Control.PRESET_CENTER
