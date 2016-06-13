#include "ChunkManager.hpp"

#include "chunk.hpp"
#include <iostream>
#include <vector>
#include <thread>
#include <mutex>
#include <glfw3.h>
#include <glm/glm.hpp>
using namespace glm;

std::vector<GLfloat> *ChunkManager::vertices;
std::vector<GLfloat> *ChunkManager::normals;
std::vector<GLfloat> *ChunkManager::bounds;
std::vector<int>	 *ChunkManager::indices;
std::vector<Chunk*> ChunkManager::ChunkList;
std::mutex ChunkManager::mutex;
bool ChunkManager::newChunks;

const ivec3 OFFSETS[8] =
{
	ivec3(0,0,0), ivec3(1,0,0), ivec3(0,0,1), ivec3(1,0,1),
	ivec3(0,1,0), ivec3(1,1,0), ivec3(0,1,1), ivec3(1,1,1)
};
ChunkManager::ChunkManager(std::vector<GLfloat>& vertices, std::vector<GLfloat>& normals, std::vector<int>& indices, std::vector<GLfloat>& bounds){
	ChunkManager::vertices=&vertices;
	ChunkManager::normals=&normals;
	ChunkManager::indices=&indices;
	ChunkManager::bounds=&bounds;
	ChunkManager::newChunks=false;
}
void ChunkManager::generate(int x, int y, int z) {
	std::thread t(createChunk, x, y, z);
	t.detach();	
}

bool ChunkManager::hasNewChunks() {
	if (newChunks) {
		newChunks = false;
		return true;
	}
	return false;
}

void ChunkManager::createChunk(int x, int y, int z) {
	Chunk* c = new Chunk(x, y, z, 2.f);
	Chunk* t;
	for (int i = 0; i < 8; i++) {
		if ((t = c->getChunk(vec3(x - OFFSETS[i].x, y - OFFSETS[i].y, z - OFFSETS[i].z))) != nullptr) {
			t->generateSeam();
			mutex.lock();
			t->generateSeamMesh(*vertices, *normals, *indices);
			mutex.unlock();
		}
	}
	std::lock_guard<std::mutex> guard(mutex);
	c->generateMesh(*vertices, *normals, *indices);
	c->generateBounds(*bounds);
	newChunks = true;	
	//std::cout << "Generated by Thread" << std::endl;
}