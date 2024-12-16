// Camera control settings
const MOVE_SPEED = 10.0;
const LOOK_SPEED = 0.002;
const INITIAL_POSITION = [0, 2, 5];

// State
let keys = {};
let pitch = 0;
let yaw = -Math.PI / 2; // Start looking along negative z-axis

// Cached vectors for camera orientation
let forward = [0, 0, -1];
let right = [1, 0, 0];
let up = [0, 1, 0];

function updateCameraVectors() {
    // Calculate forward vector
    forward = [
        Math.sin(yaw) * Math.cos(pitch),
        -Math.sin(pitch),
        Math.cos(yaw) * Math.cos(pitch)
    ];

    // Calculate right vector - cross product of world up and forward
    right = GameAPI.vector.normalize(
        GameAPI.vector.cross([0, 1, 0], forward)
    );

    // Calculate camera up vector - cross product of forward and right
    up = GameAPI.vector.normalize(
        GameAPI.vector.cross(forward, right)
    );

    // Update camera transform with all vectors
    GameAPI.camera.setTransform({
        rotation: [pitch, yaw, 0],
        forward: forward,
        right: right,
        up: up
    });
}

exports.init = function (api) {
    GameAPI.debug("FPS Camera initializing...");

    // Set initial camera position and update vectors
    GameAPI.camera.setPosition(INITIAL_POSITION[0], INITIAL_POSITION[1], INITIAL_POSITION[2]);
    updateCameraVectors();

    GameAPI.addEventListener('input', (data) => {
        if (!data.event) {
            GameAPI.debug("Invalid input data received:", data);
            return;
        }

        const inputEvent = data.event;

        if (inputEvent.type === 'mousemove') {
            if (typeof inputEvent.movementX === 'number' &&
                typeof inputEvent.movementY === 'number') {

        // Update yaw (left/right rotation)
                yaw -= inputEvent.movementX * LOOK_SPEED;

                // Update pitch (up/down rotation) with clamping
                pitch -= inputEvent.movementY * LOOK_SPEED;
                pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch));

                // Update all camera vectors based on new rotation
                updateCameraVectors();
            }
        } else if (inputEvent.type === 'keydown') {
            keys[inputEvent.code] = true;
        } else if (inputEvent.type === 'keyup') {
            keys[inputEvent.code] = false;
        }
    });

    GameAPI.debug("FPS Camera initialization complete");
};

exports.update = function (event) {
    const deltaTime = event.deltaTime;
    const pos = GameAPI.camera.getPosition();

    if (!Array.isArray(pos) || pos.some(isNaN)) {
        GameAPI.debug("Invalid camera position detected");
        return;
    }

    let dx = 0, dy = 0, dz = 0;
    const moveAmount = MOVE_SPEED * deltaTime;

    // Handle keyboard movement using cached vectors
    if (keys['KeyW']) {
        const movement = GameAPI.vector.multiply(forward, moveAmount);
        dx += movement[0];
        dy += movement[1];
        dz += movement[2];
    }
    if (keys['KeyS']) {
        const movement = GameAPI.vector.multiply(forward, -moveAmount);
        dx += movement[0];
        dy += movement[1];
        dz += movement[2];
    }
    if (keys['KeyD']) {
        const movement = GameAPI.vector.multiply(right, moveAmount);
        dx += movement[0];
        dy += movement[1];
        dz += movement[2];
    }
    if (keys['KeyA']) {
        const movement = GameAPI.vector.multiply(right, -moveAmount);
        dx += movement[0];
        dy += movement[1];
        dz += movement[2];
    }
    if (keys['KeyQ']) {
        dy += moveAmount; // Direct vertical movement
    }
    if (keys['KeyZ']) {
        dy -= moveAmount; // Direct vertical movement
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