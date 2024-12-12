const diceId = 'dice';
const rotationSpeed = 1.0;

export const init = (api) => {
    console.log("[Dice Module] Starting initialization...");

    // Create the dice cube
    api.scene.createObject('box', diceId, {
        width: 2,
        height: 2,
        depth: 2
    });

    // Position it slightly back from origin
    api.scene.setPosition(diceId, 0, 0, -5);

    // Set up camera with debug logging
    console.log("[Dice Module] Setting camera position...");
    api.camera.setPosition(0, 0, 10);
    api.camera.lookAt(0, 0, -5);  // Look at where we placed the dice

    // Verify camera position
    const camState = api.camera.getState();
    console.log("[Dice Module] Camera state:", {
        position: camState.position,
        target: [0, 0, -5],
        actualPosition: Array.from(camState.position)
    });

    // Set initial light position
    api.setState('uLightPosition', [5, 5, 5]);
    api.setState('uLightColor', [1, 1, 1]);
    api.setState('uObjectColor', [0.5, 0.5, 1.0]);

    console.log("[Dice Module] Initialization complete!");
};

export const update = (event) => {
    const { time, api } = event;

    if (!api) {
        console.error("[Dice Module] No API in update!");
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
};

export const dispose = (api) => {
    if (api) {
        api.scene.destroyObject(diceId);
        console.log("[Dice Module] Disposed");
    }
};