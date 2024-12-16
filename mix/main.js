// Materials for different block types
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
    wood: {
        type: 'wood',
        roughness: 0.9,
        metalness: 0.1,
        color: [0.4, 0.3, 0.2]
    },
    leaves: {
        type: 'plastic',
        roughness: 0.8,
        metalness: 0.0,
        color: [0.3, 0.7, 0.2]
    }
};

// Noise functions for terrain generation
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

exports.init = function (api) {
    GameAPI.debug('Initializing voxel world...');

    // World generation parameters
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

    // Place blocks based on heightmap
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

            // Place water blocks
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

            // Randomly place trees on grass blocks
            if (height > WATER_LEVEL && Math.random() < 0.05) {
                const treeHeight = 4 + Math.floor(Math.random() * 3);

                // Tree trunk
                for (let y = height + 1; y < height + treeHeight; y++) {
                    GameAPI.scene.createObject('box', `trunk-${x}-${y}-${z}`, {
                        width: 0.3,
                        height: 1,
                        depth: 0.3,
                        position: [x, y, z],
                        material: materials.wood
                    });
                }

                // Tree leaves
                const leafSize = 2;
                for (let lx = -leafSize; lx <= leafSize; lx++) {
                    for (let ly = -leafSize; ly <= leafSize; ly++) {
                        for (let lz = -leafSize; lz <= leafSize; lz++) {
                            if (Math.abs(lx) + Math.abs(ly) + Math.abs(lz) <= leafSize + 1) {
                                GameAPI.scene.createObject('box', `leaves-${x + lx}-${height + treeHeight + ly}-${z + lz}`, {
                                    width: 1,
                                    height: 1,
                                    depth: 1,
                                    position: [x + lx, height + treeHeight + ly, z + lz],
                                    material: materials.leaves
                                });
                            }
                        }
                    }
                }
            }
        }
    }
};

// Add subtle animation to water and leaves
exports.update = function (event) {
    const time = event.time;

    // Wave animation for water blocks
    const waterBlocks = Object.keys(GameAPI.scene).filter(id => id.startsWith('water-'));
    waterBlocks.forEach(id => {
        const [_, x, y, z] = id.split('-').map(Number);
        const offset = Math.sin(time * 2 + x * 0.5 + z * 0.5) * 0.05;
        GameAPI.scene.setScale(id, 1, 1 + offset, 1);
    });

    // Gentle swaying for leaves
    const leafBlocks = Object.keys(GameAPI.scene).filter(id => id.startsWith('leaves-'));
    leafBlocks.forEach(id => {
        const [_, x, y, z] = id.split('-').map(Number);
        const offsetX = Math.sin(time + x * 0.1) * 0.02;
        const offsetZ = Math.cos(time + z * 0.1) * 0.02;
        GameAPI.scene.setRotation(id, offsetX, 0, offsetZ);
    });
};