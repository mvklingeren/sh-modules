let diceId = 'dice';
let rotationSpeed = 1.0;

exports.init = function (api) {
    console.log("Initializing dice module...");

    // Create the dice cube
    api.scene.createObject('box', diceId, {
        width: 2,
        height: 2,
        depth: 2
    });

    // Position it at the center
    api.scene.setPosition(diceId, 0, 0, 0);

    // Set up camera
    api.camera.setPosition(0, 0, 10);
    api.camera.lookAt(0, 0, 0);

    console.log("Dice module initialized!");
};

exports.update = function (event) {
    const { time } = event;

    // Rotate the dice
    GameAPI.scene.setRotation(
        diceId,
        time * rotationSpeed,     // X rotation
        time * rotationSpeed * 0.7, // Y rotation
        time * rotationSpeed * 0.5  // Z rotation
    );

    // Move light in a circle
    const lightX = Math.cos(time) * 5;
    const lightZ = Math.sin(time) * 5;
    const lightY = 5;
    GameAPI.setState('uLightPosition', [lightX, lightY, lightZ]);
};

exports.dispose = function () {
    GameAPI.scene.destroyObject(diceId);
};