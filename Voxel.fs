#version 330 core
out vec4 color;

in vec3 vertexNormal;

uniform vec3 objectColor;

void main()
{
	vec3 lightDir = -normalize(vec3(1, 5, -5));
	float d = dot(vertexNormal, -lightDir);
	d = max(0.2, d);
	color = vec4(objectColor*d,1);
}
