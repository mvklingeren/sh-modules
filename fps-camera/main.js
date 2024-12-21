// Camera control settings
const MOVE_SPEED = 10.0;
const LOOK_SPEED = 0.003;
const INITIAL_POSITION = [0, 2, 5];

// State
let keys = {};
let pitch = 0;
let yaw = -Math.PI / 2;
let isMouseDown = false;

// Cached vectors for camera orientation
let forward = [0, 0, -1];
let right = [1, 0, 0];
let up = [0, 1, 0];

function updateCameraVectors() {
    // Calculate forward vector
    forward = [
        Math.cos(pitch) * Math.sin(yaw),
        -Math.sin(pitch),
        Math.cos(pitch) * Math.cos(yaw)
    ];

    // Calculate right vector
    right = GameAPI.vector.normalize(
        GameAPI.vector.cross([0, 1, 0], forward)
    );

    // Calculate up vector
    up = GameAPI.vector.normalize(
        GameAPI.vector.cross(forward, right)
    );

    console.log("FPS Camera: Updating vectors", {
        pitch,
        yaw,
        forward,
        right,
        up,
        position: GameAPI.camera.getPosition()
    });

    // Update camera state
    GameAPI.camera.setState({
        position: GameAPI.camera.getPosition(),
        rotation: [pitch, yaw, 0],
        forward: forward,
        right: right,
        up: up
    });
}

exports.init = function (api) {
    GameAPI.debug("FPS Camera initializing...");
    GameAPI.camera.setPosition(...INITIAL_POSITION);
    updateCameraVectors();

    let isPointerLocked = false;

    // Handle mouse events
    GameAPI.addEventListener('input', (data) => {
        if (!data.event) return;
        const event = data.event;

        switch (event.type) {
            case 'pointerLockChange':
                isPointerLocked = event.locked;
                console.log("FPS Camera: Pointer lock changed:", isPointerLocked);
                break;

            case 'mousemove':
                if (isPointerLocked && event.movementX != null && event.movementY != null) {
                    console.log("FPS Camera: Mouse move received", {
                        movementX: event.movementX,
                        movementY: event.movementY,
                        oldYaw: yaw,
                        oldPitch: pitch
                    });

                    // Flip movement X for more intuitive controls
                    yaw += event.movementX * -LOOK_SPEED;

                    // Update pitch with clamping
                    pitch = Math.max(-Math.PI / 2 + 0.1,
                        Math.min(Math.PI / 2 - 0.1,
                            pitch + event.movementY * -LOOK_SPEED));

                    console.log("FPS Camera: New angles calculated", { yaw, pitch });
                    updateCameraVectors();
                }
                break;

            case 'keydown':
                keys[event.code] = true;
                break;

            case 'keyup':
                keys[event.code] = false;
                break;
        }
    });
};

exports.update = function (event) {
    const deltaTime = event.deltaTime;
    const pos = GameAPI.camera.getPosition();

    // Debug active keys
    if (Object.keys(keys).some(k => keys[k])) {
        console.log("Active keys:", Object.keys(keys).filter(k => keys[k]));
    }

    if (!Array.isArray(pos) || pos.some(isNaN)) {
        GameAPI.debug("Invalid camera position detected");
        return;
    }

    let dx = 0, dy = 0, dz = 0;
    const moveAmount = MOVE_SPEED * deltaTime;

    // Calculate flat forward and right vectors for movement (ignore Y component)
    const flatForward = [forward[0], 0, forward[2]];
    const flatRight = [right[0], 0, right[2]];

    // Normalize the flat vectors to maintain consistent movement speed
    const normalizedFlatForward = GameAPI.vector.normalize(flatForward);
    const normalizedFlatRight = GameAPI.vector.normalize(flatRight);

    // Handle keyboard movement using normalized flat vectors
    if (keys['KeyS']) { // Forward
        const movement = GameAPI.vector.multiply(normalizedFlatForward, -moveAmount);
        dx += movement[0];
        dz += movement[2];
    }
    if (keys['KeyW']) { // Backward
        const movement = GameAPI.vector.multiply(normalizedFlatForward, moveAmount);
        dx += movement[0];
        dz += movement[2];
    }
    if (keys['KeyD']) { // Strafe Left
        const movement = GameAPI.vector.multiply(normalizedFlatRight, -moveAmount);
        dx += movement[0];
        dz += movement[2];
    }
    if (keys['KeyA']) { // Strafe Right
        const movement = GameAPI.vector.multiply(normalizedFlatRight, moveAmount);
        dx += movement[0];
        dz += movement[2];
    }
    if (keys['KeyQ']) { // Up
        dy += moveAmount;
    }
    if (keys['KeyZ']) { // Down
        dy -= moveAmount;
    }

    // Update position if there's any movement
    if ((dx !== 0 || dy !== 0 || dz !== 0) && 
        !isNaN(dx) && !isNaN(dy) && !isNaN(dz) &&
        !isNaN(pos[0]) && !isNaN(pos[1]) && !isNaN(pos[2])) {

        GameAPI.camera.setPosition(
            pos[0] + dx,
            pos[1] + dy,
            pos[2] + dz
        );
    }
};