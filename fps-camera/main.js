// Camera control settings
const MOVE_SPEED = 10.0;
const LOOK_SPEED = 0.002;
const INITIAL_POSITION = [0, 2, 5];

// State
let keys = {};
let pitch = 0;
let yaw = 0;
let isPointerLocked = false;

exports.init = function (api) {
    // Set initial camera position
    GameAPI.camera.setPosition(INITIAL_POSITION[0], INITIAL_POSITION[1], INITIAL_POSITION[2]);

    // Setup pointer lock
    const canvas = document.querySelector('canvas');

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === canvas;
    });

    // Mouse movement handler
    document.addEventListener('mousemove', (event) => {
        if (!isPointerLocked) return;

        // Update rotation
        yaw -= event.movementX * LOOK_SPEED;
        pitch -= event.movementY * LOOK_SPEED;

        // Clamp pitch to prevent camera flipping
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

        updateCameraRotation();
    });

    // Key handlers
    document.addEventListener('keydown', (event) => {
        keys[event.code] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.code] = false;
    });
};

function updateCameraRotation() {
    // Convert Euler angles to direction vector
    const cosPitch = Math.cos(pitch);
    const direction = [
        Math.sin(yaw) * cosPitch,
        Math.sin(pitch),
        Math.cos(yaw) * cosPitch
    ];

    // Get current position
    const pos = GameAPI.camera.getPosition();

    // Look at point in direction
    GameAPI.camera.lookAt(
        pos.x + direction[0],
        pos.y + direction[1],
        pos.z + direction[2]
    );
}

exports.update = function (event) {
    if (!isPointerLocked) return;

    const deltaTime = event.deltaTime;
    const pos = GameAPI.camera.getPosition();

    // Calculate forward and right vectors
    const forward = [
        Math.sin(yaw),
        0,
        Math.cos(yaw)
    ];

    const right = [
        Math.cos(yaw),
        0,
        -Math.sin(yaw)
    ];

    // Movement
    let dx = 0, dy = 0, dz = 0;
    const moveAmount = MOVE_SPEED * deltaTime;

    // WASD movement
    if (keys['KeyW']) {
        dx += forward[0] * moveAmount;
        dz += forward[2] * moveAmount;
    }
    if (keys['KeyS']) {
        dx -= forward[0] * moveAmount;
        dz -= forward[2] * moveAmount;
    }
    if (keys['KeyD']) {
        dx += right[0] * moveAmount;
        dz += right[2] * moveAmount;
    }
    if (keys['KeyA']) {
        dx -= right[0] * moveAmount;
        dz -= right[2] * moveAmount;
    }

    // Up/Down movement
    if (keys['Space']) {
        dy += moveAmount;
    }
    if (keys['ShiftLeft']) {
        dy -= moveAmount;
    }

    // Update position
    GameAPI.camera.setPosition(
        pos.x + dx,
        pos.y + dy,
        pos.z + dz
    );
};