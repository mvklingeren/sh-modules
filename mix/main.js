// Enhanced materials with dramatic effects
const materials = {
    terrain: {
        type: 'metallic',
        roughness: 0.7,
        metalness: 0.3,
        color: [0.4, 0.6, 0.45],
        emission: 0.2,
        vertexShader: 'defaultVertexShader',
        fragmentShader: 'defaultFragmentShader'
    },
    crystalGold: {
        type: 'metallic',
        roughness: 0.1,
        metalness: 1.0,
        color: [1.0, 0.9, 0.4],
        emission: 0.4
    },
    crystalGlass: {
        type: 'glass',
        roughness: 0.1,
        metalness: 0.9,
        color: [0.4, 0.9, 1.0],
        alpha: 0.4,
        emission: 0.6
    },
    water: {
        type: 'glass',
        roughness: 0.05,
        metalness: 0.9,
        color: [0.2, 0.5, 1.0],
        alpha: 0.7,
        emission: 0.3
    },
    energyCore: {
        type: 'emissive',
        roughness: 0.2,
        metalness: 1.0,
        emission: 2.0,
        color: [1.0, 0.4, 0.8]
    },
    sky: {
        type: 'emissive',
        roughness: 0.0,
        metalness: 0.0,
        emission: 1.0,
        color: [1.0, 1.0, 1.0],
        depthWrite: false,
        depthTest: false,
        cullFace: 'front',
        vertexShader: 'skyVertexShader',
        fragmentShader: 'skyFragmentShader'
    }
};

// Create terrain with more dramatic height variation
function createTerrain(x, z, width, depth) {
    console.log("Creating terrain with params:", { x, z, width, depth });
    GameAPI.scene.createObject('terrain', 'main-terrain', {
        width: width,
        depth: depth,
        resolution: 128,
        position: [x, -50, z],
        options: {
            heightScale: 120.0,
            smoothness: 1.2,
            seed: Math.random() * 10000
        },
        material: materials.terrain
    });
}

// Create crystal formation with mixed materials
function createCrystalFormation(x, y, z, scale = 1.0) {
    const baseHeight = 8 * scale;
    const crystalCount = 7 + Math.floor(Math.random() * 5);

    // Create central energy core
    GameAPI.scene.createObject('sphere', `energy-core-${x}-${z}`, {
        radius: scale * 2,
        segments: 32,
        position: [x, y + 2, z],
        material: materials.energyCore
    });

    for (let i = 0; i < crystalCount; i++) {
        const angle = (i / crystalCount) * Math.PI * 2;
        const radius = (3 + Math.random() * 3) * scale;
        const height = (baseHeight + Math.random() * baseHeight) * scale;

        const px = x + Math.cos(angle) * radius;
        const pz = z + Math.sin(angle) * radius;
        const py = y + Math.random() * 3;

        // Alternate between gold and glass crystals
        const material = i % 2 === 0 ? materials.crystalGold : materials.crystalGlass;

        GameAPI.scene.createObject('cone', `crystal-${x}-${z}-${i}`, {
            radius: 0.8 * scale,
            height: height,
            segments: 8,
            position: [px, py, pz],
            rotation: [
                Math.random() * 0.4,
                angle,
                0.3 + Math.random() * 0.3
            ],
            material: {
                ...material,
                color: i % 2 === 0
                    ? [1.0, 0.7 + Math.random() * 0.3, 0.2] // Gold variations
                    : [0.3, 0.7 + Math.random() * 0.3, 1.0] // Glass variations
            }
        });
    }
}

// Create larger water body with effects
function createWaterSurface(x, y, z, width, depth) {
    GameAPI.scene.createObject('plane', 'water-surface', {
        width: width,
        height: depth,
        widthSegments: 64,
        heightSegments: 64,
        position: [x, y, z],
        material: materials.water
    });
}

// Add sky creation function
function createSky(radius) {
// GameAPI.scene.createObject('sphere', 'sky-sphere', {
//     radius: radius,
//     segments: 64,
//     position: [0, 0, 0],
//     invertNormals: true,
//     material: {
//         ...materials.sky,
//         program: 'sky',
//         cullFace: 'front',
//         depthTest: false,
//         depthWrite: false,
//         emission: 1.0,
//         color: [1.0, 1.0, 1.0]
//     }
// });
}

// Add at the top with other state variables
let lastTargetTime = 0;
const TARGET_COOLDOWN = 1000; // 1 second cooldown
let isPathActive = true; // Add this flag to control the path system

