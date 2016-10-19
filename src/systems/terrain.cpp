#include "systems/terrain.hpp"
#include "systems/render.hpp"
#include "systems/system.hpp"
#include "components/mesh.hpp"
#include "dc/octree.hpp"
#include "dc/density.hpp"
#include <iostream>

#include "engine.hpp"

Engine* System::engine;

const int TerrainSystem::CHUNK_SIZE = 32;
const float LOD = 1.0f;

TerrainSystem::TerrainSystem() {
	std::cout << "New System :: Terrain!" << std::endl;
	int e = 0;
	Mesh* mesh;
	Octree* octree;
	int SIZE = 1;
	double lastTime = glfwGetTime();
	for (int i = SIZE; i >= 0; i--) {
		for (int j = SIZE; j >= -0; j--) {
			for (int k = SIZE; k >= 0; k--) {

				mesh = new Mesh();
				e = System::engine->createEntity();
				System::engine->addComponent(e, mesh);
				chunkIDs.push_back(e);

				DensityField* DF = new DensityField(vec3(i * CHUNK_SIZE, j * CHUNK_SIZE, k * CHUNK_SIZE) - vec3(0.5 * CHUNK_SIZE), CHUNK_SIZE, LOD);
				octree = new Octree(vec3(i * CHUNK_SIZE, j * CHUNK_SIZE, k * CHUNK_SIZE) - vec3(0.5 * CHUNK_SIZE), CHUNK_SIZE, LOD, DF);
				octreeList.push_back(octree);
				GenerateMeshFromOctree(octree, mesh->vertices, mesh->normals, mesh->indices); //TODO: COMBINE THESE TWO LINES
				GenerateMeshFromOctree(generateSeam(octree), mesh->vertices, mesh->normals, mesh->indices);
				GenerateBoundsFromOctree(octree, mesh->bounds);
				std::cout<<"Generated Chunk at " << i  << " " << j << " " << k << std::endl;
			}
		}
	}
	// 24.35 16.55 12.525
	// std::cout << CSN(vec3(24.35, 16.55, 12.525)).x << " ";
	// std::cout << ( vec3(24.35, 16.55, 12.525) / vec3(32.0) ).x;
	// std::cout << glfwGetTime() - lastTime << " Seconds to generate 9 Chunks"  << std::endl;
	loadedChunks = octreeList.size();
	RenderSystem::showDebug(CHUNK_SIZE, "Chunk Size");
	RenderSystem::showDebug(loadedChunks, "Loaded Chunks");
}

vec3 CSN(const vec3& p) {
	module::Perlin module;
	module.SetSeed(0);
	module.SetFrequency (0.5);
	module.SetPersistence (0.25);
	const float H = 0.001f;
	const float dx = d(p + vec3(H, 0.f, 0.f)) - d(p - vec3(H, 0.f, 0.f));
	const float dy = d(p + vec3(0.f, H, 0.f)) - d(p - vec3(0.f, H, 0.f));
	const float dz = d(p + vec3(0.f, 0.f, H)) - d(p - vec3(0.f, 0.f, H));

	return glm::normalize(vec3(dx, dy, dz));
}

float d(const vec3& p) {
	return length(p) - 32;
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
