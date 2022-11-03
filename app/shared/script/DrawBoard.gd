class_name DrawBoard

extends Control

@export var default_line: Line2D

@export_range(0, 2) var smooth: float = 0.5
@export_range(0, 10000) var sensitivity: float = 5000

@onready var lines: Node2D = $Lines


var cur_line_2d: Line2D = null
var is_left_pressed = false

var brush_position: Vector2
var ink_position: Vector2
var point_position: Vector2

func _ready() -> void:
	pass

func _input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		_input_event_mouse_motion(event)
	elif event is InputEventMouseButton:
		_input_event_mouse_button(event)
	elif event is InputEventKey:
		_input_event_key(event)

func _input_event_mouse_motion(event: InputEventMouseMotion) -> void:
	if is_left_pressed:
		brush_position = event.position

func _input_event_mouse_button(event: InputEventMouseButton) -> void:
	var is_pressed := event.is_pressed()
	if event.button_index == MOUSE_BUTTON_LEFT:
		is_left_pressed = is_pressed

		if not is_left_pressed:
			# 释放掉当前线条的引用
			cur_line_2d = null
		else:
			brush_position = event.position
			ink_position = event.position
			point_position = event.position

func _input_event_key(event: InputEventKey) -> void:
	match event.keycode:
		KEY_SPACE:
			# 清空所有线条
			for line in lines.get_children():
				line.queue_free()

func add_line2d() -> Line2D:
	var line2d := default_line.duplicate()		\
			if is_instance_valid(default_line)	\
			else Line2D.new()

	lines.add_child(line2d)
	return line2d

func add_point(point: Vector2) -> void:
	if is_instance_valid(cur_line_2d):
		cur_line_2d.add_point(point)
	else:
		cur_line_2d = add_line2d()

func update_ink(delta: float) -> void:
	var d := brush_position.distance_squared_to(ink_position)
	var s := smooth * sensitivity / (1 + sensitivity + d)

#	var velocity := sqrt(d) / delta
#	print(velocity)
#
#	Curve

	delta /= ((1 - delta) * s + delta) # delta = exp(s * log(delta))
	delta = clamp(delta, 0.01, 1)

	var delta_position := brush_position - ink_position
	ink_position += delta_position * delta

func update_point() -> void:
	var d := ink_position.distance_squared_to(point_position)

	if d > 1:
		add_point(point_position)
		point_position = ink_position

func _process(delta: float) -> void:
	if is_left_pressed:
		update_ink(delta)
		update_point()
