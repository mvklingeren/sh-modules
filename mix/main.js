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
    const segments = 20;
    const radius = 0.2;

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

const WORLD_SIZE = 128; // Increased for better terrain visualization
const WATER_LEVEL = 1;

exports.init = function (api) {
    GameAPI.debug('Initializing magical voxel world...');

    const terrainPosition = [-WORLD_SIZE / 2, -2, -WORLD_SIZE / 2];

    // First create the terrain
    GameAPI.scene.createObject('terrain', 'main-terrain', {
        width: WORLD_SIZE,
        depth: WORLD_SIZE,
        resolution: 100,
        position: terrainPosition,
        options: {
            heightScale: 8.0,
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

    // Set initial camera position and rotation to match the working values
    // GameAPI.camera.setPosition(
    //     terrainCenterX,
    //     340,
    //     terrainCenterZ
    // );

    GameAPI.camera.setRotation(
        -0.028, // pitch
        -0.6848, // yaw
        0 // roll
    );

    // Add decorative elements on the terrain - adjusted positions to account for terrain offset
    for (let i = 0; i < 20; i++) {
        // Calculate position relative to terrain
        const localX = Math.random() * WORLD_SIZE;
        const localZ = Math.random() * WORLD_SIZE;

        // Sample height from noise function using local coordinates
        const heightAtPoint = noise2DOctaves(localX, localZ, 4) * 8;

        // Convert to world coordinates by adding terrain offset
        const worldX = localX + terrainPosition[0];
        const worldZ = localZ + terrainPosition[2];
        const worldY = heightAtPoint - terrainPosition[1]; // Adjust for terrain Y offset

        if (Math.random() < 0.5) {
            const colorScheme = treeColors[Math.floor(Math.random() * treeColors.length)];
            createMagicalTree(worldX, worldY, worldZ, colorScheme);
        } else {
            createCrystalCluster(worldX, worldY, worldZ);
        }
    }

    // Adjust rainbow positions as well
    for (let i = 0; i < 3; i++) {
        const localX = Math.random() * WORLD_SIZE;
        const localZ = Math.random() * WORLD_SIZE;
        const worldX = localX + terrainPosition[0];
        const worldZ = localZ + terrainPosition[2];
        const y = 15; // Increased height to be well above terrain
        createRainbow(worldX, y, worldZ, 5 + Math.random() * 5);
    }
    //GameAPI.camera.loo

    // Animate to a slightly closer view while maintaining the same angle
    GameAPI.camera.setTarget(
        [
            terrainCenterX - 100,
            65,  // Slightly lower
            terrainCenterZ + 50  // Slightly closer
        ],
        [-0.028, -2.6848, 0],  // Keep the same rotation
        {
            movementType: 'cubic',
            duration: 2000
        }
    );
};

exports.update = function (event) {
    const time = event.time;

    // Create a subtle shifting background color
    const r = 0.529 + Math.sin(time * 0.5) * 0.1;
    const g = 0.808 + Math.sin(time * 0.3) * 0.1;
    const b = 0.922 + Math.sin(time * 0.7) * 0.1;
    GameAPI.scene.setClearColor(r, g, b);

    // Animate water plane
    const waterHeight = WATER_LEVEL + Math.sin(time) * 0.1;
    GameAPI.scene.setPosition('water-plane', -WORLD_SIZE / 2, waterHeight, -WORLD_SIZE / 2);

    // Animate water
    const waterBlocks = Object.keys(GameAPI.scene).filter(id => id.startsWith('water-'));
    waterBlocks.forEach(id => {
        const [_, x, y, z] = id.split('-').map(Number);
        const offset = Math.sin(time * 2 + x * 0.5 + z * 0.5) * 0.05;
        GameAPI.scene.setScale(id, 1, 1 + offset, 1);
    });

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