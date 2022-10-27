class_name FreeCamera3D

extends Camera3D

@export_range(0, 10, 0.01) var sensitivity:float = 3
@export_range(0, 1000, 0.1) var velocity:float = 5
@export_range(0, 10, 0.01) var speed_scale:float = 1.17
@export var max_speed:float = 1000
@export var min_speed:float = 0.2
@export_range(0, 100, 0.01) var smooth:float = 10


var _translate: Vector3 = Vector3()
var _rotation: Vector3 = Vector3()
var _tmp_rotation: Vector3 = Vector3()


func _ready() -> void:
	_rotation = rotation
	_tmp_rotation = rotation

func _input(event: InputEvent):
	if not current:
		return

	if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
		if event is InputEventMouseMotion:
			_rotation.y -= event.relative.x / 1000 * sensitivity
			_rotation.x -= event.relative.y / 1000 * sensitivity

	if event is InputEventMouseButton:
		match event.button_index:
			MOUSE_BUTTON_RIGHT:
				if event.pressed:
					Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
				else:
					Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)

			MOUSE_BUTTON_WHEEL_UP: # increase fly velocity
				velocity = clamp(velocity * speed_scale, min_speed, max_speed)
			MOUSE_BUTTON_WHEEL_DOWN: # decrease fly velocity
				velocity = clamp(velocity / speed_scale, min_speed, max_speed)

func set_rotation(rot: Vector3):
	rotation = rot

func _process(delta: float) -> void:
	var direction = Vector3(
		float(Input.get_action_strength("fps_right") - Input.get_action_strength("fps_left")),
		float(Input.get_action_strength("fps_up") - Input.get_action_strength("fps_down")),
		float(Input.get_action_strength("fps_backward") - Input.get_action_strength("fps_forward"))
	).normalized()


	if direction.length() != 0:
		_translate = direction * velocity * delta + _translate * delta * 50
	else:
		_translate -= _translate * delta * smooth
	translate(_translate)

	_tmp_rotation += (_rotation - _tmp_rotation) * delta * smooth * 1.5
	set_rotation(_tmp_rotation)
