// In fragment.glsl
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
    
    // Ambient light (increased)
    vec3 ambient = 0.3 * uObjectColor;  // Increased from 0.1
    
    // Diffuse light
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * uLightColor * uObjectColor;
    
    // Add specular highlight for better visibility
    vec3 viewDir = normalize(-vPosition);  // Camera at origin in view space
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular = 0.5 * spec * uLightColor;
    
    // Combine lighting
    vec3 result = ambient + diffuse + specular;
    
    // Ensure visibility by clamping minimum brightness
    result = max(result, vec3(0.1));  // Minimum brightness
    
    fragColor = vec4(result, 1.0);
    
    // Debug: Output solid color to verify fragment shader is running
    // fragColor = vec4(1.0, 0.0, 0.0, 1.0);  // Bright red
}