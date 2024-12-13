exports.init = function (api) {
    GameAPI.debug('🚀 Starting simplified test');

    // Set up camera closer to origin
    GameAPI.camera.setPosition(0, 5, 10);
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

    // Simple rotation around Y axis
    GameAPI.scene.setRotation('test-cube', 0, time, 0);

    // Move up and down
    const y = Math.sin(time) * 2;
    GameAPI.scene.setPosition('test-cube', 0, y, 0);

    if (Math.floor(time) % 2 === 0) {
        GameAPI.debug(`Cube position: [0, ${y.toFixed(2)}, 0]`);
    }
};