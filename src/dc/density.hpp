#ifndef DENSITY_HPP
#define DENSITY_HPP

#include <glm/glm.hpp>
using namespace glm;

#include <noise/noise.h>
using namespace noise;

#include <vector>

class DensityField {
	public:
		DensityField(vec3 pos, int size, float LOD);
		char getPoint(vec3 pos);
		float SDF(vec3 pos);
	private:
		int size;
		float LOD;
		vec3 pos;
		

		module::Perlin module;
		
		struct corner {
			char point;
			vec3 edges[3][2];	// -X, -Y, -Z - P, N
		};

		std::vector<corner> points;
		vec3 CalculateSurfaceNormal(const vec3& p);
		vec3 ApproximateZeroCrossingPosition(const vec3& p0, const vec3& p1);
};

#endif
