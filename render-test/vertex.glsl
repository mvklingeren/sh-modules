#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix; // Add this uniform

out vec3 vNormal;
out vec3 vPosition;

void main() {
    // Transform normal using the normal matrix for correct normal orientation
    vNormal = normalize(uNormalMatrix * normal);
    vPosition = vec3(uModelMatrix * vec4(position, 1.0));
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
}