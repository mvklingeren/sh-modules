#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vPosition;

uniform vec3 uLightPosition; // Position of the light source
uniform vec3 uLightColor;    // Color of the light
uniform vec3 uObjectColor;   // Color of the object

out vec4 fragColor;

void main() {
    // Normalize the interpolated normal and calculate light direction
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightPosition - vPosition);
    
    // Ambient lighting: softer contribution
    vec3 ambient = 0.2 * uObjectColor; 

    // Diffuse lighting: Lambertian reflectance
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * uLightColor * uObjectColor;

    // Specular lighting: Phong reflection model
    vec3 viewDir = normalize(-vPosition); // Assuming the camera is at (0,0,0)
    vec3 halfDir = normalize(lightDir + viewDir); // Halfway vector
    float spec = pow(max(dot(normal, halfDir), 0.0), 64.0); // Specular exponent for wider highlights
    vec3 specular = 1.0 * spec * uLightColor;

    // Boost color intensity
    vec3 result = ambient * 1.5 + diffuse * 2.0 + specular * 1.2;

    // More aggressive gamma correction
    result = pow(result, vec3(1.0/1.8)); // Adjust this value

    // Increase minimum brightness
    result = max(result, vec3(0.3)); // Slightly higher base brightness

    // Output the final color
    fragColor = vec4(result, 1.0);
}
