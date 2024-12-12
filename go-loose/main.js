// Module-scoped variables
let cameraState;
let blocks = [];
let lastUpdate;

const WORLD_SIZE = 16;
const BLOCK_SIZE = 1;
const TOTAL_SIZE = WORLD_SIZE * BLOCK_SIZE;

const CAMERA_SETTINGS = {
    moveSpeed: 5.0,
    mouseSensitivity: 0.002,
    position: [0, 12, 20],
    rotation: [0.6, 0, 0],
};

// Input handlers
const inputHandlers = {
    keydown: (event) => {
        let changed = false;

        switch (event.key.toLowerCase()) {
            case 'w':
                if (cameraState.movement.forward !== 1) {
                    cameraState.movement.forward = 1;
                    changed = true;
                }
                break;
            case 's':
                if (cameraState.movement.forward !== -1) {
                    cameraState.movement.forward = -1;
                    changed = true;
                }
                break;
            case 'a':
                if (cameraState.movement.right !== -1) {
                    cameraState.movement.right = -1;
                    changed = true;
                }
                break;
            case 'd':
                if (cameraState.movement.right !== 1) {
                    cameraState.movement.right = 1;
                    changed = true;
                }
                break;
            case 'z':
                if (cameraState.movement.up !== 1) {
                    cameraState.movement.up = 1;
                    changed = true;
                }
                break;
            case 'x':
                if (cameraState.movement.up !== -1) {
                    cameraState.movement.up = -1;
                    changed = true;
                }
                break;
        }

        if (changed) {
            cameraState.isDirty = true;
        }
    },

    keyup: (event) => {
        let changed = false;

        switch (event.key.toLowerCase()) {
            case 'w':
            case 's':
                if (cameraState.movement.forward !== 0) {
                    cameraState.movement.forward = 0;
                    changed = true;
                }
                break;
            case 'a':
            case 'd':
                if (cameraState.movement.right !== 0) {
                    cameraState.movement.right = 0;
                    changed = true;
                }
                break;
            case 'z':
            case 'x':
                if (cameraState.movement.up !== 0) {
                    cameraState.movement.up = 0;
                    changed = true;
                }
                break;
        }

        if (changed) {
            cameraState.isDirty = true;
        }
    },

    mousemove: (event) => {
        if (typeof event.movementX !== 'number' || typeof event.movementY !== 'number') {
            return;
        }

        const oldRotation = [...cameraState.rotation];
        cameraState.rotation[1] -= event.movementX * CAMERA_SETTINGS.mouseSensitivity;
        cameraState.rotation[0] -= event.movementY * CAMERA_SETTINGS.mouseSensitivity;

        cameraState.rotation[0] = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraState.rotation[0]));

        if (oldRotation[0] !== cameraState.rotation[0] ||
            oldRotation[1] !== cameraState.rotation[1]) {
            cameraState.isDirty = true;

            console.log("Mouse movement processed:", {
                movementX: event.movementX,
                movementY: event.movementY,
                newRotation: [...cameraState.rotation]
            });
        }
    }
};

function noise2D(x, z) {
    return (Math.sin(x * 0.5) * Math.cos(z * 0.5) +
        Math.sin(x * 0.3) * Math.cos(z * 0.7)) * 2;
}

function initializeCamera(api) {
    console.log("Initializing camera with position:", cameraState.position);
    api.camera.setPosition(...cameraState.position);

    const targetX = 0;
    const targetY = 0;
    const targetZ = 0;

    api.camera.lookAt(targetX, targetY, targetZ);
    updateCameraDirection(api, true);

    console.log("Camera initialized:", {
        position: cameraState.position,
        rotation: cameraState.rotation,
        target: [targetX, targetY, targetZ]
    });
}

function updateCameraDirection(api, force = false) {
    if (!force && !cameraState.isDirty) return;

    const pitch = cameraState.rotation[0];
    const yaw = cameraState.rotation[1];

    const lookAtDistance = 10;
    const targetX = cameraState.position[0] + Math.sin(yaw) * Math.cos(pitch) * lookAtDistance;
    const targetY = cameraState.position[1] + Math.sin(pitch) * lookAtDistance;
    const targetZ = cameraState.position[2] + Math.cos(yaw) * Math.cos(pitch) * lookAtDistance;

    console.log("Updating camera direction:", {
        position: [...cameraState.position],
        rotation: [...cameraState.rotation],
        target: [targetX, targetY, targetZ],
        timestamp: performance.now()
    });

    api.camera.lookAt(targetX, targetY, targetZ);
    cameraState.isDirty = false;
}

