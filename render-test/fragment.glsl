#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vPosition;

uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform vec3 uObjectColor;

out vec4 fragColor;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightPosition - vPosition);
    
    // Increase ambient light contribution
    vec3 ambient = 0.6 * uObjectColor;
    
    // Enhance diffuse lighting
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * uLightColor * uObjectColor;
    
    // Add stronger specular highlights
    vec3 viewDir = normalize(-vPosition);
    vec3 halfDir = normalize(lightDir + viewDir);

float spec = pow(max(dot(normal, halfDir), 0.0), 128.0); // Higher exponent for tighter specular
vec3 specular = 1.0 * spec * uLightColor * uObjectColor;

    
    // Combine lighting with adjusted weights
vec3 result = ambient * 1.2 + diffuse * 1.5 + specular;

    
    // Apply gamma correction for better contrast
result = pow(result, vec3(1.0/2.0)); // Softer gamma correction
    
    // Ensure minimum brightness while preserving color
    result = max(result, vec3(0.2));
    
    fragColor = vec4(result, 1.0);
}