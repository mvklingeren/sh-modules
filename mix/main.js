// Enhanced materials with more vibrant colors
const materials = {
    grass: {
        type: 'plastic',
        demo: true,
        roughness: 0.9,
        metalness: 1.0,
        color: [0.4, 0.8, 0.3],
        diffuseMap: 'grass_diffuse'  // Keep only this texture reference
    },
    dirt: {
        type: 'plastic',
        roughness: 0.95,
        metalness: 0.0,
        color: [0.6, 0.4, 0.2],
        diffuseMap: 'dirt_diffuse'
    },
    stone: {
        type: 'metallic',
        roughness: 0.7,
        metalness: 0.3,
        color: [0.6, 0.6, 0.6],
        diffuseMap: 'stone_diffuse'
    },
    water: {
        type: 'glass',
        roughness: 0.1,
        metalness: 0.3,
        color: [0.2, 0.5, 0.9],
        alpha: 0.8
    },
    crystal: {
        type: 'glass',
        roughness: 0.1,
        metalness: 0.9,
        color: [1.0, 0.2, 0.8],
        alpha: 0.7
    },
    rainbow: {
        type: 'emissive',
        roughness: 0.3,
        metalness: 0.8,
        emission: 0.5,
        color: [1.0, 0.3, 0.7]
    },
    gold: {
        type: 'metallic',
        roughness: 0.2,
        metalness: 1.0,
        color: [1.0, 0.8, 0.0]
    }
};

// Tree color variations
const treeColors = [
    { wood: [0.7, 0.3, 0.5], leaves: [1.0, 0.4, 0.7] }, // Pink tree
    { wood: [0.3, 0.5, 0.7], leaves: [0.4, 0.7, 1.0] }, // Blue tree
    { wood: [0.8, 0.4, 0.0], leaves: [1.0, 0.8, 0.2] }, // Golden tree
    { wood: [0.5, 0.2, 0.8], leaves: [0.8, 0.4, 1.0] }, // Purple tree
];

function noise2D(x, z) {
    return (Math.sin(x * 0.1) + Math.sin(z * 0.1)) * 0.5;
}

function noise2DOctaves(x, z, octaves) {
    let result = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
        result += noise2D(x * frequency, z * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }

    return result / maxValue;
}

function createMagicalTree(x, y, z, colorScheme) {
    const treeHeight = 4 + Math.floor(Math.random() * 3);

    // Twisty trunk
    for (let i = 0; i < treeHeight; i++) {
        const twist = Math.sin(i * 0.8) * 0.3;
        const scale = 1.0 - (i / treeHeight) * 0.3;
        GameAPI.scene.createObject('cylinder', `trunk-${x}-${y + i}-${z}`, {
            radius: 0.15 * scale,
            height: 1.0,
            segments: 8,
            position: [x + twist, y + i, z + twist],
            material: {
                type: 'wood',
                roughness: 0.8,
                metalness: 0.2,
                color: colorScheme.wood
            }
        });
    }

    // Magical leaves using different shapes
    const shapes = ['sphere', 'torus', 'box'];
    let leafCount = 0;

    for (let ly = 0; ly < 3; ly++) {
        const radius = 2 - ly * 0.5;
        const angleStep = (Math.PI * 2) / (6 + ly * 2);

        for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
            const lx = Math.cos(angle) * radius;
            const lz = Math.sin(angle) * radius;
            const shape = shapes[leafCount % shapes.length];

            GameAPI.scene.createObject(shape, `leaves-${x}-${y + treeHeight + ly}-${z}-${leafCount}`, {
                radius: 0.3 + Math.random() * 0.2,
                width: 0.6,
                height: 0.6,
                depth: 0.6,
                tubeRadius: 0.1,
                position: [x + lx, y + treeHeight + ly, z + lz],
                material: {
                    type: 'plastic',
                    roughness: 0.6,
                    metalness: 0.3,
                    emission: 0.2,
                    color: colorScheme.leaves
                }
            });
            leafCount++;
        }
    }
}

function createRainbow(startX, startY, startZ, length) {
    const segments = 40;
    const radius = 0.6;

    for (let i = 0; i < segments; i++) {
        const t = i / segments;
        const angle = t * Math.PI;
        const height = Math.sin(angle) * length;
        const depth = Math.cos(angle) * length;

        GameAPI.scene.createObject('torus', `rainbow-${startX}-${startY}-${startZ}-${i}`, {
            radius: radius * (1 - t * 0.5),
            tubeRadius: 0.05,
            radialSegments: 16,
            tubularSegments: 8,
            position: [startX, startY + height, startZ + depth],
            material: {
                ...materials.rainbow,
                color: [
                    Math.sin(t * Math.PI * 2) * 0.5 + 0.5,
                    Math.sin(t * Math.PI * 2 + Math.PI * 2 / 3) * 0.5 + 0.5,
                    Math.sin(t * Math.PI * 2 + Math.PI * 4 / 3) * 0.5 + 0.5
                ]
            }
        });
    }
}

function createCrystalCluster(x, y, z) {
    const crystalCount = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < crystalCount; i++) {
        const angle = (i / crystalCount) * Math.PI * 2;
        const radius = 0.3 + Math.random() * 0.2;
        const height = 1.0 + Math.random() * 1.0;
        const offsetX = Math.cos(angle) * 0.3;
        const offsetZ = Math.sin(angle) * 0.3;

        GameAPI.scene.createObject('cone', `crystal-${x}-${y}-${z}-${i}`, {
            radius: radius,
            height: height,
            segments: 6,
            position: [x + offsetX, y, z + offsetZ],
            material: {
                ...materials.crystal,
                color: [
                    0.7 + Math.random() * 0.3,
                    0.2 + Math.random() * 0.3,
                    0.5 + Math.random() * 0.5
                ]
            }
        });
    }
}

