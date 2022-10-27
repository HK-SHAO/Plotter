extends Node


func _ready() -> void:
	action()


func action() -> void:
	# 透明此节点对应视图的背景
	get_tree().root.transparent = true
	get_viewport().transparent_bg = true
