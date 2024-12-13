// Test Module with extensive debug logging

exports.init = function (api) {
    GameAPI.debug('🚀 Module initialization starting');

    // Test camera API
    GameAPI.debug('📷 Setting up camera...');
    GameAPI.camera.setPosition(0, 10, 15);
    GameAPI.debug(`Camera position set: ${GameAPI.camera.getPosition()}`);

    GameAPI.camera.lookAt(0, 0, 0);
    GameAPI.debug('Camera looking at origin');

    // Test scene creation API
    GameAPI.debug('🎮 Creating scene objects...');

    // Create central sphere
    GameAPI.scene.createObject('sphere', 'central-sphere', {
        radius: 2,
        segments: 32
    });
    GameAPI.debug('Created central sphere');

    // Create orbital objects
    const orbiterCount = 4;
    for (let i = 0; i < orbiterCount; i++) {
        const id = `orbiter - ${i} `;
        GameAPI.scene.createObject('box', id, {
            width: 1,
            height: 1,
            depth: 1
        });
        GameAPI.debug(`Created orbiter: ${id}`);
    }

    // Create ground plane
    GameAPI.scene.createObject('plane', 'ground', {
        width: 20,
        height: 20
    });
    GameAPI.debug('Created ground plane');

    // Set up initial transforms
    GameAPI.scene.setPosition('ground', 0, -3, 0);
    GameAPI.debug('Positioned ground plane');

    // Test uniform state management
    GameAPI.debug('💡 Setting up lighting uniforms...');
    GameAPI.setState('uLightPosition', [5, 5, 5]);
    GameAPI.setState('uLightColor', [1, 1, 1]);
    GameAPI.setState('uObjectColor', [0.7, 0.3, 0.9]);
    GameAPI.debug('Initial uniforms set');

    // Test math utils
    GameAPI.debug('🔢 Testing math utilities...');
    const testAngle = GameAPI.math.deg2rad(45);
    GameAPI.debug(`45 degrees in radians: ${testAngle}`);

    // Test vector utils
    GameAPI.debug('➡️ Testing vector utilities...');
    const vec1 = [1, 0, 0];
    const vec2 = [0, 1, 0];
    const crossProduct = GameAPI.vector.cross(vec1, vec2);
    GameAPI.debug(`Cross product test: ${crossProduct} `);

    GameAPI.debug('✅ Module initialization complete');
};

// Update loop with debug logging
exports.update = function (event) {
    const { time, deltaTime } = event;

    // Log performance every 5 seconds
    if (Math.floor(time) % 5 === 0 && Math.floor(time) !== Math.floor(time - deltaTime)) {
        GameAPI.debug(`📊 Performance - FPS: ${(1 / deltaTime).toFixed(1)}, Time: ${time.toFixed(2)}`);
    }

    // Update central sphere rotation
    GameAPI.scene.setRotation('central-sphere', time * 0.2, time * 0.3, time * 0.1);

    // Update orbiters
    for (let i = 0; i < 4; i++) {
        const id = `orbiter - ${i}`;
        const angle = time * 0.5 + (i * Math.PI / 2);
        const radius = 5;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(time * 2 + i) * 1.5;

        GameAPI.scene.setPosition(id, x, y, z);
        GameAPI.scene.setRotation(id, time, time * 0.7, time * 0.5);
    }

    // Animate light position
    const lightX = Math.cos(time * 0.3) * 8;
    const lightZ = Math.sin(time * 0.3) * 8;
    const lightY = 5 + Math.sin(time * 0.5) * 2;

    GameAPI.setState('uLightPosition', [lightX, lightY, lightZ]);
};

// Input handling with debug logging
exports.input = function (event) {
    const { type } = event;

    switch (type) {
        case 'mousedown':
            GameAPI.debug(`🖱️ Mouse down at: ${event.x}, ${event.y} `);
            break;

        case 'mouseup':
            GameAPI.debug(`🖱️ Mouse up at: ${event.x}, ${event.y} `);
            break;

        case 'mousemove':
            if (event.buttons > 0) {
                GameAPI.debug(`🖱️ Mouse drag - movement: ${event.movementX}, ${event.movementY}`);
            }
            break;

        case 'keydown':
            GameAPI.debug(`⌨️ Key pressed: ${event.key}`);

            // Test camera movement on key press
            switch (event.code) {
                case 'KeyW':
                    GameAPI.camera.moveForward(1);
                    GameAPI.debug('Camera moved forward');
                    break;
                case 'KeyS':
                    GameAPI.camera.moveForward(-1);
                    GameAPI.debug('Camera moved backward');
                    break;
                case 'KeyA':
                    GameAPI.camera.moveRight(-1);
                    GameAPI.debug('Camera moved left');
                    break;
                case 'KeyD':
                    GameAPI.camera.moveRight(1);
                    GameAPI.debug('Camera moved right');
                    break;
            }
            break;
    }
};