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
		std::pair<vec3, vec3> getEdge(const vec3& p0, const vec3& p1);
		float SDF(vec3 pos);
	private:
		int size;
		float LOD;
		vec3 pos;
		

		module::Perlin module;
		
		struct Point {
			char material;
			int edges[3] {-1, -1, -1};	// -X, -Y, -Z
		};

		std::vector<Point> points;
		std::vector<vec3> edges;
		vec3 CalculateSurfaceNormal(const vec3& p);
		vec3 ApproximateZeroCrossingPosition(const vec3& p0, const vec3& p1);
};

#endif
