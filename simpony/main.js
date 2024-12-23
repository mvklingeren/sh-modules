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
    NUM_LIGHTS: 4,
    lights: [
        { color: [1.0, 0.95, 0.8], intensity: 2.0 },   // Main light (warm white)
        { color: [0.3, 0.5, 1.0], intensity: 1.5 },    // Blue accent
        { color: [1.0, 0.3, 0.2], intensity: 1.5 },    // Red accent
        { color: [0.2, 1.0, 0.3], intensity: 1.5 }     // Green accent
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
            vec3 diffuse = uPointLightColor * diff * (uPointLightIntensity * 1.5) * attenuation;

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
        intensity: 0.2,
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
            vec3 diffuse = uPointLightColor * diff * uPointLightIntensity;
            
            // Add ambient light
            vec3 ambient = vec3(0.3);
            
            // Final color
            vec3 finalColor = baseColor * (diffuse + ambient);
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};

// Add rainbow shader
const rainbowShaders = {
    vertex: `
        precision highp float;
        attribute vec3 position;
        
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        
        varying vec3 vPosition;
        
        void main() {
            vec3 pos = position;
            // Add some wave motion
            pos.y += sin(pos.x * 0.2 + uTime) * 2.0;
            
            vPosition = pos;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragment: `
        precision highp float;
        
        uniform float uTime;
        varying vec3 vPosition;
        
        void main() {
            // Rainbow color calculation
            vec3 color = vec3(
                sin(vPosition.x * 0.2 + uTime) * 0.5 + 0.5,
                sin(vPosition.x * 0.2 + uTime + 2.094) * 0.5 + 0.5,
                sin(vPosition.x * 0.2 + uTime + 4.189) * 0.5 + 0.5
            );
            
            // Add sparkle effect
            float sparkle = sin(vPosition.x * 10.0 + uTime * 5.0) * 
                           sin(vPosition.y * 10.0 + uTime * 3.0) * 0.5 + 0.5;
            
            color += vec3(sparkle * 0.3);
            
            gl_FragColor = vec4(color, 0.6);
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
    // Generate height map using simplex noise (simplified here)
    for (let x = 0; x < size; x++) {
        heightMap[x] = [];
        for (let z = 0; z < size; z++) {
            heightMap[x][z] = Math.sin(x * 0.2) * Math.cos(z * 0.2) * 5;
        }
    }

    // Create cubes based on height map
    for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
            const height = heightMap[x][z];
            const y = height;

            GameAPI.scene.createObject('box', `terrain-${x}-${z}`, {
                width: scale,
                height: scale,
                depth: scale,
                position: [
                    (x - size/2) * scale,
                    y,
                    (z - size/2) * scale
                ],
                material: {
                    type: 'shader',
                    vertexShader: terrainShaders.vertex,
                    fragmentShader: terrainShaders.fragment
                }
            });
        }
    }

    return heightMap;
}

// Create rainbow function
function createRainbow(x, y, z, size) {
    const points = [];
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI;
        points.push([
            Math.cos(theta) * size,
            Math.sin(theta) * size,
            0
        ]); 
    }

    GameAPI.scene.createObject('custom', 'rainbow', {
        vertices: points,
        position: [x, y, z],
        material: {
            type: 'shader',
            vertexShader: rainbowShaders.vertex,
            fragmentShader: rainbowShaders.fragment,
            transparent: false,
            depthWrite: false
        }
    });
}

// Modify init function
exports.init = function (api) {
    GameAPI.debug("Minecraft-like world initializing...");

    GameAPI.scene.setClearColor(0.6, 0.8, 1.0, 1.0); // Nice sky blue

    // Create terrain
    const heightMap = createTerrainGrid(32, 2);

    // Create creatures
    // const creatures = [];
    // for (let i = 0; i < 5; i++) {
    //     const x = Math.random() * 40 - 20;
    //     const z = Math.random() * 40 - 20;
    //     const y = 10; // Will be affected by gravity
    //     creatures.push(createCreature(x, y, z));
    // }

    // Create rainbows
    createRainbow(0, 30, -20, 20);
    createRainbow(20, 35, 10, 15);

    // Setup light
    initializeLight();

    // Position camera for good view
    GameAPI.camera.setPosition(50, 50, 50);
    GameAPI.camera.lookAt(0, 0, 0);
};

// Add creature animation and physics
let creatures = [];
let heightMap = [];

// Modify update function
exports.update = function (event) {
    const { time, deltaTime } = event;

    // Update creatures
    // creatures.forEach(creatureId => {
    //     // Simple walking animation
    //     const walkSpeed = 5;
    //     const bounceHeight = 0.5;
    //     const x = Math.cos(time * walkSpeed) * 10;
    //     const z = Math.sin(time * walkSpeed) * 10;
    //     const bounce = Math.sin(time * walkSpeed * 2) * bounceHeight;

    //     // Apply gravity and terrain collision
    //     let y = 0; // Calculate based on terrain height
        
    //     GameAPI.scene.setPosition(`${creatureId}-body`, x, y + bounce, z);
    //     GameAPI.scene.setPosition(`${creatureId}-head`, x, y + 2 + bounce, z + 1.5);
        
    //     // Update legs with walking animation
    //     for (let i = 0; i < 4; i++) {
    //         const legPhase = time * walkSpeed + (i * Math.PI / 2);
    //         const legBounce = Math.sin(legPhase) * 0.5;
    //         GameAPI.scene.setPosition(
    //             `${creatureId}-leg-${i}`,
    //             x + (i % 2 === 0 ? -0.7 : 0.7),
    //             y - 1 + legBounce,
    //             z + (i < 2 ? -1 : 1)
    //         );
    //     }
    // });

    // Update light for day/night cycle
    const dayLength = 60; // seconds
    const angle = (time % dayLength) / dayLength * Math.PI * 2;
    // const lightPos = [
    //     Math.cos(angle) * 100,
    //     Math.sin(angle) * 100,
    //     0
    // ];
    // GameAPI.scene.setPosition('moving-light-sphere', ...lightPos);
};

exports.cleanup = function () {
    debugLog('Cleaning up...');
};