function createTerrain(api) {
    console.log("Starting terrain generation...");

    for (let x = 0; x < WORLD_SIZE; x++) {
        for (let z = 0; z < WORLD_SIZE; z++) {
            const height = Math.floor(Math.abs(noise2D(x, z))) + 1;

            for (let y = 0; y < height; y++) {
                const blockId = `block_${x}_${y}_${z}`;
                api.scene.createObject('box', blockId, {
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    depth: BLOCK_SIZE
                });

                const posX = (x - WORLD_SIZE / 2) * BLOCK_SIZE;
                const posY = y * BLOCK_SIZE;
                const posZ = (z - WORLD_SIZE / 2) * BLOCK_SIZE;

                api.scene.setPosition(blockId, posX, posY, posZ);

                let blockType = 'dirt';
                if (y === height - 1) blockType = 'grass';
                if (y === 0) blockType = 'stone';

                blocks.push({
                    id: blockId,
                    type: blockType,
                    position: [posX, posY, posZ]
                });

                console.log(`Created block: ${blockId} at position:`, [posX, posY, posZ]);
            }
        }
    }

    console.log(`Terrain generation complete. Created ${blocks.length} blocks.`);
}

// Export init function
exports.init = function (api) {
    console.log("Starting initialization...");

    // Initialize camera state
    cameraState = {
        position: [...CAMERA_SETTINGS.position],
        rotation: [...CAMERA_SETTINGS.rotation],
        movement: {
            forward: 0,
            right: 0,
            up: 0
        },
        mouse: {
            isActive: false,
            lastX: 0,
            lastY: 0
        },
        isDirty: false
    };

    lastUpdate = performance.now();

    // Set up input handlers
    api.addEventListener('keydown', inputHandlers.keydown);
    api.addEventListener('keyup', inputHandlers.keyup);
    api.addEventListener('mousemove', inputHandlers.mousemove);

    // Initialize scene
    initializeCamera(api);
    createTerrain(api);

    console.log("Initialization complete!");
};

// Export update function
exports.update = function (event) {
    const { deltaTime, time } = event;
    const now = performance.now();

    if (now - lastUpdate < 16) return;
    lastUpdate = now;

    let positionChanged = false;

    if (cameraState.movement.forward !== 0 ||
        cameraState.movement.right !== 0 ||
        cameraState.movement.up !== 0) {

        const moveSpeed = CAMERA_SETTINGS.moveSpeed * deltaTime;
        const cosYaw = Math.cos(cameraState.rotation[1]);
        const sinYaw = Math.sin(cameraState.rotation[1]);

        const oldPosition = [...cameraState.position];

        const forward = cameraState.movement.forward * moveSpeed;
        const right = cameraState.movement.right * moveSpeed;
        const up = cameraState.movement.up * moveSpeed;

        cameraState.position[0] += sinYaw * forward + cosYaw * right;
        cameraState.position[2] += cosYaw * forward - sinYaw * right;
        cameraState.position[1] += up;

        positionChanged = oldPosition.some((v, i) => v !== cameraState.position[i]);

        if (positionChanged) {
            console.log("Camera position updated:", {
                position: cameraState.position,
                movement: cameraState.movement,
                timestamp: performance.now()
            });
            GameAPI.camera.setPosition(...cameraState.position);
            cameraState.isDirty = true;
        }
    }

    if (cameraState.isDirty) {
        updateCameraDirection(GameAPI);
    }

    // Update light position
    const lightX = Math.cos(time * 0.2) * 20;
    const lightY = 15 + Math.sin(time * 0.1) * 5;
    const lightZ = Math.sin(time * 0.2) * 20;
    GameAPI.setState('uLightPosition', [lightX, lightY, lightZ]);
    GameAPI.setState('uTime', time);
};

// Export dispose function
exports.dispose = function () {
    blocks.forEach(block => {
        GameAPI.scene.destroyObject(block.id);
    });
    blocks = [];
};