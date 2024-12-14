exports.init = function (api) {
    // Basic initialization
    GameAPI.debug('Starting basic cube demo');

    // Set up camera at a fixed position looking at origin
    GameAPI.camera.setPosition(0, 0, 5);
    GameAPI.camera.lookAt(0, 0, 0);

    // Create a simple cube
    GameAPI.scene.createObject('box', 'basic-cube', {
        width: 1,
        height: 1,
        depth: 1
    });

    // Set basic white color and lighting
    GameAPI.scene.setUniform('uObjectColor', [1, 1, 1]);
    GameAPI.scene.setUniform('uLightPosition', [0, 5, 5]);
    GameAPI.scene.setUniform('uLightColor', [1, 1, 1]);

    GameAPI.debug('Basic cube created');
};

exports.update = function (event) {
    // No animation - just static rendering
    GameAPI.scene.setRotation('basic-cube', 0, 0, 0);
    GameAPI.scene.setPosition('basic-cube', 0, 0, 0);
};