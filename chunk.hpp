#ifndef CHUNK_HPP
#define CHUNK_HPP
#include "octree.hpp"
#include <functional>
#include <vector>
#include <glm/glm.hpp>
using namespace glm;

class Chunk {
	public:
		static const int CHUNK_SIZE = 32;
		static std::vector<Chunk*> ChunkList;

		Chunk(int x, int y, int z);
		// TODO:Function to update this particular chunk. Unsure what argument to take at this time. In charge of stitching though.
		/**
			Updates this particular chunk with stitching and removing voxels
		*/
		void update();
		void generateMesh(std::vector<GLfloat>& vertexBuffer, std::vector<GLfloat>& normalBuffer, std::vector<int>& indexBuffer);
		void generateSeamMesh(std::vector<GLfloat>& vertexBuffer, std::vector<GLfloat>& normalBuffer, std::vector<int>& indexBuffer);
	private:
		vec3 position;
		Octree* root;
		Octree* seam;

		typedef std::function<bool(const ivec3&, const ivec3&)> FilterNodesFunc;

		Chunk* getChunk(vec3 position);
		std::vector<Octree*> findNodes(FilterNodesFunc func);
};

#endif

