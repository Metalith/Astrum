#version 330 core
layout (location = 0) in vec3 position;
layout (location = 2) in vec3 barycenter;

out vec3 vBC;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    vBC = barycenter;
    gl_Position = projection * view *  model * vec4(position, 1.0f);
    gl_PointSize = 4.0;
}
