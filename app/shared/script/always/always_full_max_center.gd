extends Node


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	pass # Replace with function body.


func action() -> void:
	var control = get_parent() as Control
	var node = self
