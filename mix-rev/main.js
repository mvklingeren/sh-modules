// Keep essential debug logging
function debugLog(msg, data) {
    console.log(`[MIX] ${msg}`, data);
    GameAPI.debug(`[MIX] ${msg} ${JSON.stringify(data)}`);
}

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

const baseHeight = 10;



// Add sphere shaders after planeShaders
const sphereShaders = {
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
        varying vec3 vWorldPosition;
        
        void main() {
            vNormal = normalize(mat3(modelViewMatrix) * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            vWorldPosition = position;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    // 1. Pulsating glow shader
    pulseFragment: `
        precision highp float;
        uniform float uTime;
        uniform vec3 uPointLightPos;
        uniform vec3 uPointLightColor;
        uniform float uPointLightIntensity;
        uniform float uOpacity;
        uniform vec3 uObjectColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        
        void main() {
            float pulse = 0.5 + 0.5 * sin(uTime * 2.0);
            vec3 baseColor = vec3(0.8, 0.2, 0.5) * pulse;
            
            vec3 lightDir = normalize(uPointLightPos - vPosition);
            vec3 normal = normalize(vNormal);
            float diff = max(dot(normal, lightDir), 0.0);
            float distance = length(uPointLightPos - vPosition);
            float attenuation = 1.0 / (1.0 + 0.045 * distance + 0.0075 * distance * distance);
            
            vec3 diffuse = uPointLightColor * diff * uPointLightIntensity * attenuation;
            vec3 ambient = vec3(0.2);
            
            vec3 finalColor = baseColor * (diffuse + ambient);
            gl_FragColor = vec4(finalColor, 0.8);
        }
    `,
    // 2. Rainbow swirl shader
    rainbowFragment: `
        precision highp float;
        uniform float uTime;
        uniform vec3 uPointLightPos;
        uniform vec3 uPointLightColor;
        uniform float uPointLightIntensity;
        uniform float uOpacity;
        uniform vec3 uObjectColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        
        void main() {
            vec3 p = normalize(vWorldPosition);
            float phi = atan(p.z, p.x);
            float theta = acos(p.y);
            
            float pattern = sin(phi * 3.0 + theta * 4.0 + uTime) * 
                          cos(theta * 3.0 - uTime * 0.5) *
                          sin(phi * 2.0 - theta * 2.0 + uTime * 0.7);
            
            vec3 baseColor = mix(
                vec3(0.7, 0.2, 0.8),
                mix(vec3(0.2, 0.5, 1.0), vec3(1.0, 0.3, 0.5), pattern),
                sin(uTime)
            );
            
            vec3 lightDir = normalize(uPointLightPos - vPosition);
            vec3 normal = normalize(vNormal);
            float diff = max(dot(normal, lightDir), 0.0);
            float distance = length(uPointLightPos - vPosition);
            float attenuation = 1.0 / (1.0 + 0.045 * distance + 0.0075 * distance * distance);
            
            vec3 diffuse = uPointLightColor * diff * uPointLightIntensity * attenuation;
            vec3 ambient = vec3(0.2);
            
            vec3 finalColor = baseColor * (diffuse + ambient);
            gl_FragColor = vec4(finalColor, 0.7);
        }
    `,
    // 3. Plasma shader
    plasmaFragment: `
        precision highp float;
        uniform float uTime;
        uniform vec3 uPointLightPos;
        uniform vec3 uPointLightColor;
        uniform float uPointLightIntensity;
        uniform float uOpacity;
        uniform vec3 uObjectColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        
        void main() {
            vec3 p = vWorldPosition * 2.0;
            float plasma = sin(p.x * 10.0 + uTime) * cos(p.y * 10.0 - uTime) * sin(p.z * 10.0);
            plasma += 0.5 * sin(distance(p, vec3(0.0)) * 8.0 - uTime * 2.0);
            
            vec3 baseColor = mix(
                vec3(0.1, 0.4, 1.0),
                vec3(0.8, 0.2, 0.8),
                plasma * 0.5 + 0.5
            );
            
            vec3 lightDir = normalize(uPointLightPos - vPosition);
            vec3 normal = normalize(vNormal);
            float diff = max(dot(normal, lightDir), 0.0);
            float distance = length(uPointLightPos - vPosition);
            float attenuation = 1.0 / (1.0 + 0.045 * distance + 0.0075 * distance * distance);
            
            vec3 diffuse = uPointLightColor * diff * uPointLightIntensity * attenuation;
            vec3 ambient = vec3(0.2);
            
            vec3 finalColor = baseColor * (diffuse + ambient);
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,
    // 4. Ripple shader
    rippleFragment: `
        precision highp float;
        uniform float uTime;
        uniform vec3 uPointLightPos;
        uniform vec3 uPointLightColor;
        uniform float uPointLightIntensity;
        uniform float uOpacity;
        uniform vec3 uObjectColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        
        void main() {
            vec3 p = normalize(vWorldPosition);
            float ripple = sin(20.0 * distance(p, vec3(0.0)) - uTime * 3.0);
            
            vec3 baseColor = mix(
                vec3(0.2, 0.5, 1.0),
                vec3(0.1, 0.2, 0.8),
                ripple * 0.5 + 0.5
            );
            
            vec3 lightDir = normalize(uPointLightPos - vPosition);
            vec3 normal = normalize(vNormal);
            float diff = max(dot(normal, lightDir), 0.0);
            float distance = length(uPointLightPos - vPosition);
            float attenuation = 1.0 / (1.0 + 0.045 * distance + 0.0075 * distance * distance);
            
            vec3 diffuse = uPointLightColor * diff * uPointLightIntensity * attenuation;
            vec3 ambient = vec3(0.2);
            
            vec3 finalColor = baseColor * (diffuse + ambient);
            gl_FragColor = vec4(finalColor, 0.8);
        }
    `,
    // 5. Fire shader
    fireFragment: `
        precision highp float;
        uniform float uTime;
        uniform vec3 uPointLightPos;
        uniform vec3 uPointLightColor;
        uniform float uPointLightIntensity;
        uniform float uOpacity;
        uniform vec3 uObjectColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        
        void main() {
            vec3 p = vWorldPosition * 3.0;
            float fire = sin(p.x * 4.0 + uTime * 2.0) * cos(p.y * 4.0 - uTime) * sin(p.z * 4.0 + uTime);
            fire += 0.5 * sin(distance(p, vec3(0.0)) * 5.0 - uTime * 3.0);
            
            vec3 baseColor = mix(
                vec3(1.0, 0.2, 0.0),
                vec3(1.0, 0.8, 0.0),
                fire * 0.5 + 0.5
            );
            
            vec3 lightDir = normalize(uPointLightPos - vPosition);
            vec3 normal = normalize(vNormal);
            float diff = max(dot(normal, lightDir), 0.0);
            float distance = length(uPointLightPos - vPosition);
            float attenuation = 1.0 / (1.0 + 0.045 * distance + 0.0075 * distance * distance);
            
            vec3 diffuse = uPointLightColor * diff * uPointLightIntensity * attenuation;
            vec3 ambient = vec3(0.3);
            
            vec3 finalColor = baseColor * (diffuse + ambient);
            gl_FragColor = vec4(finalColor, 0.4);
        }
    `
};

// Simplified terrain creation
function createTerrain(x, y, z, width, depth) {
    debugLog("Creating terrain with params:", { x, y, z, width, depth });

    GameAPI.scene.createObject('plane', 'main-terrain', {
        width: width,
        height: depth,
        widthSegments: 64,
        heightSegments: 64,
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
        intensity: 2,
        radius: 50
    });

    // Set the light as child of the sphere
    GameAPI.scene.setParent('moving-light', 'moving-light-sphere');
}

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

// Add sphere tracking array at the top with other constants
const MAX_SPHERES = 30;
const sphereQueue = [];
let sphereCount = 0;  // Add counter for unique IDs
let lastSphereTime = 0;  // Track last sphere creation time
const MIN_SPAWN_INTERVAL = 50;   // 50ms minimum wait
const MAX_SPAWN_INTERVAL = 250;  // 250ms maximum wait
let nextSpawnTime = 0;  // Track when to spawn next sphere

// Add function to update shader uniforms for a sphere
function updateSphereUniforms(sphereId, time, lightPos) {
    GameAPI.scene.setUniforms(sphereId, {
        uTime: time,
        uPointLightPos: lightPos,
        uPointLightColor: [1.0, 0.95, 0.8],
        uPointLightIntensity: 2.0
    });
}

// Modify createRandomSphere function
function createRandomSphere() {
    sphereCount++;
    const position = getRandomPosition();
    const sphereId = `sphere-${sphereCount}`;

    // Add random size between 0.5 and 2.5
    const randomSize = 0.5 + Math.random() * 2.0;  // 0.5 to 2.5

    // Add new sphere to queue
    sphereQueue.push(sphereId);

    // If we exceed MAX_SPHERES, remove the oldest sphere
    if (sphereQueue.length > MAX_SPHERES) {
        const oldestSphereId = sphereQueue.shift();
        GameAPI.scene.removeObject(oldestSphereId);
        debugLog("Removed oldest sphere:", { removedId: oldestSphereId, queueSize: sphereQueue.length });
    }

    // Pick a random fragment shader
    const fragmentShaders = [
        sphereShaders.pulseFragment,
        sphereShaders.rainbowFragment,
        sphereShaders.plasmaFragment,
        sphereShaders.rippleFragment,
        sphereShaders.fireFragment
    ];
    const randomShader = fragmentShaders[Math.floor(Math.random() * fragmentShaders.length)];

    // Create the new sphere with the random shader and size
    GameAPI.scene.createObject('sphere', sphereId, {
        radius: randomSize,  // Use random size here
        segments: 32,
        position: position,
        material: {
            type: 'shader',
            transparent: true,
            depthWrite: false,
            depthTest: true,
            blending: 'standard',
            emission: 1.0,
            color: [1.0, 1.0, 1.0],
            alpha: 0.7,
            vertexShader: sphereShaders.vertex,
            fragmentShader: randomShader,
            uniforms: {
                uTime: GameAPI.time.now() * 0.001,
                uOpacity: 0.7,
                uObjectColor: [1.0, 1.0, 1.0],
                uPointLightPos: [0, baseHeight, 0],
                uPointLightColor: [1.0, 0.95, 0.8],
                uPointLightIntensity: 2.0
            }
        }
    });

    // Set target position for falling motion
    const targetY = -15;
    const fallDuration = 1000;

    GameAPI.scene.setTarget(sphereId, [
        position[0],
        targetY,
        position[2]
    ], fallDuration, 'quadratic');

    debugLog("Created new sphere:", { 
        newId: sphereId, 
        queueSize: sphereQueue.length,
        position: position 
    });
}

// Add a function to demonstrate Bezier camera movement
function demonstrateCameraPath() {
    const startPos = [25, -12, 0];
    const startRot = [0, -Math.PI / 2, 0];

    const radius = 40;
    const height = 20;

    // Helper function to calculate rotation to look at center
    function calculateLookAtCenter(position) {
        // Calculate horizontal angle (yaw)
        const yaw = Math.atan2(-position[0], -position[2]);
        // Calculate vertical angle (pitch) - point down more when higher
        const distance = Math.sqrt(position[0] * position[0] + position[2] * position[2]);
        const pitch = -Math.atan2(position[1], distance) - 0.3; // Extra tilt down
        return [pitch, yaw, 0];
    }

    // Create a complete circular path
    const fullCirclePoints = [
        {
            // First quarter
            p1: [radius, height, radius],
            p2: [0, height * 1.5, radius],
            r1: calculateLookAtCenter([radius, height, radius]),
            r2: calculateLookAtCenter([0, height * 1.5, radius])
        },
        {
            // Second quarter
            p1: [-radius, height, radius],
            p2: [-radius, height, 0],
            r1: calculateLookAtCenter([-radius, height, radius]),
            r2: calculateLookAtCenter([-radius, height, 0])
        },
        {
            // Third quarter
            p1: [-radius, height, -radius],
            p2: [0, height * 1.5, -radius],
            r1: calculateLookAtCenter([-radius, height, -radius]),
            r2: calculateLookAtCenter([0, height * 1.5, -radius])
        },
        {
            // Fourth quarter - return to start
            p1: [radius, height, -radius],
            p2: startPos,
            r1: calculateLookAtCenter([radius, height, -radius]),
            r2: startRot
        }
    ];

    let currentSegment = 0;
    const segmentDuration = 7500;

    function animateNextSegment() {
        const currentPoints = fullCirclePoints[currentSegment];
        const nextPos = currentSegment === 3 ? startPos : fullCirclePoints[(currentSegment + 1) % 4].p1;
        const nextRot = currentSegment === 3 ? startRot : calculateLookAtCenter(nextPos);

        GameAPI.camera.setTarget(
            nextPos,
            nextRot,
            {
                movementType: 'bezier',
                duration: segmentDuration,
                controlPoints: currentPoints
            }
        );

        currentSegment = (currentSegment + 1) % 4;
        setTimeout(animateNextSegment, segmentDuration);
    }

    // Start the animation loop
    animateNextSegment();
}

// Modify init function
exports.init = function (api) {
    debugLog('Initializing Enhanced Terrain Demo...');

    GameAPI.scene.setClearColor(0.7, 0.7, 0.9, 1.0);

    const worldSize = 50;
    createTerrain(0, 0, 0, worldSize, worldSize);
    initializeLight();

    GameAPI.camera.setPosition(25, -12, 0);
    GameAPI.camera.lookAt(0, 0, 0);

    // Start camera demonstration after a short delay
    setTimeout(demonstrateCameraPath, 2000);

    debugLog('Init complete');
};

// Modify update function to automatically create spheres
exports.update = function (event) {
    const { time } = event;
    const currentTime = GameAPI.time.now();

    // Check if it's time to create a new sphere
    if (currentTime >= nextSpawnTime) {
        createRandomSphere();
        // Set next spawn time to current time plus random interval
        const randomInterval = MIN_SPAWN_INTERVAL + Math.random() * (MAX_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL);
        nextSpawnTime = currentTime + randomInterval;
    }

    // Calculate position for moving light
    const radius = 15;
    const heightVariation = 2;

    const newPos = [
        Math.cos(time * 0.5) * radius,
        baseHeight + Math.sin(time) * heightVariation,
        Math.sin(time * 0.5) * radius
    ];

    // Update sphere position (light will follow)
    GameAPI.scene.setPosition('moving-light-sphere', ...newPos);

    // Update uniforms for all active spheres
    sphereQueue.forEach(sphereId => {
        updateSphereUniforms(sphereId, time, newPos);
    });
};

// Modify cleanup to properly remove all remaining spheres
exports.cleanup = function () {
    debugLog('Cleaning up...');

    // Remove all spheres in the queue
    while (sphereQueue.length > 0) {
        const sphereId = sphereQueue.shift();
        GameAPI.scene.removeObject(sphereId);
    }
};