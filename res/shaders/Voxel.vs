#version 330 core
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;

smooth out vec3 vertexNormal;
out float logz;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
	vertexNormal = normal;
	gl_Position = projection * view *  model * vec4(position, 1.0f);
	/*const float far = 4000f;*/
	/*const float C = 0.01f;*/
	/*const float FC = 1.0/log(far*C + 1);*/

	/*//logz = gl_Position.w*C + 1;  //version with fragment code*/
	/*logz = log(gl_Position.w*C + 1)*FC;*/
	/*gl_Position.z = (2*logz - 1)*gl_Position.w;*/
}