const WORLD_SIZE = 2048;
let cameraState = {
    position: [0, 0, 0],
    direction: 0,
    pitch: -0.3,
    roll: 0,
    turnTimer: 0,
    verticalTimer: 0,
    isInitializing: true,
    targetHeight: 120,
    verticalDirection: 0
};

// Move getTerrainHeight outside of init
function getTerrainHeight(x, z) {
    const terrainPosition = [-WORLD_SIZE / 2, -10, -WORLD_SIZE / 2];
    // Convert from world coordinates to local terrain coordinates
    const localX = x - terrainPosition[0];
    const localZ = z - terrainPosition[2];
    return (noise2DOctaves(localX * 0.02, localZ * 0.02, 4) * 20.0) + terrainPosition[1];
}

function startNewFlightPath() {
    const currentPos = GameAPI.camera.getPosition();
    const currentRot = GameAPI.camera.getRotation();

    // Calculate next target using current rotation for more natural paths
    const targetDistance = 150 + Math.random() * 200;
    const targetAngle = currentRot[1] + (Math.random() - 0.5) * Math.PI * 0.5;
    const targetHeight = 40 + Math.random() * 30;

    const targetX = currentPos[0] + Math.cos(targetAngle) * targetDistance;
    const targetZ = currentPos[2] + Math.sin(targetAngle) * targetDistance;

    // Handle world wrapping
    const halfSize = WORLD_SIZE;
    const wrappedX = ((targetX + halfSize) % WORLD_SIZE) - halfSize;
    const wrappedZ = ((targetZ + halfSize) % WORLD_SIZE) - halfSize;

    const targetPosition = [wrappedX, targetHeight, wrappedZ];
    const targetRotation = [-0.2 + Math.random() * 0.1, targetAngle, 0];

    GameAPI.camera.setTarget(
        targetPosition,
        targetRotation,
        'quadratic',  // This matches the enum value
        8000
    );
}

exports.init = function (api) {
    GameAPI.debug('Initializing magical voxel world...');

    const terrainPosition = [-WORLD_SIZE / 2, -10, -WORLD_SIZE / 2];

    // Create the terrain first
    GameAPI.scene.createObject('terrain', 'main-terrain', {
        width: WORLD_SIZE,
        depth: WORLD_SIZE,
        resolution: 100,
        position: terrainPosition,
        options: {
            heightScale: 20.0,
            smoothness: 2.0,
            seed: Math.random() * 10000
        },
        material: {
            ...materials.grass,
            roughness: 0.8,
            metalness: 0.1,
            color: [0.3, 0.7, 0.3]
        }
    });

    // Calculate center of terrain in world space
    const terrainCenterX = terrainPosition[0] + WORLD_SIZE / 2;
    const terrainCenterZ = terrainPosition[2] + WORLD_SIZE / 2;

    // Add decorative elements on the terrain
    for (let i = 0; i < 20; i++) {
        // Calculate world coordinates directly
        const worldX = terrainPosition[0] + Math.random() * WORLD_SIZE;
        const worldZ = terrainPosition[2] + Math.random() * WORLD_SIZE;

        // Get the actual height at this point
        const worldY = getTerrainHeight(worldX, worldZ);

        if (Math.random() < 0.5) {
            const colorScheme = treeColors[Math.floor(Math.random() * treeColors.length)];
            createMagicalTree(worldX, worldY, worldZ, colorScheme);
        } else {
            createCrystalCluster(worldX, worldY, worldZ);
        }
    }

    // Adjust rainbow positions
    for (let i = 0; i < 3; i++) {
        const worldX = terrainPosition[0] + Math.random() * WORLD_SIZE;
        const worldZ = terrainPosition[2] + Math.random() * WORLD_SIZE;
        const baseHeight = getTerrainHeight(worldX, worldZ);
        const y = baseHeight + 30; // Position rainbows 30 units above terrain
        createRainbow(worldX, y, worldZ, 5 + Math.random() * 5);
    }

    // Start at a lower height
    cameraState.position[1] = 60;
    cameraState.targetHeight = 60;

    // Set up the callback for planning the next path
    GameAPI.camera.setNearingTargetEndCallback(() => {
        console.log('Planning next path...'); // Add debug logging
        startNewFlightPath();
    });

    startNewFlightPath();
};

exports.update = function (event) {
    const time = event.time;
    const deltaTime = event.deltaTime;

    // Create a subtle shifting background color
    const r = 0.529 + Math.sin(time * 0.5) * 0.1;
    const g = 0.808 + Math.sin(time * 0.3) * 0.1;
    const b = 0.922 + Math.sin(time * 0.7) * 0.1;
    GameAPI.scene.setClearColor(r, g, b);


    // Animate crystals
    const crystalBlocks = Object.keys(GameAPI.scene).filter(id => id.startsWith('crystal-'));
    crystalBlocks.forEach(id => {
        const [_, x, y, z, index] = id.split('-').map(Number);
        const rotationSpeed = 0.5 + (index % 3) * 0.2;
        GameAPI.scene.setRotation(id,
            time * rotationSpeed,
            time * rotationSpeed * 0.7,
            time * rotationSpeed * 0.3
        );
    });

    // Animate rainbow elements
    const rainbowParts = Object.keys(GameAPI.scene).filter(id => id.startsWith('rainbow-'));
    rainbowParts.forEach(id => {
        const [_, x, y, z, index] = id.split('-').map(Number);
        const t = (time + index * 0.1) % 1;
        GameAPI.scene.setUniform('uEmission', Math.sin(time * 2 + index) * 0.3 + 0.7);
    });
};