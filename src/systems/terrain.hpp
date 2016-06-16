#ifndef TERRAIN_SYS_HPP
#define TERRAIN_SYS_HPP

#include "system.hpp"
#include "dc/octree.hpp"

#include <vector>

class TerrainSystem: public System {
	public:
		TerrainSystem();
		void update();
	private:
		static const int CHUNK_SIZE;
		std::vector<int> chunkIDs;
		std::vector<Octree*> octreeList;

		Octree* generateSeam(Octree* oct); //TODO: Maybe combine octree generation with seam generation
		Octree* getOctree(vec3 pos);
};
#endif
