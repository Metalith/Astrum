#version 330 core
out vec4 color;

in vec3 vBC;

float edgeFactor(){
    vec3 d = fwidth(vBC);
    vec3 a3 = smoothstep(vec3(0.0), d*1.5, vBC);
    return min(min(a3.x, a3.y), a3.z);
}

void main()
{
    color = vec4(0.3, 1.0, 0.3, (1.0-edgeFactor())*0.95);
}
