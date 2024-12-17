// Enhanced materials with more vibrant colors
const materials = {
    grass: {
        type: 'plastic',
        roughness: 0.9,
        metalness: 0.0,
        color: [0.4, 0.8, 0.3]
    },
    dirt: {
        type: 'plastic',
        roughness: 0.95,
        metalness: 0.0,
        color: [0.6, 0.4, 0.2]
    },
    stone: {
        type: 'metallic',
        roughness: 0.7,
        metalness: 0.3,
        color: [0.6, 0.6, 0.6]
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

exports.init = function (api) {
    GameAPI.debug('Initializing magical voxel world...');

    const WORLD_SIZE = 32;
    const WATER_LEVEL = 2;

    // Set initial camera position for overview
    GameAPI.camera.setPosition(WORLD_SIZE / 2, WORLD_SIZE * 0.8, WORLD_SIZE * 1.2);
    GameAPI.camera.lookAt(WORLD_SIZE / 2, 0, WORLD_SIZE / 2);

    // Generate terrain heightmap
    const heightmap = [];
    for (let x = 0; x < WORLD_SIZE; x++) {
        heightmap[x] = [];
        for (let z = 0; z < WORLD_SIZE; z++) {
            let height = Math.floor(
                (noise2DOctaves(x, z, 4) + 1) * 4 + 
                Math.abs(noise2D(x * 2, z * 2)) * 2
            );
            heightmap[x][z] = height;
        }
    }

    // Place terrain and features
    for (let x = 0; x < WORLD_SIZE; x++) {
        for (let z = 0; z < WORLD_SIZE; z++) {
            const height = heightmap[x][z];

            // Place terrain blocks
            for (let y = 0; y <= height; y++) {
                let material;
                if (y === height) {
                    material = height <= WATER_LEVEL + 1 ? materials.dirt : materials.grass;
                } else if (y > height - 3) {
                    material = materials.dirt;
                } else {
                    material = materials.stone;
                }

                GameAPI.scene.createObject('box', `block-${x}-${y}-${z}`, {
                    width: 1,
                    height: 1,
                    depth: 1,
                    position: [x, y, z],
                    material: material
                });
            }

            // Place water
            if (height < WATER_LEVEL) {
                for (let y = height + 1; y <= WATER_LEVEL; y++) {
                    GameAPI.scene.createObject('box', `water-${x}-${y}-${z}`, {
                        width: 1,
                        height: 1,
                        depth: 1,
                        position: [x, y, z],
                        material: materials.water
                    });
                }
            }

            // Place magical trees
            if (height > WATER_LEVEL && Math.random() < 0.05) {
                const colorScheme = treeColors[Math.floor(Math.random() * treeColors.length)];
                createMagicalTree(x, height + 1, z, colorScheme);
            }

            // Place crystal clusters
            if (height > WATER_LEVEL && Math.random() < 0.02) {
                createCrystalCluster(x, height + 1, z);
            }
        }
    }

    // Add some rainbows
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * WORLD_SIZE;
        const z = Math.random() * WORLD_SIZE;
        const y = Math.max(...heightmap.map(row => Math.max(...row))) + 2;
        createRainbow(x, y, z, 5 + Math.random() * 5);
    }
};

exports.update = function (event) {
    const time = event.time;

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