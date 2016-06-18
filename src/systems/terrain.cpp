#include "systems/terrain.hpp"
#include "systems/system.hpp"
#include "components/mesh.hpp"
#include "dc/octree.hpp"
#include <iostream>

#include "engine.hpp"

Engine* System::engine;

const int TerrainSystem::CHUNK_SIZE = 32;
const float LOD = 4.f;

TerrainSystem::TerrainSystem() {
	std::cout << "New System :: Terrain!" << std::endl;
	int e = 0;
	Mesh* mesh;
	Octree* octree;
	int SIZE = 2;
	for (int i = SIZE; i >= -SIZE; i--) //TODO: Speed up chunk generation. Severely limiting.
		for (int j = 1; j >= -1; j--)
			for (int k = SIZE; k >= -SIZE; k--) {

				mesh = new Mesh();
				e = System::engine->createEntity();
				System::engine->addComponent(e, mesh);
				chunkIDs.push_back(e);

				octree = new Octree(vec3(i * CHUNK_SIZE, j * CHUNK_SIZE, k * CHUNK_SIZE), CHUNK_SIZE, LOD);
				octreeList.push_back(octree);
				GenerateMeshFromOctree(octree, mesh->vertices, mesh->normals, mesh->indices);
				GenerateMeshFromOctree(generateSeam(octree), mesh->vertices, mesh->normals, mesh->indices);
				std::cout<<"Generated Chunk at " << i  << " " << j << " " << k << std::endl;
			}
}

void TerrainSystem::update() {
}

Octree* TerrainSystem::generateSeam(Octree* oct) {
	const ivec3 baseOctreePos = oct->position;
	const ivec3 seamValues = baseOctreePos + ivec3(CHUNK_SIZE / 2);

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
	Octree* o = nullptr;
	for (int i = 0; i < 8; i++)
	{
		const ivec3 offset   = OFFSETS[i] * CHUNK_SIZE;
		const ivec3 octreePos = baseOctreePos + offset;
		if( (o = getOctree(octreePos)) != nullptr )
		{
			std::vector<Octree*> nodes;
			Octree_FindNodes(o, selectionFuncs[i], nodes);
			seamNodes.insert(end(seamNodes), begin(nodes), end(nodes));
		}
	}
	return new Octree(vec3(seamValues), seamNodes, CHUNK_SIZE*2);
}

Octree* TerrainSystem::getOctree(vec3 pos) {
	for (auto oct : octreeList)
		if (oct->position == pos) return oct;
	return nullptr;
}