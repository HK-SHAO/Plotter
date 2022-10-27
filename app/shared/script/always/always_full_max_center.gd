extends Node

var node: Control
var parent: Control


func _ready() -> void:
	node = get_parent() as Control
	parent = node.get_parent() as Control

	parent.resized.connect(on_size_changed)
	action()


func action() -> void:
	on_size_changed()


func on_size_changed() -> void:
	var size = get_viewport().size
	var node = get_parent() as Control

	var min_size = min(size.x, size.y)
	node.size.x = min_size
	node.size.y = min_size

	node.anchors_preset = Control.PRESET_CENTER
