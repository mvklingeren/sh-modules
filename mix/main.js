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
        uniform vec3 lightPos;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying float vWave;

        void main() {
            // Create a gradient based on position and wave height
            vec3 color1 = vec3(0.1, 0.3, 0.5);  // Deep blue
            vec3 color2 = vec3(0.2, 0.5, 0.7);  // Light blue

            // Mix colors based on UV coordinates and wave
            vec3 finalColor = mix(color1, color2, vUv.y + vWave);

            // Calculate light direction and normal
            vec3 lightDir = normalize(lightPos - vPosition);
            vec3 normal = normalize(vNormal);

            // Basic diffuse lighting
            float diff = max(dot(normal, lightDir), 0.0);

            // Shadow calculation
            vec3 cubePos = vec3(0.0, 0.0, 0.0);  // Cube position
            float shadowStrength = 0.6;             // Increased shadow strength
            float maxShadowDistance = 12.0;         // Increased shadow radius

            // Calculate vector from surface point to cube
            vec3 toCube = cubePos - vPosition;

            // Project the vector onto the ground plane
            float projectedDistance = length(toCube.xz);

            // Calculate shadow based on distance and light direction
            float shadowFactor = 1.0;
            if(projectedDistance < maxShadowDistance) {
                // Create softer shadow falloff
                float shadowGradient = smoothstep(0.0, maxShadowDistance, projectedDistance);

                // Make shadow stronger when light is more directly above
                float lightAngle = dot(vec3(0.0, 1.0, 0.0), -lightDir);
                lightAngle = smoothstep(0.2, 1.0, lightAngle);

                // Combine factors
                shadowFactor = mix(1.0 - shadowStrength, 1.0, shadowGradient * (1.0 - lightAngle));
            }

            // Apply lighting and shadow
            finalColor *= (diff * 0.7 + 0.3) * shadowFactor;

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

// Simplified init function
exports.init = function (api) {
    debugLog('Initializing Enhanced Terrain Demo...');

    GameAPI.scene.setClearColor(0.7, 0.7, 0.9, 1.0);

    const worldSize = 50;
    createTerrain(0, 0, 0, worldSize, worldSize);
    createCube(0, -10, 0, 8);

    GameAPI.camera.setPosition(20, 20, 20);
    GameAPI.camera.lookAt(0, -15, 0);

    debugLog('Init complete');
};

// Simplified update function
exports.update = function (event) {
    const time = event.time;

    // Update light position with a higher elevation
    const lightPos = [
        Math.cos(time * 0.5) * 20,  // X
        25,                         // Y (higher position)
        Math.sin(time * 0.5) * 20   // Z
    ];

    // Update uniforms
    GameAPI.scene.setUniform('uTime', time);
    GameAPI.scene.setUniform('lightPos', lightPos);
};

exports.cleanup = function () {
    debugLog('Cleaning up...');
};