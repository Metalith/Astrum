#ifndef CHUNK_HPP
#define CHUNK_HPP
#include "dc/octree.hpp"
#include <functional>
#include <vector>
#include <glm/glm.hpp>
using namespace glm;

class Chunk {
	public:
		static const int CHUNK_SIZE = 32;
		static std::vector<Chunk*> ChunkList;

		static Chunk* getChunk(vec3 position);

		Chunk(int x, int y, int z, float LOD);
		// TODO:Function to update this particular chunk. Unsure what argument to take at this time. In charge of stitching though.
		/**
			Updates this particular chunk with stitching and removing voxels
		*/
		void generateSeam();
		void generateMesh(std::vector<GLfloat>& vertexBuffer, std::vector<GLfloat>& normalBuffer, std::vector<int>& indexBuffer);
		void generateSeamMesh(std::vector<GLfloat>& vertexBuffer, std::vector<GLfloat>& normalBuffer, std::vector<int>& indexBuffer);
		void generateBounds(std::vector<GLfloat>& vertexBuffer);
	private:
		vec3 position;
		Octree* root;
		Octree* seam = nullptr;

		typedef std::function<bool(const ivec3&, const ivec3&)> FilterNodesFunc;

		std::vector<Octree*> findNodes(FilterNodesFunc func);
};

#endif

