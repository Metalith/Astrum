#ifndef OCTREE_HPP
#define OCTREE_HPP

#include "svd.h"
#include "qef.h"
#include <vector>
#include <functional>
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

typedef std::function<bool(const ivec3&, const ivec3&)> FindNodesFunc;

class Octree {
	public:
		vec3 position;
		Octree* nodes[8] {nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, nullptr};
		float size;
		OctreeNodeType	type;

		Vertex* vertex;
		Octree();
		Octree(vec3 position, std::vector<Octree*>& nodes, float size);
		Octree(vec3 position, float size, float LOD);

	private:
		static int seed;
		bool GenerateVertex();
};
void setSDF();
void GenerateMeshFromOctree(Octree* node, std::vector<GLfloat>& vertexBuffer, std::vector<GLfloat>& normalBuffer, std::vector<int>& indexBuffer);
void Octree_FindNodes(Octree* node, FindNodesFunc& func, std::vector<Octree*>& nodes);
#endif
