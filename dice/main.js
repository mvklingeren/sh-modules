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

// Set initial light and material properties
GameAPI.setState('uLightPosition', [5, 5, 5]);
GameAPI.setState('uLightColor', [1, 1, 1]);
GameAPI.setState('uObjectColor', [0.5, 0.5, 1.0]);

console.log("[Dice Module] Initialization complete!");

// Message event handler for updates
self.addEventListener('message', function (e) {
    const { type, time, deltaTime } = e.data;

    switch (type) {
        case 'update':
            // Animate the dice rotation
            GameAPI.scene.setRotation(
                diceId,
                time * rotationSpeed,          // X rotation
                time * rotationSpeed * 0.7,    // Y rotation
                time * rotationSpeed * 0.5     // Z rotation
            );

            // Animate light position in a circle
            const radius = 5;
            const lightX = Math.cos(time * 0.5) * radius;
            const lightZ = Math.sin(time * 0.5) * radius;
            const lightY = 5 + Math.sin(time * 0.25) * 2; // Add some up/down movement

            GameAPI.setState('uLightPosition', [lightX, lightY, lightZ]);
            break;

        case 'dispose':
            GameAPI.scene.destroyObject(diceId);
            console.log("[Dice Module] Disposed");
            break;
    }
});