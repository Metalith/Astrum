#version 330 core
precision highp float;
out vec4 color;

in vec3 vertexNormal;
in vec3 pos;

uniform sampler2D renderedTexture;

void main()
{
	vec3 lightDir = -normalize(vec3(1, 5, -5));
	float d = dot(vertexNormal, -lightDir);
	d = max(0.1, d);
	
	// Equirectangular Project Coordinate Conversion
	float lat = (asin(pos.y / 32.0) / 1.57 + 1.0) / 2.0; // Generates the Latitude via arcsin of up / radius. Divide by 1.57 to normalize to [-1,1] then add 1 / 2 to reduce range to [0..1]
    float lon = ((atan(pos.x, pos.z) / 3.14) + 1.0) / 2.0; // Generates the Longitude via arcsin of up / radius. Divide by 3.14 to normalize to [-1,1] then add 1 / 2 to reduce range to [0..1]

    vec2 texCoord = vec2(lon, lat);
	vec3 c = texture2D( renderedTexture, texCoord).xyz;
	color = vec4(c*d,1);
}
