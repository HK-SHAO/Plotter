extends Node

@export var polygon2D: Polygon2D


func _ready() -> void:
	action(polygon2D.polygon)


func action(polygon: PackedVector2Array) -> void:
	# 设置窗口形状
	DisplayServer.window_set_mouse_passthrough(polygon)
