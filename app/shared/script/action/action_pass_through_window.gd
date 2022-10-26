extends Node

@export var polygon2D: Polygon2D


func _ready() -> void:
	action(polygon2D.polygon)


func action(polygon: PackedVector2Array) -> void:
	DisplayServer.window_set_mouse_passthrough(polygon)
