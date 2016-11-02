#version 330 core
precision highp float;

out vec4 color;

in vec3 pos;


uniform sampler2D flowTexture;
uniform sampler2D colorTexture;

void main() {
	vec2 texCoord = pos.xy / vec2(2048.0, 1024.0);
	vec4 flow = texture2D( flowTexture, texCoord);
	flow.xy = normalize(flow.xy);
	texCoord = texCoord - vec2(flow.y, -flow.x );
	vec3 c = texture2D( colorTexture, texCoord).rgb;
	// color = vec4((flow.xy + 1.0) / 2.0, 1.0, 1.0);
	color = vec4(mix(c, texture2D(colorTexture, pos.xy / vec2(2048, 1024.0)).rgb, 0.5), 1.0);
}
