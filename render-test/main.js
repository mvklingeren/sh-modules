exports.init = function (api) {
    GameAPI.debug('Starting mesh showcase demo');

    // Initial camera setup for overview
    const initialCameraPos = { x: 0, y: 0, z: 40 };
    GameAPI.camera.setPosition(initialCameraPos.x, initialCameraPos.y, initialCameraPos.z);
    GameAPI.camera.lookAt(0, 0, 0);
    exports.initialCameraPos = initialCameraPos;

    // Define different materials
    const materials = {
        metallic: {
            type: 'metallic',
            roughness: 0.2,  // Lower for more specular
            metalness: 1.0,  // Full metalness
            color: [0.9, 0.9, 0.95],
            alpha: 0.3
        },
        plastic: {
            type: 'plastic',
            roughness: 0.3,  // Lower for more gloss
            metalness: 0.0,
            color: [0.9, 0.2, 0.2]
        },
        glass: {
            type: 'glass',
            roughness: 0.05, // Very smooth
            metalness: 0.2,  // Slight metallic look
            color: [0.3, 0.8, 0.9],
            alpha: 0.5
        },
        wood: {
            type: 'wood',
            roughness: 0.7,  // Reduced from 0.9
            metalness: 0.1,  // Slight sheen
            color: [0.6, 0.3, 0.1]
        },
        emissive: {
            type: 'emissive',
            roughness: 0.4,  // Add some surface detail
            metalness: 0.2,  // Slight metallic quality
            emission: 1.0,
            color: [1.0, 0.6, 0.0]
        }
    };

    // Create showcase objects
    const showcases = [
        { type: 'box', options: { width: 2, height: 2, depth: 2 }, material: materials.metallic },
        { type: 'sphere', options: { radius: 1.2, segments: 32 }, material: materials.glass },
        { type: 'cylinder', options: { radius: 1, height: 2.5, segments: 32 }, material: materials.plastic },
        { type: 'cone', options: { radius: 1.2, height: 2.5, segments: 32 }, material: materials.wood },
        { type: 'torus', options: { radius: 1.2, tubeRadius: 0.4, radialSegments: 32, tubularSegments: 24 }, material: materials.emissive },
        // { type: 'plane', options: { width: 2, height: 2 }, material: materials.metallic }
    ];

    // Calculate grid layout
    const spacing = 5;
    const itemsPerRow = 3;
    const rows = Math.ceil(showcases.length / itemsPerRow);
    const totalWidth = (itemsPerRow - 1) * spacing;
    const totalDepth = (rows - 1) * spacing;
    const startX = -totalWidth / 2;
    const startZ = -totalDepth / 2;

    // Store initial positions for animation
    exports.objectPositions = {};

    // Create objects in grid
    showcases.forEach((showcase, index) => {
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;
        const x = startX + col * spacing;
        const z = startZ + row * spacing;

        const id = `showcase-${showcase.type}-${index}`;
        GameAPI.scene.createObject(showcase.type, id, {
            ...showcase.options,
            position: [x, 0, z],
            material: showcase.material
        });

        // Store initial position for animation
        exports.objectPositions[id] = { x, y: 0, z };
    });

    // Create ground plane for reflections
    GameAPI.scene.createObject('plane', 'ground', {
        width: 30,
        height: 30,
        position: [0, -3, 0],
        material: {
            type: 'metallic',
            roughness: 0.05,
            metalness: 1.0,
            color: [0.15, 0.15, 0.15]
        }
    });
};

exports.update = function (event) {
    const time = event.time * 0.5;

    // Animate each showcase object
    Object.entries(exports.objectPositions).forEach(([id, basePos]) => {
        const index = parseInt(id.split('-').pop());
        const rotationSpeed = 0.5 + index * 0.2;
        const bounceHeight = Math.sin(time * 2 + index) * 0.5;

        // Update position with bounce
        GameAPI.scene.setPosition(id,
            basePos.x,
            basePos.y + bounceHeight,
            basePos.z
        );

        // Update rotation
        GameAPI.scene.setRotation(id,
            time * rotationSpeed,
            time * rotationSpeed * 0.7,
            time * rotationSpeed * 0.3
        );
    });

    // Orbit camera
    const cameraRadius = 33;
    const cameraHeight = 20 + Math.sin(time * 0.5) * 5;
    const cameraX = Math.sin(time * 0.2) * cameraRadius;
    const cameraZ = Math.cos(time * 0.2) * cameraRadius;

    // GameAPI.camera.setPosition(cameraX, cameraHeight, cameraZ);
    // GameAPI.camera.lookAt(0, 0, 0);
};