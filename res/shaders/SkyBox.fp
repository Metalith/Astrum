#version 330 core
#extension GL_NV_shadow_samplers_cube : enable
precision highp float;
out vec4 color;

in vec3 vTexCoordinates;

uniform samplerCube renderedTexture;

void main()
{
	color = textureCube(renderedTexture,vTexCoordinates);
}
