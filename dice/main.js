let diceId = 'dice';
let rotationSpeed = 1.0;

exports.init = function (api) {
    console.log("[Dice Module] Initializing...");

    // Create the dice cube
    api.scene.createObject('box', diceId, {
        width: 2,
        height: 2,
        depth: 2
    });

    // Position it at the center and log
    api.scene.setPosition(diceId, 0, 0, 0);
    console.log("[Dice Module] Dice position set:", {
        id: diceId,
        position: [0, 0, 0],
        size: [2, 2, 2]
    });

    // Set up camera and log
    api.camera.setPosition(0, 0, 10);
    api.camera.lookAt(0, 0, 0);
    console.log("[Dice Module] Camera configured:", {
        position: [0, 0, 10],
        lookingAt: [0, 0, 0]
    });

    // Store API reference for update
    this.api = api;

    console.log("[Dice Module] Initialized!");
};

exports.update = function (event) {
    const { time } = event;

    // Use the stored API reference
    const api = this.api;

    if (!api) {
        console.error("[Dice Module] API not available in update!");
        return;
    }

    // Rotate the dice
    api.scene.setRotation(
        diceId,
        time * rotationSpeed,        // X rotation
        time * rotationSpeed * 0.7,  // Y rotation
        time * rotationSpeed * 0.5   // Z rotation
    );

    // Move light in a circle
    const lightX = Math.cos(time) * 5;
    const lightZ = Math.sin(time) * 5;
    const lightY = 5;
    api.setState('uLightPosition', [lightX, lightY, lightZ]);

    // Debug log every few seconds
    if (Math.floor(time) % 5 === 0) {
        console.log("[Dice Module] Update state:", {
            time,
            rotation: [
                time * rotationSpeed,
                time * rotationSpeed * 0.7,
                time * rotationSpeed * 0.5
            ],
            lightPosition: [lightX, lightY, lightZ]
        });
    }
};

exports.dispose = function () {
    if (this.api) {
        this.api.scene.destroyObject(diceId);
        console.log("[Dice Module] Disposed");
    }
};