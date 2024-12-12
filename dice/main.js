const diceId = 'dice';
const rotationSpeed = 1.0;

// Initialize scene and camera
console.log("[Dice Module] Starting initialization...");
// Create the dice cube
GameAPI.scene.createObject('box', diceId, {
    width: 2,
    height: 2,
    depth: 2
});

// Position it slightly back from origin
GameAPI.scene.setPosition(diceId, 0, 0, -5);

// Set up camera with debug logging
console.log("[Dice Module] Setting camera position...");
GameAPI.camera.setPosition(0, 0, 10);
GameAPI.camera.lookAt(0, 0, -5); // Look at where we placed the dice

// Verify camera position
const camState = GameAPI.camera.getState();
console.log("[Dice Module] Camera state:", {
    position: camState.position,
    target: [0, 0, -5],
    actualPosition: Array.from(camState.position)
});

// Set initial light position
GameAPI.setState('uLightPosition', [5, 5, 5]);
GameAPI.setState('uLightColor', [1, 1, 1]);
GameAPI.setState('uObjectColor', [0.5, 0.5, 1.0]);
console.log("[Dice Module] Initialization complete!");

// Message event handler
self.addEventListener('message', function (e) {
    const { type } = e.data;

    switch (type) {
        case 'update':
            const { time } = e.data;

    // Rotate the dice
            GameAPI.scene.setRotation(
                diceId,
                time * rotationSpeed, // X rotation
                time * rotationSpeed * 0.7, // Y rotation
                time * rotationSpeed * 0.5  // Z rotation
            );

            // Move light in a circle
            const lightX = Math.cos(time) * 5;
            const lightZ = Math.sin(time) * 5;
            const lightY = 5;
            GameAPI.setState('uLightPosition', [lightX, lightY, lightZ]);
            break;

        case 'dispose':
            GameAPI.scene.destroyObject(diceId);
            console.log("[Dice Module] Disposed");
            break;
    }
});