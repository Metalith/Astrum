#version 330 core
layout (location = 0) in vec3 position1;
layout (location = 2) in vec3 position2;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view *  model * vec4(position1+position2, 1.0f);
    gl_PointSize = 2.0;
}
