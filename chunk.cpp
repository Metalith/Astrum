#include "chunk.hpp"
#include <iostream>
#include <unordered_map>
#include <vector>
#include <glfw3.h>

#include <boost/assign/std/vector.hpp> // for 'operator+=()'
using namespace boost::assign; // bring 'operator+=()' into scope

#include <noise/noise.h>
using namespace noise;

int Chunk::seed = 0;
module::Perlin myModule; //TODO: Set this inside main.cpp
const float cornerOffset[24]  { -0.5, -0.5, -0.5,
								-0.5, -0.5,  0.5,
								-0.5,  0.5, -0.5,
								-0.5,  0.5,  0.5,
								0.5,  -0.5, -0.5,
								0.5,  -0.5,  0.5,
								0.5,  0.5,  -0.5,
								0.5,  0.5,   0.5};

Chunk::Chunk(int x, int y, int z) {
	myModule.SetSeed(seed);
	myModule.SetFrequency (0.5);
	myModule.SetPersistence (0.25);
	position = {x, y, z};
	Voxel voxel;
	for(int i = -CHUNK_SIZE / 2; i < CHUNK_SIZE / 2; ++i) {
		for (int j = - CHUNK_SIZE / 2; j < CHUNK_SIZE / 2; ++j) {
			for (int k = - CHUNK_SIZE / 2; k < CHUNK_SIZE / 2; ++k) {
				int corners = 0;
				for (int c = 0; c < 8; c++)
				{
					float density = SDF(double(i + (x * CHUNK_SIZE) + cornerOffset[3*c]) / CHUNK_SIZE,double(j + (y * CHUNK_SIZE) + cornerOffset[3*c + 1]) / CHUNK_SIZE,double(k + (z * CHUNK_SIZE) + cornerOffset[3*c + 2]) / CHUNK_SIZE);
					char material = density < 0 ? 1 : 0;
					corners |= (material << c);
				}

				if (corners != 0 && corners != 255)
				{
					voxel = Voxel(i + (x * CHUNK_SIZE),j + (y * CHUNK_SIZE), k + (z * CHUNK_SIZE));
					voxel.corners = corners;
					voxels += voxel;
				}
			}
		}
	}
	Generate();
}

Chunk::~Chunk() {}

void Chunk::Update(float dt) {}
void Chunk::Generate() {
	for (auto const& v : voxels) {
		int x = v.position.x;
		int y = v.position.y;
		int z = v.position.z;
		//if (voxels.find({x+1, y, z}) == voxels.end()) {
		vertices+=	x + 0.5, y + 0.5, z + 0.5, // RIGHT FACE +X
			x + 0.5, y - 0.5, z + 0.5,
			x + 0.5, y + 0.5, z - 0.5,
			x + 0.5, y - 0.5, z + 0.5,
			x + 0.5, y - 0.5, z - 0.5,
			x + 0.5, y + 0.5, z - 0.5;
		for (int i = 0; i < 6; i++) normals+=1,0,0;
		//}
		//if (voxels.find({x,y+1,z}) == voxels.end()) {
		vertices+=	x + 0.5, y + 0.5, z + 0.5, // TOP FACE +Y
			x + 0.5, y + 0.5, z - 0.5,
			x - 0.5, y + 0.5, z + 0.5,
			x + 0.5, y + 0.5, z - 0.5,
			x - 0.5, y + 0.5, z - 0.5,
			x - 0.5, y + 0.5, z + 0.5;
		for (int i = 0; i < 6; i++) normals+=0,1,0;
		//}
		//if (voxels.find({x,y,z+1}) == voxels.end()) {
		vertices+=	x + 0.5, y + 0.5, z + 0.5, // FRONT FACE +Z
			x - 0.5, y + 0.5, z + 0.5,
			x + 0.5, y - 0.5, z + 0.5,
			x - 0.5, y + 0.5, z + 0.5,
			x - 0.5, y - 0.5, z + 0.5,
			x + 0.5, y - 0.5, z + 0.5;
		for (int i = 0; i < 6; i++) normals+=0,0,1;
		//}
		//if (voxels.find({x-1,y,z}) == voxels.end()) {
		vertices+=	x - 0.5, y + 0.5, z + 0.5,
			x - 0.5, y + 0.5, z - 0.5, // LEFT FACE -X
			x - 0.5, y - 0.5, z + 0.5,
			x - 0.5, y - 0.5, z + 0.5,
			x - 0.5, y + 0.5, z - 0.5,
			x - 0.5, y - 0.5, z - 0.5;
		for (int i = 0; i < 6; i++) normals+=-1,0,0;
		//}
		//if (voxels.find({x,y-1,z}) == voxels.end()) {
		vertices+=	x + 0.5, y - 0.5, z + 0.5,
			x - 0.5, y - 0.5, z + 0.5, // BOTTOM FACE -Y
			x + 0.5, y - 0.5, z - 0.5,
			x - 0.5, y - 0.5, z - 0.5,
			x + 0.5, y - 0.5, z - 0.5,
			x - 0.5, y - 0.5, z + 0.5;
		for (int i = 0; i < 6; i++) normals+=0,-1,0;
		//}
		//if (voxels.find({x,y,z-1}) == voxels.end()) {
		vertices+=	x + 0.5, y + 0.5, z - 0.5, // BACK FACE -Z
			x + 0.5, y - 0.5, z - 0.5,
			x - 0.5, y + 0.5, z - 0.5,
			x - 0.5, y - 0.5, z - 0.5,
			x - 0.5, y + 0.5, z - 0.5,
			x + 0.5, y - 0.5, z - 0.5;
		for (int i = 0; i < 6; i++) normals+=0,0,-1;
		//}
		centers+=x,y,z;
	}
}


std::vector<GLfloat> Chunk::getVertices(){ return vertices;}
std::vector<GLfloat> Chunk::getNormals() { return normals; }
std::vector<GLfloat> Chunk::getCenters() { return centers; }

void Chunk::setSeed(int seed) { Chunk::seed = seed; }

// Returns a value between [-1, 1] 1 is outside and -1 is inside. Should be an easy Signed Density Function
float Chunk::SDF(float x, float y, float z) {
	return myModule.GetValue(x, y, z);
}
