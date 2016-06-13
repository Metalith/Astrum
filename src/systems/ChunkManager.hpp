#ifndef CHUNKMANAGER_HPP
#define CHUNKMANAGER_HPP
#include "chunk.hpp"
#include <vector>
#include <mutex>
#include <glm/glm.hpp>
using namespace glm;
class ChunkManager {
	public:
		ChunkManager(std::vector<GLfloat>& vertices, std::vector<GLfloat>& normals, std::vector<int>& indices, std::vector<GLfloat>& bounds);
		void generate(int x, int y, int z);
		bool hasNewChunks();
	private:
		static std::mutex mutex;
		static std::vector<GLfloat> *vertices;
		static std::vector<GLfloat> *normals;
		static std::vector<int>		*indices;
		static std::vector<GLfloat> *bounds;
		static std::vector<Chunk*> ChunkList;
		static bool newChunks;
		
		static void createChunk(int x, int y, int z);
};

#endif
