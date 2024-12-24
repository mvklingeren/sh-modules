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