function startNewFlightPath() {
    if (!isPathActive) return;

    const currentTime = performance.now();

    // Check if enough time has passed since last target
    if (currentTime - lastTargetTime < TARGET_COOLDOWN) {
        console.log('Skipping new target - cooldown active');
        setTimeout(startNewFlightPath, TARGET_COOLDOWN);
        return;
    }

    const radius = 150 + Math.random() * 50;
    const height = 40 + Math.random() * 30;
    const angle = Math.random() * Math.PI * 2;

    const targetPos = [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
    ];

    lastTargetTime = currentTime;

    // GameAPI.camera.setTarget(
    //     targetPos,
    //     [-0.3 + Math.random() * 0.2, angle + Math.PI, 0],
    //     'quadratic',
    //     15000
    // );

    // Set up the next target callback
    // GameAPI.camera.setNearingTargetEndCallback(() => {
    //     if (isPathActive) {
    //         setTimeout(() => {
    //             console.log('Starting new flight path...');
    //             startNewFlightPath();
    //         }, 100);
    //     }
    // });
}

exports.init = function (api) {
    GameAPI.debug('Initializing Enhanced Terrain Demo...');

    // Create scene objects first
    const worldSize = 800;
    createTerrain(-worldSize / 2, -worldSize / 2, worldSize, worldSize);
    createWaterSurface(0, -15, 0, worldSize * 0.4, worldSize * 0.4);

    // Create crystal formations
    const crystalFormations = 20;
    for (let i = 0; i < crystalFormations; i++) {
        const angle = (i / crystalFormations) * Math.PI * 2;
        const radius = 100 + Math.random() * 60;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 0;
        createCrystalFormation(x, y, z, 2 + Math.random() * 2);
    }

    // Don't set camera position here - let fps-camera module handle it
    isPathActive = false;
};

exports.update = function (event) {
    const time = event.time;

    // Update shader uniforms
    GameAPI.scene.setUniform('uTime', time);

    // Update sky-specific uniforms if needed
    GameAPI.scene.setUniform('uTime_sky-sphere', time);  // Per-object uniform

    // Dynamic lighting with warmer colors and movement
    const lightIntensity = 1.2 + Math.sin(time * 0.5) * 0.3;
    const lightX = Math.cos(time * 0.2) * 100;
    const lightY = 80 + Math.sin(time * 0.3) * 20;
    const lightZ = Math.sin(time * 0.2) * 100;

    GameAPI.scene.setUniform('uLightPosition', [lightX, lightY, lightZ]);
    GameAPI.scene.setUniform('uLightColor', [
        lightIntensity * 1.6,
        lightIntensity * 1.4,
        lightIntensity * 1.2
    ]);

    // Animate crystal and core emissions with more intensity
    const crystals = Object.keys(GameAPI.scene).filter(id =>
        id.startsWith('crystal-') || id.startsWith('energy-core-')
    );

    crystals.forEach((id, index) => {
        const isCore = id.startsWith('energy-core-');
        const baseEmission = isCore ? 2.0 : 0.6;
        const emission = baseEmission + Math.sin(time * (isCore ? 4 : 2) + index * 0.1) * 0.5;
        GameAPI.scene.setUniform(`uEmission_${id}`, emission);
    });

    // Animate water surface with more reflectivity
    GameAPI.scene.setUniform('uMetalness_water-surface',
        0.9 + Math.sin(time * 0.5) * 0.1
    );

    // Dynamic sky color - brighter and more varied
    const r = 0.4 + Math.sin(time * 0.1) * 0.1;
    const g = 0.5 + Math.sin(time * 0.15) * 0.1;
    const b = 0.6 + Math.sin(time * 0.2) * 0.1;
    GameAPI.scene.setClearColor(r, g, b);

    // Update material properties for more dynamic effects
    crystals.forEach((id, index) => {
        if (id.includes('crystal-')) {
            const isGold = index % 2 === 0;
            if (isGold) {
                // Animate gold metalness
                GameAPI.scene.setUniform(`uMetalness_${id}`,
                    0.9 + Math.sin(time * 2 + index) * 0.1
                );
            } else {
                // Animate glass alpha
                GameAPI.scene.setUniform(`uAlpha_${id}`,
                    0.4 + Math.sin(time * 3 + index) * 0.2
                );
            }
        }
    });
};

// Optional: Add cleanup if needed
function cleanup() {
    isPathActive = false;
}