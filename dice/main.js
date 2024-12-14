exports.init = function (api) {
    GameAPI.debug('🚀 Starting simplified test');

    // Set up camera closer to origin
    GameAPI.camera.setPosition(0, 5, 20);
    GameAPI.camera.lookAt(0, 0, 0);

    // Create a single red cube at the origin
    GameAPI.scene.createObject('box', 'test-cube', {
        width: 2,
        height: 2,
        depth: 2
    });

    // Set bright red color
    GameAPI.scene.setUniform('uObjectColor', [1, 0, 0]);
    GameAPI.scene.setUniform('uLightPosition', [0, 5, 5]);
    GameAPI.scene.setUniform('uLightColor', [1, 1, 1]);

    GameAPI.debug('Created test cube');
};

exports.update = function (event) {
    const { time } = event;

    // Different rotation speeds for each axis
    const xRotation = time * 0.5;  // Slower rotation on X
    const yRotation = time;        // Original Y rotation speed
    const zRotation = time * 0.75; // Medium rotation on Z

    // Apply rotation on all axes
    GameAPI.scene.setRotation('test-cube', xRotation, yRotation, zRotation);

    // Move up and down with a smaller amplitude
    const y = Math.sin(time) * 1.5;
    GameAPI.scene.setPosition('test-cube', 0, y, 0);

    // Optional debug logging every second
    if (Math.floor(time) % 60 === 0) {
        GameAPI.debug(`Cube rotation: [${xRotation.toFixed(2)}, ${yRotation.toFixed(2)}, ${zRotation.toFixed(2)}]`);
        GameAPI.debug(`Cube position: [0, ${y.toFixed(2)}, 0]`);
    }
};