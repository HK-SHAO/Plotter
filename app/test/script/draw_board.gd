extends Control

@onready var lines: Node = $Lines

var cur_line_2d: Line2D = null
var is_left_pressed = false

func _ready() -> void:
	pass

func _input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		_input_event_mouse_motion(event)
	elif event is InputEventMouseButton:
		_input_event_mouse_button(event)
	elif event is InputEventKey:
		_input_event_key(event)
	pass

func _input_event_mouse_motion(event: InputEventMouseMotion) -> void:
	if is_left_pressed:
		add_point(event.position)
	pass

func _input_event_mouse_button(event: InputEventMouseButton) -> void:
	var is_pressed := event.is_pressed()
	if event.button_index == MOUSE_BUTTON_LEFT:
		is_left_pressed = is_pressed

		if not is_left_pressed:
			# 释放掉当前线条的引用
			cur_line_2d = null
	pass

func _input_event_key(event: InputEventKey) -> void:
	match event.keycode:
		KEY_SPACE:
			for line in lines.get_children():
				line.queue_free()
	pass

func add_line2d() -> Line2D:
	var line2d := Line2D.new()
	lines.add_child(line2d)
	return line2d

func add_point(point: Vector2) -> void:
	if is_instance_valid(cur_line_2d):
		cur_line_2d.add_point(point)
	else:
		cur_line_2d = add_line2d()
	pass
