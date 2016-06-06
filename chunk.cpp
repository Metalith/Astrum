#include "chunk.hpp"
#include "octree.hpp"
#include <iostream>
#include <vector>
#include <functional>
#include <glm/glm.hpp>
using namespace glm;
#include <boost/assign/std/vector.hpp> // for 'operator+=()'
using namespace boost::assign; // bring 'operator+=()' into scope

std::vector<Chunk*> Chunk::ChunkList;
const int CHUNK_SIZE = 32;
typedef std::function<bool(const ivec3&, const ivec3&)> FilterNodesFunc;

Chunk::Chunk(int x, int y, int z) {
	this->root = new Octree(vec3(x * CHUNK_SIZE, y * CHUNK_SIZE, z * CHUNK_SIZE), CHUNK_SIZE);
	this->position = ivec3(x, y, z);
	ChunkList+=this;
}
void Chunk::update() {
	const ivec3 baseChunkPos = this->position;
	const ivec3 seamValues = ivec3(root->position) + ivec3(static_cast<int>(CHUNK_SIZE) / 2);
	const ivec3 OFFSETS[8] =
	{
		ivec3(0,0,0), ivec3(1,0,0), ivec3(0,0,1), ivec3(1,0,1),
		ivec3(0,1,0), ivec3(1,1,0), ivec3(0,1,1), ivec3(1,1,1)
	};

	std::function<bool(const ivec3&, const ivec3&)> selectionFuncs[8] =
	{
		[&](const ivec3& min, const ivec3& max)
		{
			return max.x == seamValues.x || max.y == seamValues.y || max.z == seamValues.z;
		},

		[&](const ivec3& min, const ivec3& max)
		{
			return min.x == seamValues.x;
		},

		[&](const ivec3& min, const ivec3& max)
		{
			return min.z == seamValues.z;
		},

		[&](const ivec3& min, const ivec3& max)
		{
			return min.x == seamValues.x && min.z == seamValues.z;
		},

		[&](const ivec3& min, const ivec3& max)
		{
			return min.y == seamValues.y;
		},

		[&](const ivec3& min, const ivec3& max)
		{
			return min.x == seamValues.x && min.y == seamValues.y;
		},

		[&](const ivec3& min, const ivec3& max)
		{
			return min.y == seamValues.y && min.z == seamValues.z;
		},

		[&](const ivec3& min, const ivec3& max)
		{
			return min.x == seamValues.x && min.y == seamValues.y && min.z == seamValues.z;
		}
	};

	std::vector<Octree*> seamNodes;
	for (int i = 0; i < 8; i++)
	{
		const ivec3 offset   = OFFSETS[i] * static_cast<int>(CHUNK_SIZE);
		const ivec3 chunkPos = baseChunkPos + OFFSETS[i];
		//std::cout << chunkPos.x << " " << chunkPos.y << " " << chunkPos.z << std::endl;
		if (Chunk* c = getChunk(chunkPos))
		{
			auto chunkNodes = c->findNodes(selectionFuncs[i]);
			seamNodes.insert(end(seamNodes), begin(chunkNodes), end(chunkNodes));
		}
	}
	//this->seam = nullptr;
	this->seam = new Octree(vec3(seamValues), seamNodes, CHUNK_SIZE*2);
}

std::vector<Octree*> Chunk::findNodes(FilterNodesFunc filterFunc)
{
	std::vector<Octree*> nodes;
	Octree_FindNodes(root, filterFunc, nodes);
	return nodes;
}

void Chunk::generateMesh(std::vector<GLfloat>& vertexBuffer, std::vector<GLfloat>& normalBuffer, std::vector<int>& indexBuffer) {
	GenerateMeshFromOctree(root, vertexBuffer, normalBuffer, indexBuffer);
}

void Chunk::generateSeamMesh(std::vector<GLfloat>& vertexBuffer, std::vector<GLfloat>& normalBuffer, std::vector<int>& indexBuffer) {
	GenerateMeshFromOctree(seam, vertexBuffer, normalBuffer, indexBuffer);
}
Chunk* Chunk::getChunk(vec3 position) {
	for (auto chunk : ChunkList)
		if (chunk->position == position) return chunk;
	//std::cout << "did not find chunk" << std::endl;
	return nullptr;
}
