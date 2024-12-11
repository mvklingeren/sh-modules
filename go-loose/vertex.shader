#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec3 vNormal;
out vec3 vPosition;
out vec2 vUv;

void main() {
  vNormal = mat3(uModelMatrix) * normal;
  vPosition = (uModelMatrix * vec4(position, 1.0)).xyz;
  vUv = uv;
  
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
}