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

func _ready() -> void:
	_rotation = rotation

func _input(event: InputEvent):
	if not current:
		return

	if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
		if event is InputEventMouseMotion:
			_rotation.y -= event.relative.x / 1000 * sensitivity
			_rotation.x -= event.relative.y / 1000 * sensitivity
			_rotation.x = clamp(_rotation.x, PI/-2, PI/2)

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

func _process(delta: float) -> void:
	var direction = Vector3(
		float(Input.is_key_pressed(KEY_D)) - float(Input.is_key_pressed(KEY_A)),
		float(Input.is_key_pressed(KEY_E)) - float(Input.is_key_pressed(KEY_Q)),
		float(Input.is_key_pressed(KEY_S)) - float(Input.is_key_pressed(KEY_W))
	).normalized()


	if direction.length() > 0.01:
		_translate = direction * velocity * delta

	_translate -= _translate * delta * smooth
	translate(_translate)

	rotation += (_rotation - rotation) * delta * smooth
