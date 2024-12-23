// Keep essential debug logging
function debugLog(msg, data) {
    console.log(`[MIX] ${msg}`, data);
    GameAPI.debug(`[MIX] ${msg} ${JSON.stringify(data)}`);
}

// Simplified materials
const materials = {
    terrain: {
        type: 'default',
        color: [1.0, 0.0, 0.0],
        vertexShader: 'defaultVertexShader',
        fragmentShader: 'defaultFragmentShader'
    },
    wood: {
        type: 'wood',
        color: [1.0, 0.0, 0.0]
    }
};

// Keep light configuration
const lightConfig = {
    NUM_LIGHTS: 2,
    lights: [
        { color: [1.0, 0.95, 0.8], intensity: 0.5 },   // Main light (warm white) - halved from 1.0
        { color: [0.3, 0.5, 1.0], intensity: 0.5 },    // Blue accent - halved from 1.0
        { color: [1.0, 0.3, 0.2], intensity: 0.5 },    // Red accent - halved from 1.0
        { color: [0.2, 1.0, 0.3], intensity: 0.5 }     // Green accent - halved from 1.0
    ]
};

// Add shadow uniforms and texture at the top
const SHADOW_MAP_SIZE = 1024;
const shadowConfig = {
    mapSize: SHADOW_MAP_SIZE,
    camera: {
        left: -20,
        right: 20,
        top: 20,
        bottom: -20,
        near: 1,
        far: 50
    }
};

