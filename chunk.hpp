#ifndef CHUNK_HPP
#define CHUNK_HPP

#include <vector>
#include <glfw3.h>
#include "qef.h"
#include <glm/glm.hpp>
using namespace glm;

class Chunk
{
	public:
		static const int CHUNK_SIZE = 32;

		Chunk(int x, int y, int z);
		~Chunk();

		void Update(float dt);
		void Generate();

		std::vector<GLfloat> getVertices();
		std::vector<GLfloat> getNormals();
		std::vector<GLfloat> getCenters();

		static void setSeed(int s);
	private:
		static int seed;
		const int edgevmap[12][2] {{0,4},{1,5},{2,6},{3,7},{0,2},{1,3},{4,6},{5,7},{0,1},{2,3},{4,5},{6,7}};
		const vec3 cornerOffset[8]= {	vec3(-0.5, -0.5, -0.5),
												vec3(-0.5, -0.5,  0.5),
												vec3(-0.5,  0.5, -0.5),
												vec3(-0.5,  0.5,  0.5),
												vec3(0.5,  -0.5, -0.5),
												vec3(0.5,  -0.5,  0.5),
												vec3(0.5,   0.5, -0.5),
												vec3(0.5,   0.5,  0.5)	};

		struct Voxel {
			char			corners;
			vec3			position;
			vec3			drawPos;
			vec3			averageNormal;
			svd::QefData	qef;
			Voxel(): corners(0), position(vec3(0,0,0)) {}
			Voxel(vec3 p): corners(0), position(p) {}
			Voxel(Voxel const& v): corners(v.corners), position(vec3(v.position.x, v.position.y, v.position.z)), qef(v.qef), drawPos(v.drawPos), averageNormal(v.averageNormal) {}
		};

		std::vector<GLfloat> vertices;
		std::vector<GLfloat> normals;
		std::vector<GLfloat> centers;
		std::vector<Voxel> voxels;
		vec3 position;

		float SDF(vec3 v);
		vec3 CalculateSurfaceNormal(const vec3& p);
		vec3 ApproximateZeroCrossingPosition(const vec3& p0, const vec3& p1);
};

#endif
