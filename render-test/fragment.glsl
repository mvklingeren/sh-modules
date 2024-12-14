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
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * uLightColor * uObjectColor;
    vec3 ambient = 0.1 * uObjectColor;
    fragColor = vec4(ambient + diffuse, 1.0);
}