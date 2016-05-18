#version 330 core
out vec4 color;

in vec3 FragPos;
in vec3 Normal;
in vec3 vBC;

uniform vec3 lightPos;
uniform vec3 viewPos;
uniform vec3 lightColor;
uniform vec3 objectColor;

float edgeFactor(){
    vec3 d = fwidth(vBC);
    vec3 a3 = smoothstep(vec3(0.0), d*1.5, vBC);
    return min(min(a3.x, a3.y), a3.z);
}

void main()
{
    // // Ambient
    // float ambientStrength = 0.2f;
    // vec3 ambient = ambientStrength * lightColor;
    //
    // // Diffuse
    // vec3 norm = normalize(Normal);
    // vec3 lightDir = normalize(lightPos - FragPos);
    // float diff = max(dot(norm, lightDir), 0.0);
    // vec3 diffuse = diff * lightColor;
    //
    // // Specular
    // float specularStrength = 0.7f;
    // vec3 viewDir = normalize(viewPos - FragPos);
    // vec3 reflectDir = reflect(-lightDir, norm);
    // float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
    // vec3 specular = specularStrength * spec * lightColor;
    //
    // vec3 result = (ambient + diffuse + specular) * objectColor;
    color = vec4(0.3, 0.2, 1.0, (1.0-edgeFactor())*0.95);
}
