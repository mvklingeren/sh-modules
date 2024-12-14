exports.init = function (api) {
    // Position light closer to the scene and from a better angle
    GameAPI.scene.setUniform('uLightPosition', [10, 15, 10]);  // Closer, still from above
    GameAPI.scene.setUniform('uLightColor', [1.2, 1.2, 1.2]); // Slightly intense white light
    GameAPI.scene.setUniform('uObjectColor', [0.9, 0.9, 1.0]); // Brighter base color

    GameAPI.debug('Starting cube grid demo with improved lighting');

    // Position camera for better viewing angle
    GameAPI.camera.setPosition(12, 15, 12);
    GameAPI.camera.lookAt(0, 0, 0);

    // Create a 5x5x5 grid of cubes
    const spacing = 3;
    const gridSize = 5;
    const offset = (gridSize * spacing) / 2;

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                const cubeId = `cube-${x}-${y}-${z}`;

                // Create cube
                GameAPI.scene.createObject('box', cubeId, {
                    width: 1,
                    height: 1,
                    depth: 1
                });

                // Position cube in grid
                GameAPI.scene.setPosition(cubeId, 
                    x * spacing - offset,
                    y * spacing - offset,
                    z * spacing - offset
                );

                // Create more vibrant colors with better contrast
                const r = 0.5 + (x / gridSize) * 0.5;  // Range 0.5-1.0
                const g = 0.5 + (y / gridSize) * 0.5;  // Range 0.5-1.0
                const b = 0.5 + (z / gridSize) * 0.5;  // Range 0.5-1.0
                GameAPI.scene.setUniform('uObjectColor', [r, g, b]);
            }
        }
    }

    GameAPI.debug('Cube grid created with enhanced colors');
};

exports.update = function (event) {
    // Slower rotation for better light observation
    const time = event.time * 0.5;
    const gridSize = 5;

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                const cubeId = `cube-${x}-${y}-${z}`;

                // More gentle rotation speeds
                const rotationSpeed = ((x + y + z) / (gridSize * 3)) * 0.3;
                GameAPI.scene.setRotation(cubeId, 
                    time * rotationSpeed,
                    time * rotationSpeed * 0.7,
                    time * rotationSpeed * 0.5
                );
            }
        }
    }
};