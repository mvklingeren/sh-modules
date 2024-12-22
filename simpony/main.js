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

// Modify init function
exports.init = function (api) {
    GameAPI.debug("simpony initializing...");

    debugLog('Initializing Enhanced Terrain Demo...');

    GameAPI.scene.setClearColor(0.7, 0.7, 0.9, 1.0);

    const worldSize = 50;
    createTerrain(0, 0, 0, worldSize, worldSize);
    createSphereGrid(6, 6, 12, -10);  // Adjusted for better 3D grid visibility
    initializeLight();

    // Adjust camera position for better view of 3D grid
    GameAPI.camera.setPosition(40, 40, 40);
    GameAPI.camera.lookAt(0, 10, 0);  // Look at center of grid

    debugLog('Init complete');
};

// Add after createSphereGrid function
function animateParentSphere(time) {
    // Calculate a new target position with spiral motion
    const radius = 20 + Math.sin(time * 0.8) * 8;     // Faster breathing, larger variation
    const baseHeight = -10;
    const heightVariation = 20;                        // Increased height variation
    const spiralHeight = baseHeight + Math.sin(time * 0.6) * heightVariation;
    const spiralSpeed = 0.5;                          // Faster spiral

    const targetPos = [
        Math.cos(time * spiralSpeed) * radius,
        spiralHeight + Math.cos(time * 1.2) * 8,      // Faster bobbing, larger amplitude
        Math.sin(time * spiralSpeed) * radius
    ];

    // Set new target for parent sphere with cubic easing for smooth motion
    GameAPI.scene.setTarget(
        'sphere-parent',
        targetPos, 
        800,    // Even shorter duration for snappier movement
        'cubic'
    );
}

// Modify update function
exports.update = function (event) {
    const { time } = event;

    // Light movement
    const lightRadius = 15;
    const lightBaseHeight = 10;
    const lightHeightVariation = 2;

    const lightPos = [
        Math.cos(time * 0.5) * lightRadius,
        lightBaseHeight + Math.sin(time) * lightHeightVariation,
        Math.sin(time * 0.5) * lightRadius
    ];

    // Update light sphere position
    GameAPI.scene.setPosition('moving-light-sphere', ...lightPos);

    // Animate parent sphere (which will move all children)
    animateParentSphere(time);
};

exports.cleanup = function () {
    debugLog('Cleaning up...');
};