// Simplified plane shaders
const planeShaders = {
    vertex: `
        precision highp float;
        
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;

        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying float vWave;

        void main() {
            vNormal = normalize(mat3(modelViewMatrix) * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            vUv = uv;

            // Create a simple wave effect
            float wave = sin(position.x * 0.5 + uTime) * cos(position.z * 0.5 + uTime) * 0.5;
            vec3 pos = position;
            pos.y += wave;
            vWave = wave;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragment: `
        precision highp float;

        uniform float uTime;
        uniform vec3 uPointLightPos;
        uniform vec3 uPointLightColor;
        uniform float uPointLightIntensity;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying float vWave;

        void main() {
            // Base color from gradient
            vec3 color1 = vec3(0.1, 0.3, 0.5);  // Deep blue
            vec3 color2 = vec3(0.2, 0.5, 0.7);  // Light blue
            vec3 baseColor = mix(color1, color2, vUv.y + vWave);

            // Point light calculations
            vec3 lightDir = normalize(uPointLightPos - vPosition);
            vec3 normal = normalize(vNormal);

            // Calculate distance with quadratic attenuation
            float distance = length(uPointLightPos - vPosition);
            float attenuation = 1.0 / (1.0 + 0.045 * distance + 0.0075 * distance * distance);

            // Calculate diffuse lighting with increased intensity
            float diff = max(dot(normal, lightDir), 0.0);
            vec3 diffuse = uPointLightColor * diff * (uPointLightIntensity) * attenuation;

            // Add stronger ambient light
            vec3 ambient = vec3(0.3);  // Increased from 0.2 to 0.3

            // Combine lighting with base color
            vec3 finalColor = baseColor * (diffuse + ambient);

            // Add slight gamma correction for better visual results
            finalColor = pow(finalColor, vec3(0.9));

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};

// Add cube shaders after planeShaders
const cubeShaders = {
    vertex: `
        precision highp float;
        
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;
        
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
            vNormal = normalize(mat3(modelViewMatrix) * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragment: `
        precision highp float;
        
        uniform vec3 uObjectColor;
        uniform float uTime;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
            vec3 normal = normalize(vNormal);
            
            // Animated color
            vec3 color = vec3(0.6 + 0.4 * sin(uTime), 0.4, 0.8);
            
            // Simple lighting
            vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
            float diff = max(dot(normal, lightDir), 0.0);
            
            gl_FragColor = vec4(color * diff, 1.0);
        }
    `
};

// Simplified terrain creation
function createTerrain(x, y, z, width, depth) {
    debugLog("Creating terrain with params:", { x, y, z, width, depth });

    GameAPI.scene.createObject('plane', 'main-terrain', {
        width: width,
        height: depth,
        widthSegments: 32,
        heightSegments: 32,
        position: [0, -15, 0],
        rotation: [0, 0, 0],
        material: {
            type: 'shader',
            vertexShader: planeShaders.vertex,
            fragmentShader: planeShaders.fragment,
            color: [0.3, 0.7, 0.3],
            wireframe: false,
            depthTest: true,
            depthWrite: true
        }
    });
}

// Add cube creation function
function createCube(x, y, z, size) {
    debugLog("Creating cube with params:", { x, y, z, size });

    GameAPI.scene.createObject('box', 'floating-cube', {
        width: size,
        height: size,
        depth: size,
        position: [x, y, z],
        material: {
            type: 'shader',
            vertexShader: cubeShaders.vertex,
            fragmentShader: cubeShaders.fragment,
            color: [0.6, 0.4, 0.8],
            wireframe: false,
            depthTest: true,
            depthWrite: true
        }
    });
}

// Modify createSphereGrid function
function createSphereGrid(rows, cols, spacing, height) {
    debugLog("Creating sphere grid:", { rows, cols, spacing, height });

    const startX = -(cols * spacing) / 2;
    const startZ = -(rows * spacing) / 2;
    const levels = 4;  // Number of vertical levels
    const levelSpacing = spacing;  // Same spacing for vertical levels

    // Create parent sphere first
    const parentId = 'sphere-parent';
    GameAPI.scene.createObject('sphere', parentId, {
        radius: 3.5,
        segments: 32,
        position: [0, height, 0],
        material: {
            type: 'default',
            color: [1.0, 0.8, 0.6],  // Give parent a distinct color
            roughness: 0.3
        }
    });

    // Create child spheres in a cubic grid
    for (let level = 0; level < levels; level++) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Skip the center position at the base level
                if (level === 0 &&
                    row === Math.floor(rows / 2) &&
                    col === Math.floor(cols / 2)) continue;

                const relativeX = startX + col * spacing;
                const relativeZ = startZ + row * spacing;
                const relativeY = level * levelSpacing;  // Even spacing between levels

                // Create unique ID for each sphere
                const sphereId = `sphere-${level}-${row}-${col}`;

                GameAPI.scene.createObject('sphere', sphereId, {
                    radius: 3.5,
                    segments: 32,
                    position: [relativeX, relativeY, relativeZ],
                    material: {
                        type: 'default',
                        color: [
                            0.5 + Math.sin(level / levels) * 0.5,  // Vary red based on level
                            0.5 + Math.sin(row / rows) * 0.5,      // Vary green based on row
                            0.5 + Math.cos(col / cols) * 0.5       // Vary blue based on column
                        ],
                        roughness: 0.3
                    }
                });

                // Set parent relationship
                GameAPI.scene.setParent(sphereId, parentId);
            }
        }
    }

    debugLog("Sphere grid created with parent-child relationships");
}

// Modify initializeLight function
function initializeLight() {
    // Create visual representation first (this will be the parent)
    GameAPI.scene.createObject('sphere', 'moving-light-sphere', {
        radius: 0.5,
        segments: 16,
        position: [0, 20, 0],
        material: {
            type: 'emissive',
            color: [1, 0.95, 0.8],
            emission: 2.0,
            roughness: 0
        }
    });

    // Create the light with position at origin since it will inherit parent's position
    GameAPI.light.createPointLight('moving-light', {
        position: [0, 0, 0],
        color: [1.0, 0.95, 0.8],
        intensity: 5,
        radius: 50
    });

    // Set the light as child of the sphere
    GameAPI.scene.setParent('moving-light', 'moving-light-sphere');
}

// Essential event listeners
GameAPI.addEventListener('sceneObjectCreated', (event) => {
    debugLog("Scene object created:", {
        objectId: event.objectId,
        success: event.success,
        error: event.error
    });
});

GameAPI.addEventListener('error', (event) => {
    debugLog("Error event received:", event);
});

// Add terrain shaders with grass effect
const terrainShaders = {
    vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;
        
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying float vIsTop;
        
        void main() {
            vNormal = normalize(mat3(modelViewMatrix) * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            vUv = uv;
            vIsTop = normal.y > 0.9 ? 1.0 : 0.0; // Check if face is top
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragment: `
        precision highp float;
        
        uniform vec3 uPointLightPos;
        uniform vec3 uPointLightColor;
        uniform float uPointLightIntensity;
        uniform float uTime;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying float vIsTop;
        
        // Noise function for grass variation
        float rand(vec2 co) {
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }
        
        void main() {
            // Base colors
            vec3 dirtColor = vec3(0.45, 0.3, 0.2);
            vec3 grassColor = vec3(0.2, 0.6, 0.2);
            
            // Add some noise to grass
            float noise = rand(vUv + uTime * 0.1);
            grassColor += vec3(noise * 0.1);
            
            // Mix colors based on whether it's top face
            vec3 baseColor = mix(dirtColor, grassColor, vIsTop);
            
            // Lighting calculations
            vec3 lightDir = normalize(uPointLightPos - vPosition);
            vec3 normal = normalize(vNormal);
            
            float diff = max(dot(normal, lightDir), 0.0);
            vec3 diffuse = uPointLightColor * diff * (uPointLightIntensity * 0.5); // Halved intensity multiplier
            
            // Reduce ambient light
            vec3 ambient = vec3(0.15); // Halved from 0.3
            
            // Final color
            vec3 finalColor = baseColor * (diffuse + ambient);
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};

// Modify rainbow shader
const rainbowShaders = {
    vertex: `
        precision highp float;
        attribute vec3 position;
        
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        
        varying vec3 vPosition;
        
        void main() {
            vPosition = position; // Pass the local position to fragment shader
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragment: `
        precision highp float;
        
        varying vec3 vPosition;

        void main() {
            // Simple static rainbow based on position
            vec3 color = vec3(1.0, 0.0, 0.0); // Start with red

            // Calculate normalized position from center
            float dist = length(vPosition);
            float angle = atan(vPosition.y, vPosition.x);

            // Create rainbow bands
            if (dist > 0.2) { // Skip center point
                if (angle < -2.0) {
                    color = vec3(1.0, 0.0, 0.0); // Red
                } else if (angle < -1.0) {
                    color = vec3(1.0, 0.5, 0.0); // Orange
                } else if (angle < 0.0) {
                    color = vec3(1.0, 1.0, 0.0); // Yellow
                } else if (angle < 1.0) {
                    color = vec3(0.0, 1.0, 0.0); // Green
                } else if (angle < 2.0) {
                    color = vec3(0.0, 0.0, 1.0); // Blue
                } else {
                    color = vec3(0.5, 0.0, 1.0); // Purple
                }
            }

            gl_FragColor = vec4(color, 1.0);
        }
    `
};

// Add creature creation function
function createCreature(x, y, z) {
    const creatureId = `creature-${Math.random()}`;

    // Create body
    GameAPI.scene.createObject('box', `${creatureId}-body`, {
        width: 2,
        height: 2,
        depth: 3,
        position: [x, y, z],
        material: {
            type: 'default',
            color: [0.8, 0.2, 0.2]
        }
    });

    // Create head
    GameAPI.scene.createObject('sphere', `${creatureId}-head`, {
        radius: 1.2,
        position: [x, y + 2, z + 1.5],
        material: {
            type: 'default',
            color: [0.9, 0.3, 0.3]
        }
    });

    // Create legs
    const legPositions = [
        [x - 0.7, y - 1, z - 1],
        [x + 0.7, y - 1, z - 1],
        [x - 0.7, y - 1, z + 1],
        [x + 0.7, y - 1, z + 1]
    ];

    legPositions.forEach((pos, i) => {
        GameAPI.scene.createObject('box', `${creatureId}-leg-${i}`, {
            width: 0.4,
            height: 2,
            depth: 0.4,
            position: pos,
            material: {
                type: 'default',
                color: [0.7, 0.2, 0.2]
            }
        });
    });

    return creatureId;
}

// Create terrain grid function
function createTerrainGrid(size, scale) {
    const heightMap = [];
    // Generate height map with more dramatic elevation changes
    for (let x = 0; x < size; x++) {
        heightMap[x] = [];
        for (let z = 0; z < size; z++) {
            // Generate continuous height first
            const rawHeight =
                Math.sin(x * 0.2) * Math.cos(z * 0.2) * 12 +
                Math.sin(x * 0.5 + z * 0.3) * 6 +
                Math.sin(z * 0.4) * Math.cos(x * 0.4) * 8;

            // Quantize the height to create stepped terrain
            // Using scale * 3 (cube height) as the step size
            const stepSize = scale * 3;
            const quantizedHeight = Math.round(rawHeight / stepSize) * stepSize;

            heightMap[x][z] = quantizedHeight;

            // Smooth transitions - limit height difference with neighbors
            if (x > 0 && z > 0) {
                const leftHeight = heightMap[x - 1][z];
                const backHeight = heightMap[x][z - 1];
                const maxDiff = stepSize; // Maximum allowed height difference

                // Adjust height to be within one step of neighbors
                const targetHeight = Math.min(
                    quantizedHeight,
                    Math.max(
                        leftHeight - maxDiff,
                        backHeight - maxDiff,
                        Math.min(
                            leftHeight + maxDiff,
                            backHeight + maxDiff
                        )
                    )
                );

                heightMap[x][z] = targetHeight;
            }
        }
    }

    // Create cubes based on height map with larger scale and smaller gaps
    const spacing = 2; // Reduced spacing between cubes for denser terrain
    for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
            const height = heightMap[x][z];
            const y = height;

            // Only create cubes above certain height for more interesting landscape
            if (height > -4) {
                GameAPI.scene.createObject('box', `terrain-${x}-${z}`, {
                    width: scale * 1.5,    // Slightly wider cubes
                    height: scale * 3,     // Taller cubes
                    depth: scale * 1.5,    // Slightly deeper cubes
                    position: [
                        (x - size / 2) * spacing * 1.5,  // Spread out more on X
                        y,                               // Use exact quantized height
                        (z - size / 2) * spacing * 1.5   // Spread out more on Z
                    ],
                    material: {
                        type: 'shader',
                        vertexShader: terrainShaders.vertex,
                        fragmentShader: terrainShaders.fragment
                    }
                });
            }
        }
    }

    return heightMap;
}

// Create rainbow function
function createRainbow(x, y, z, size, id) {
    const points = [];
    const segments = 20;

    debugLog(`Creating rainbow ${id}:`, { x, y, z, size });

    // Add center point first for triangle fan
    points.push([0, 0, 0]);

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI;
        points.push([
            Math.cos(theta) * size,
            Math.sin(theta) * size,
            0
        ]);
    }

    GameAPI.scene.createObject('custom', `rainbow-${id}`, {
        vertices: points,
        position: [x, y, z],
        rotation: [0, Math.PI / 2, 0], // Rotate 90 degrees around Y to face camera
        material: {
            type: 'shader',
            vertexShader: rainbowShaders.vertex,
            fragmentShader: rainbowShaders.fragment,
            transparent: false,
            renderMode: 'triangles'
        }
    });
}

// Modify init function
exports.init = function (api) {
    GameAPI.debug("Minecraft-like world initializing...");

    GameAPI.scene.setClearColor(0.6, 0.8, 1.0, 1.0); // Nice sky blue

    // Create terrain with larger size and adjusted scale
    const heightMap = createTerrainGrid(32, 2); // Size 16, scale 2

    // Find max terrain height for rainbow positioning
    let maxHeight = -Infinity;
    for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
            if (heightMap[x] && heightMap[x][z] !== undefined) {
                maxHeight = Math.max(maxHeight, heightMap[x][z]);
            }
        }
    }

    // Position rainbows just above the terrain
    const rainbowHeight = maxHeight + 5; // 5 units above highest terrain point
    const terrainRadius = (16 * 2 * 1.5) / 2; // Calculate terrain radius based on size and spacing

    // Create rainbows at positions relative to terrain
    createRainbow(0, rainbowHeight, -terrainRadius * 0.5, 15, 'front');  // Front rainbow
    createRainbow(terrainRadius * 0.5, rainbowHeight + 5, 0, 12, 'right');  // Right rainbow
    createRainbow(-terrainRadius * 0.5, rainbowHeight - 2, 0, 10, 'left');  // Left rainbow

    debugLog('Rainbow positions:', {
        rainbowHeight,
        terrainRadius,
        maxHeight,
        positions: [
            [0, rainbowHeight, -terrainRadius * 0.5],
            [terrainRadius * 0.5, rainbowHeight + 5, 0],
            [-terrainRadius * 0.5, rainbowHeight - 2, 0]
        ]
    });

    // Setup light
    initializeLight();

    // Position camera above the center of the terrain
    const centerX = 0;
    const centerZ = 0;
    // Find height at center point (or nearby if center is empty)
    let centerHeight = -4; // default minimum height
    const halfSize = Math.floor(16 / 2); // Changed from 48 to match terrain size

    // Search for a valid height near the center
    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            const x = halfSize + dx;
            const z = halfSize + dz;
            if (heightMap[x] && heightMap[x][z] !== undefined) {
                centerHeight = Math.max(centerHeight, heightMap[x][z]);
            }
        }
    }

    // Position camera above the found height
    const cameraHeight = centerHeight + 20; // 20 units above the terrain
    GameAPI.camera.setPosition(centerX, cameraHeight, centerZ);
    GameAPI.camera.lookAt(centerX, centerHeight, centerZ - 20); // Look slightly forward
};

// Remove the creatures array since we're not using it anymore
let heightMap = [];

// Modify update function
exports.update = function (event) {
    const { time, deltaTime } = event;

    // Update light for day/night cycle
    const dayLength = 60; // seconds
    const angle = (time % dayLength) / dayLength * Math.PI * 2;
    const targetLightPos = [
        Math.cos(angle) * 100,
        Math.sin(angle) * 100,
        0
    ];

    // Use setTarget with a short duration for smooth movement
    GameAPI.scene.setTarget('moving-light-sphere', targetLightPos, 1000, "LINEAR");
};

exports.cleanup = function () {
    debugLog('Cleaning up...');
};