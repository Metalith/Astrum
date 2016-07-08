#version 330 core
precision highp float;
out vec4 color;

in vec3 pos;

vec3 mod289(vec3 x) {
	return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
	return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
	return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
{
	const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
			0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
			-0.577350269189626,  // -1.0 + 2.0 * C.x
			0.024390243902439); // 1.0 / 41.0
	// First corner
	vec2 i  = floor(v + dot(v, C.yy) );
	vec2 x0 = v -   i + dot(i, C.xx);

	// Other corners
	vec2 i1;
	//i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
	//i1.y = 1.0 - i1.x;
	i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
	// x0 = x0 - 0.0 + 0.0 * C.xx ;
	// x1 = x0 - i1 + 1.0 * C.xx ;
	// x2 = x0 - 1.0 + 2.0 * C.xx ;
	vec4 x12 = x0.xyxy + C.xxzz;
	x12.xy -= i1;

	// Permutations
	i = mod289(i); // Avoid truncation effects in permutation
	vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
			+ i.x + vec3(0.0, i1.x, 1.0 ));

	vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
	m = m*m ;
	m = m*m ;

	// Gradients: 41 points uniformly over a line, mapped onto a diamond.
	// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

	vec3 x = 2.0 * fract(p * C.www) - 1.0;
	vec3 h = abs(x) - 0.5;
	vec3 ox = floor(x + 0.5);
	vec3 a0 = x - ox;

	// Normalise gradients implicitly by scaling m
	// Approximation of: m *= inversesqrt( a0*a0 + h*h );
	m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

	// Compute final noise value at P
	vec3 g;
	g.x  = a0.x  * x0.x  + h.x  * x0.y;
	g.yz = a0.yz * x12.xz + h.yz * x12.yw;
	return 130.0 * dot(m, g);
}

float noise(vec2 position, int octaves, float frequency, float persistence) {
	float total = 0.0; // Total value so far
	float maxAmplitude = 0.0; // Accumulates highest theoretical amplitude
	float amplitude = 1.0;
	for (int i = 0; i < octaves; i++) { // Get the noise sample
		total += snoise(position * frequency) * amplitude; // Make the wavelength twice as small
		frequency *= 2.0; // Add to our maximum possible amplitude
		maxAmplitude += amplitude; // Reduce amplitude according to persistence for the next octave
		amplitude *= persistence;
	} // Scale the result by the maximum amplitude
	return total / maxAmplitude;
}

float ridgedNoise(vec2 position, int octaves, float frequency, float persistence) {
	float total = 0.0; // Total value so far
	float maxAmplitude = 0.0; // Accumulates highest theoretical amplitude
	float amplitude = 1.0;
	for (int i = 0; i < octaves; i++) { // Get the noise sample
		total += ((1.0 - abs(snoise(position * frequency))) * 2.0 - 1.0) * amplitude;
		frequency *= 2.0; // Add to our maximum possible amplitude
		maxAmplitude += amplitude; // Reduce amplitude according to persistence for the next octave
		amplitude *= persistence;
	} // Scale the result by the maximum amplitude
	return total / maxAmplitude;
}

void main() {
	vec2 tPos = gl_FragCoord.xy / 2048.0;
	// float n = snoise((tPos / 64)) * 4;
	// float n = noise(tPos / 64, 6, 0.1, 0.8) * 32;
	float s = 0.5;
	float t1 = snoise(tPos * 2.0) - s;
	float t2 = snoise((tPos + 800.0) * 2.0) - s;
	float t3 = snoise((tPos + 1600.0) * 2.0) - s; // Intersect them and get rid of negatives
	float threshold = max(t1 * t2 * t3, 0.0); // Add to red color channel for debugging
	float n1 = noise(tPos, 6, 10, 0.8) * 0.01;
	float n2 = ridgedNoise(tPos, 5, 6.8, 0.75) * 0.015 - 0.01;
	float n3 = snoise(tPos * 0.1) * threshold;
	float n = n1 + n2 + n3;
	// float n = n1 + n2;
	float c = (noise(vec2(tPos.y + n, 0), 4, 6.0, 0.9) + 0.9) / 2.0;
	color = vec4(vec3(160 / 256.0, 60 / 256.0, 0 / 256.0)+c,1);
}
