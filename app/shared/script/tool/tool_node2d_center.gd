@tool

extends Node

var node: Node2D
var control: Control


func _ready() -> void:
	node = get_parent() as Node2D
	control = node.get_parent() as Control

	control.resized.connect(on_size_changed)
	action()


func action() -> void:
	on_size_changed()


func on_size_changed() -> void:
	var size = control.size

	node.position.x = size.x / 2
	node.position.y = size.y / 2
