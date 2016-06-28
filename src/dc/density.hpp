#ifndef DENSITY_HPP
#define DENSITY_HPP

#include <glm/glm.hpp>
using namespace glm;

#include <noise/noise.h>
using namespace noise;

#include <vector>

class DensityField {
	public:
		DensityField(vec3 pos, int size, int LOD);
		char getPoint(vec3 pos);
		float SDF(vec3 pos);
	private:
		int size;
		vec3 pos;
		std::vector<char> points;
		
		module::Perlin module;
		
		struct point {
			char point;
			vec3 edges[3][2];	// -X, -Y, -Z - P, N
		};
};

#endif
