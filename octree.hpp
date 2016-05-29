#ifndef OCTREE_HPP
#define OCTREE_HPP

#include "svd.h"
#include "qef.h"
#include <vector>
#include <glfw3.h>
#include <glm/glm.hpp>
using namespace glm;
#include <noise/noise.h>
using namespace noise;

enum OctreeNodeType
{
	Node_None,
	Node_Internal,
	Node_Psuedo,
	Node_Leaf,
};

struct Vertex {
	char			corners;
	int				index;
	vec3			position;
	vec3			averageNormal;
	svd::QefData	qef;
	Vertex(): index(-1), corners(0), position(10,10,10) {}
	Vertex(vec3 p): index(-1), corners(0), position(p) {}
	Vertex(Vertex const& v): index(v.index), corners(v.corners), position(vec3(v.position.x, v.position.y, v.position.z)), qef(v.qef), averageNormal(v.averageNormal) {}
};

class Octree {
	public:
		vec3 position;
		Octree* nodes[8];
		int size;
		OctreeNodeType	type;

		Vertex* vertex;
		Octree();
		Octree(vec3 position, int size);

		std::vector<GLfloat> getVertices();
	private:
		static int seed;
		static vec3 cornerOffset[8];	
		const int edgevmap[12][2] {{0,4},{1,5},{2,6},{3,7},{0,2},{1,3},{4,6},{5,7},{0,1},{2,3},{4,5},{6,7}};

		static std::vector<GLfloat> Vertices;
		bool GenerateVertex();
};
void GenerateMeshFromOctree(Octree* node, std::vector<GLfloat>& vertexBuffer, std::vector<GLfloat>& normalBuffer, std::vector<int>& indexBuffer);
#endif
