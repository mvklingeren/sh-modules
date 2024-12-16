// Camera control settings
const MOVE_SPEED = 10.0;
const LOOK_SPEED = 0.002;
const INITIAL_POSITION = [0, 2, 5];

// State
let keys = {};
let pitch = 0;
let yaw = 0;

exports.init = function (api) {
    GameAPI.debug("FPS Camera initializing...");

    // Set initial camera position
    GameAPI.camera.setPosition(INITIAL_POSITION[0], INITIAL_POSITION[1], INITIAL_POSITION[2]);

    // Setup input handling
    GameAPI.addEventListener('input', (data) => {
        const inputEvent = data.event;

        switch (inputEvent.type) {
            case 'mousemove':
                yaw -= inputEvent.movementX * LOOK_SPEED;
                pitch -= inputEvent.movementY * LOOK_SPEED;
                pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
                updateCameraRotation();
                break;

            case 'keydown':
                keys[inputEvent.code] = true;
                break;

            case 'keyup':
                keys[inputEvent.code] = false;
                break;
        }
    });
};

function updateCameraRotation() {
    const cosPitch = Math.cos(pitch);
    const direction = [
        Math.sin(yaw) * cosPitch,
        Math.sin(pitch),
        Math.cos(yaw) * cosPitch
    ];

    const pos = GameAPI.camera.getPosition();
    if (Array.isArray(pos)) {
        GameAPI.camera.lookAt(
            pos[0] + direction[0],
            pos[1] + direction[1],
            pos[2] + direction[2]
        );
    }
}

exports.update = function (event) {
    const deltaTime = event.deltaTime;
    const pos = GameAPI.camera.getPosition();

    // Early return if position is invalid
    if (!Array.isArray(pos) || pos.some(isNaN)) {
        GameAPI.debug("Invalid camera position detected");
        return;
    }

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

    // Only update if there's actual movement and calculations are valid
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