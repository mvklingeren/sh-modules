#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec3 vNormal;
out vec3 vPosition;

void main() {
    vNormal = (uModelMatrix * vec4(normal, 0.0)).xyz;
    vPosition = (uModelMatrix * vec4(position, 1.0)).xyz;
    
    vec4 worldPos = uModelMatrix * vec4(position, 1.0);
    vec4 viewPos = uViewMatrix * worldPos;
    vec4 clipPos = uProjectionMatrix * viewPos;
    
    gl_Position = clipPos;
}