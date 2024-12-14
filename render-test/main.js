exports.init = function (api) {
    GameAPI.debug('Starting cube grid demo');

    // Set up camera at a position where we might see multiple cubes
    GameAPI.camera.setPosition(15, -25, 15);
    GameAPI.camera.lookAt(0, 0, 0);

    // Create a 5x5x5 grid of cubes
    const spacing = 3; // Space between cubes
    const gridSize = 5; // Number of cubes per dimension
    const offset = (gridSize * spacing) / 2; // Center the grid

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                // Generate unique ID for each cube
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

                // Give each cube a slightly different color based on position
                const r = x / gridSize;
                const g = y / gridSize;
                const b = z / gridSize;
                GameAPI.scene.setUniform('uObjectColor', [r, g, b]);
            }
        }
    }

    // Set up strong lighting
    GameAPI.scene.setUniform('uLightPosition', [20, 20, 20]);
    GameAPI.scene.setUniform('uLightColor', [1, 1, 1]);

    GameAPI.debug('Cube grid created');
};

exports.update = function (event) {
    // Optional: slowly rotate all cubes
    const time = event.time;
    const gridSize = 5;

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                const cubeId = `cube-${x}-${y}-${z}`;

                // Each cube rotates at a slightly different speed
                const rotationSpeed = (x + y + z) / (gridSize * 3);
                GameAPI.scene.setRotation(cubeId, 
                    time * rotationSpeed,
                    time * rotationSpeed * 0.5,
                    time * rotationSpeed * 0.3
                );
            }
        }
    }
};