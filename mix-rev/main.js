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

// Add after the existing functions, before init
function createSphereGrid(rows, cols, spacing, height) {
    debugLog("Creating sphere grid:", { rows, cols, spacing, height });

    const startX = -(cols * spacing) / 2;
    const startZ = -(rows * spacing) / 2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = startX + col * spacing;
            const z = startZ + row * spacing;

            // Create unique ID for each sphere
            const sphereId = `sphere-${row}-${col}`;

            GameAPI.scene.createObject('sphere', sphereId, {
                radius: 3.5,
                segments: 32,
                position: [x, height, z],
                material: {
                    type: 'default',
                    color: [
                        0.5 + Math.sin(row / rows) * 0.5,  // Vary red based on row
                        0.5 + Math.cos(col / cols) * 0.5,  // Vary green based on column
                        0.7                              // Constant blue component
                    ],
                    roughness: 0.3
                }
            });
        }
    }
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

// Add function to generate random position
function getRandomPosition() {
    const WORLD_BOUNDS = 20; // Area in which spheres can spawn
    const MIN_HEIGHT = 0;    // Minimum height from ground
    const MAX_HEIGHT = 10;   // Maximum height for spawning

    return [
        (Math.random() - 0.5) * WORLD_BOUNDS * 2, // Random X: -WORLD_BOUNDS to +WORLD_BOUNDS
        MIN_HEIGHT + Math.random() * (MAX_HEIGHT - MIN_HEIGHT), // Random Y: MIN to MAX height
        (Math.random() - 0.5) * WORLD_BOUNDS * 2  // Random Z: -WORLD_BOUNDS to +WORLD_BOUNDS
    ];
}

// Add function to create a sphere at random position
function createRandomSphere() {
    const position = getRandomPosition();
    const sphereId = `sphere-${Date.now()}`; // Unique ID based on timestamp

    GameAPI.scene.createObject('sphere', sphereId, {
        radius: 1.0,
        segments: 32,
        position: position,
        material: {
            type: 'emissive',
            color: [
                0.3 + Math.random() * 0.7, // Random RGB colors
                0.3 + Math.random() * 0.7,
                0.3 + Math.random() * 0.7
            ],
            emission: 1.0,
            roughness: 0.2
        }
    });
}

// Modify init function
exports.init = function (api) {
    debugLog('Initializing Enhanced Terrain Demo...');

    GameAPI.scene.setClearColor(0.7, 0.7, 0.9, 1.0);

    const worldSize = 50;
    createTerrain(0, 0, 0, worldSize, worldSize);
    createSphereGrid(5, 5, 12, -10);
    initializeLight();

    GameAPI.camera.setPosition(20, 20, 20);
    GameAPI.camera.lookAt(0, -15, 0);

    // Modify keyboard event listener for spacebar
    GameAPI.addEventListener('input', (data) => {
        if (!data.event) return;
        const event = data.event;

        if (event.type === 'keydown' && event.code === 'Space') {
            createRandomSphere();
        }
    });

    debugLog('Init complete');
};

// Modify update function - remove sphere tracking code
exports.update = function (event) {
    const { time } = event;

    // Calculate position for moving light
    const radius = 15;
    const baseHeight = 10;
    const heightVariation = 2;

    const newPos = [
        Math.cos(time * 0.5) * radius,
        baseHeight + Math.sin(time) * heightVariation,
        Math.sin(time * 0.5) * radius
    ];

    // Update sphere position (light will follow)
    GameAPI.scene.setPosition('moving-light-sphere', ...newPos);
};

exports.cleanup = function () {
    debugLog('Cleaning up...');
};