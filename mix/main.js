// Add at the start of the file
function debugLog(msg, data) {
    console.log(`[MIX] ${msg}`, data);
    GameAPI.debug(`[MIX] ${msg} ${JSON.stringify(data)}`);
}

// Simplify materials even further for debugging
const materials = {
    terrain: {
        type: 'default',
        color: [1.0, 0.0, 0.0], // Bright red for visibility
        vertexShader: 'defaultVertexShader',
        fragmentShader: 'defaultFragmentShader'
    }
};

// Add color animation utilities
const colorUtils = {
    // Pastel color palette
    colors: [
        [0.87, 0.93, 0.97, 1.0], // Soft sky blue
        [0.98, 0.91, 0.93, 1.0], // Soft pink
        [0.93, 0.97, 0.91, 1.0], // Soft mint
        [0.97, 0.95, 0.87, 1.0], // Soft yellow
        [0.95, 0.90, 0.97, 1.0]  // Soft lavender
    ],

    // Lerp between colors
    lerpColors: (color1, color2, t) => {
        return color1.map((c, i) => c + (color2[i] - c) * t);
    }
};

// Add shader definitions at the top after debugLog
const shaders = {
    vertex: `
        precision mediump float;
        
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;

        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
            vNormal = normal;
            vPosition = position;
            vUv = uv;

            // Add subtle wave motion to vertices
            vec3 pos = position;
            pos.y += sin(pos.x * 0.5 + uTime) * 0.2;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragment: `
        precision mediump float;
        
        uniform vec3 uObjectColor;
        uniform vec3 uLightPosition;
        uniform vec3 uLightColor;
        uniform float uTime;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
            vec3 color = uObjectColor;
            
            // Add time-based color variation
            color *= 0.8 + 0.2 * sin(uTime * 0.5);
            
            // Simple lighting
            vec3 lightDir = normalize(uLightPosition - vPosition);
            float diff = max(dot(normalize(vNormal), lightDir), 0.0);
            vec3 diffuse = diff * uLightColor;
            
            gl_FragColor = vec4(color * (diffuse + 0.3), 1.0);
        }
    `
};

// Modify createTerrain function
function createTerrain(x, z, width, depth) {
    debugLog("Creating terrain with params:", { x, z, width, depth });

    GameAPI.scene.createObject('plane', 'main-terrain', {
        width: width,
        height: depth,
        widthSegments: 32,
        heightSegments: 32,
        position: [x, z, 0],
        rotation: [0, 0, 0],
        material: {
            type: 'shader',
            vertexShader: shaders.vertex,    // Pass shader code directly
            fragmentShader: shaders.fragment, // Pass shader code directly
            color: [0.3, 0.7, 0.3],
            wireframe: false,
            depthTest: true,
            depthWrite: true
        }
    });

    debugLog("Terrain creation requested");
}

// Add event listener for object creation results
GameAPI.addEventListener('sceneObjectCreated', (event) => {
    debugLog("Scene object created:", {
        objectId: event.objectId,
        success: event.success,
        details: event.details,
        error: event.error,
        position: event.position,
        timestamp: Date.now()
    });
});

// Add error event listener
GameAPI.addEventListener('error', (event) => {
    debugLog("Error event received:", event);
});

// Add more debug events
GameAPI.addEventListener('render', (event) => {
    debugLog("Render event:", {
        frameCount: event.frameCount,
        timestamp: Date.now()
    });
});

// Modify createCube function
function createCube(x, y, z, size) {
    debugLog("Creating cube with params:", { x, y, z, size });

    GameAPI.scene.createObject('box', 'demo-cube', {
        width: size,
        height: size,
        depth: size,
        position: [x, y + size / 2, z],
        material: {
            type: 'shader',
            vertexShader: shaders.vertex,    // Pass shader code directly
            fragmentShader: shaders.fragment, // Pass shader code directly
            color: [0.8, 0.2, 0.2],
            wireframe: false,
            depthTest: true,
            depthWrite: true
        }
    });

    debugLog("Cube creation requested");
}

// Modify init for better viewing angle
exports.init = function (api) {
    debugLog('Initializing Enhanced Terrain Demo...');

    GameAPI.scene.setClearColor(0.2, 0.2, 0.2, 1.0);

    const worldSize = 100;
    createTerrain(-worldSize / 2, -worldSize / 2, worldSize, worldSize);
    createCube(0, 0, 0, 10);

    GameAPI.camera.setPosition(30, 30, 30);
    GameAPI.camera.lookAt(0, 0, 0);

    debugLog('Init complete - objects created');
};

// Update function with animated colors
exports.update = function (event) {
    const time = event.time;

    // Animate light position in a circle
    const lightX = Math.cos(time * 0.5) * 50;
    const lightZ = Math.sin(time * 0.5) * 50;
    const lightY = 50 + Math.sin(time) * 10;

    // Animate background color
    const colorDuration = 5.0; // seconds per color
    const totalDuration = colorUtils.colors.length * colorDuration;
    const normalizedTime = (time % totalDuration) / colorDuration;
    const colorIndex = Math.floor(normalizedTime);
    const nextColorIndex = (colorIndex + 1) % colorUtils.colors.length;
    const colorT = normalizedTime - Math.floor(normalizedTime);

    const currentColor = colorUtils.lerpColors(
        colorUtils.colors[colorIndex],
        colorUtils.colors[nextColorIndex],
        colorT
    );

    // Set the clear color
    // GameAPI.scene.setClearColor(...currentColor);

    // Pass time to shaders
    GameAPI.scene.setUniform('uTime', time);

    // Set other uniforms
    GameAPI.scene.setUniform('uObjectColor', [0.7, 0.7, 0.8]);
    GameAPI.scene.setUniform('uLightPosition', [lightX, lightY, lightZ]);
    GameAPI.scene.setUniform('uLightColor', [1.0, 0.95, 0.8]);
};

// Add cleanup function
exports.cleanup = function () {
    debugLog('Cleaning up...');
    // Any cleanup code here
};