#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vPosition;
in vec2 vUv;

uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform vec3 uObjectColor;
uniform float uTime;

out vec4 fragColor;

// Block texture function
vec3 getBlockColor(vec3 position, vec3 normal) {
    // Base colors for different block types
    vec3 grassTop = vec3(0.4, 0.8, 0.3);    // Grass
    vec3 grassSide = vec3(0.45, 0.33, 0.25); // Dirt with grass overlay
    vec3 dirt = vec3(0.45, 0.33, 0.25);      // Dirt
    vec3 stone = vec3(0.5, 0.5, 0.5);        // Stone

    // Add some noise to break up solid colors
    float noise = fract(sin(dot(floor(position * 10.0), vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    
    // Determine block type based on position
    vec3 baseColor;
    if (position.y < 0.5) {
        baseColor = stone;
    } else if (abs(normal.y) > 0.9) {
        baseColor = grassTop;
    } else {
        baseColor = grassSide;
    }
    
    // Add slight color variation
    return baseColor + (noise * 0.1 - 0.05);
}

void main() {
    // Normalize vectors
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightPosition - vPosition);
    
    // Ambient light
    float ambientStrength = 0.3;
    vec3 ambient = ambientStrength * uLightColor;
    
    // Diffuse light - use stepped values for cel-shading effect
    float diff = max(dot(normal, lightDir), 0.0);
    diff = floor(diff * 4.0) / 4.0; // Quantize for cel-shading
    vec3 diffuse = diff * uLightColor;
    
    // Get block color based on position and normal
    vec3 blockColor = getBlockColor(vPosition, normal);
    
    // Add edge darkening
    float edgeDarkening = pow(abs(dot(normal, vec3(0.0, 0.0, 1.0))), 0.5) * 0.3;
    
    // Combine lighting
    vec3 result = (ambient + diffuse) * blockColor;
    result = mix(result * 0.7, result, edgeDarkening);
    
    // Add very subtle AO at edges
    float ao = 1.0 - (1.0 - dot(normal, vec3(0.0, 1.0, 0.0))) * 0.5;
    result *= ao;
    
    // Output final color
    fragColor = vec4(result, 1.0);
}