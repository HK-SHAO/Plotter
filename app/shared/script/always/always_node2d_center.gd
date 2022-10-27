extends Node

var node: Node2D
var parent: Control


func _ready() -> void:
	node = get_parent() as Node2D
	parent = node.get_parent() as Control

	parent.resized.connect(on_size_changed)
	action()


func action() -> void:
	on_size_changed()


func on_size_changed() -> void:
	var size = parent.size

	node.position.x = size.x / 2
	node.position.y = size.y / 2
