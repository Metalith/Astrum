#include "chunk.hpp"
#include <iostream>
#include <vector>
#include <glfw3.h>

#include <boost/unordered_map.hpp>
#include <boost/tuple/tuple.hpp>
#include <boost/assign/std/vector.hpp> // for 'operator+=()'
using namespace boost::assign; // bring 'operator+=()' into scope

#include <noise/noise.h>
using namespace noise;

int Chunk::seed = 0;

Chunk::Chunk(int x, int y, int z) {
	module::Perlin myModule;
	myModule.SetSeed(seed);
  	myModule.SetFrequency (0.5);
  	myModule.SetPersistence (0.25);
	position = boost::make_tuple(x, y, z);
	for(int i = -CHUNK_SIZE / 2; i < CHUNK_SIZE / 2; ++i)
		// for (int j = - CHUNK_SIZE / 2; j < CHUNK_SIZE / 2; ++j)
			for (int k = - CHUNK_SIZE / 2; k < CHUNK_SIZE / 2; ++k)
				for (int j = - CHUNK_SIZE / 2; j < myModule.GetValue(double(i + (x * CHUNK_SIZE)) / 32.0, double(k + (z * CHUNK_SIZE)) / 32.0, 0) * CHUNK_SIZE / 2.0; ++j)
				voxels[boost::make_tuple(i + (x * CHUNK_SIZE),j + (y * CHUNK_SIZE), k + (z * CHUNK_SIZE))] = 1;
	Generate();
}

Chunk::~Chunk() {

}


void Chunk::Update(float dt) {}
void Chunk::Generate() {
	for(boost::unordered_map<boost::tuple<int,int,int>, unsigned char>::iterator it=voxels.begin(); it!=voxels.end(); ++it) {
		int x = it->first.get<0>();
   		int y = it->first.get<1>();
   		int z = it->first.get<2>();   														  	
   		if (voxels.find(boost::make_tuple(x+1,y,z)) == voxels.end()) { 
   			vertices+=	x + 0.5, y + 0.5, z + 0.5, // RIGHT FACE +X
				  		x + 0.5, y - 0.5, z + 0.5,
				  		x + 0.5, y + 0.5, z - 0.5,
				  		x + 0.5, y - 0.5, z + 0.5,
				  		x + 0.5, y - 0.5, z - 0.5,
				  		x + 0.5, y + 0.5, z - 0.5;
			for (int i = 0; i < 6; i++) normals+=1,0,0;
		}
   		if (voxels.find(boost::make_tuple(x,y+1,z)) == voxels.end()) {
   			vertices+=	x + 0.5, y + 0.5, z + 0.5, // TOP FACE +Y
					  	x + 0.5, y + 0.5, z - 0.5,
					  	x - 0.5, y + 0.5, z + 0.5,
					  	x + 0.5, y + 0.5, z - 0.5,
					  	x - 0.5, y + 0.5, z - 0.5,
					  	x - 0.5, y + 0.5, z + 0.5;
			for (int i = 0; i < 6; i++) normals+=0,1,0;
		}							  	
   		if (voxels.find(boost::make_tuple(x,y,z+1)) == voxels.end()) {
   			vertices+=	x + 0.5, y + 0.5, z + 0.5, // FRONT FACE +Z
					  	x - 0.5, y + 0.5, z + 0.5,
					  	x + 0.5, y - 0.5, z + 0.5,
					  	x - 0.5, y + 0.5, z + 0.5,
					  	x - 0.5, y - 0.5, z + 0.5,
					  	x + 0.5, y - 0.5, z + 0.5;							  		
			for (int i = 0; i < 6; i++) normals+=0,0,1;
		}
		if (voxels.find(boost::make_tuple(x-1,y,z)) == voxels.end()) { 
   			vertices+=	x - 0.5, y + 0.5, z + 0.5,
				  		x - 0.5, y + 0.5, z - 0.5, // LEFT FACE -X
				  		x - 0.5, y - 0.5, z + 0.5,
				  		x - 0.5, y - 0.5, z + 0.5,
				  		x - 0.5, y + 0.5, z - 0.5,
				  		x - 0.5, y - 0.5, z - 0.5;
			for (int i = 0; i < 6; i++) normals+=-1,0,0;
		}
   		if (voxels.find(boost::make_tuple(x,y-1,z)) == voxels.end()) {
   			vertices+=	x + 0.5, y - 0.5, z + 0.5,
					  	x - 0.5, y - 0.5, z + 0.5, // BOTTOM FACE -Y
					  	x + 0.5, y - 0.5, z - 0.5,
					  	x - 0.5, y - 0.5, z - 0.5,
					  	x + 0.5, y - 0.5, z - 0.5,
					  	x - 0.5, y - 0.5, z + 0.5;
			for (int i = 0; i < 6; i++) normals+=0,-1,0;
		}							  	
   		if (voxels.find(boost::make_tuple(x,y,z-1)) == voxels.end()) {
   			vertices+=	x + 0.5, y + 0.5, z - 0.5, // BACK FACE -Z
					  	x + 0.5, y - 0.5, z - 0.5,
					  	x - 0.5, y + 0.5, z - 0.5,
					  	x - 0.5, y - 0.5, z - 0.5,
					  	x - 0.5, y + 0.5, z - 0.5,
					  	x + 0.5, y - 0.5, z - 0.5;							  		
			for (int i = 0; i < 6; i++) normals+=0,0,-1;
		}
   	}
}


std::vector<GLfloat> Chunk::getVertices(){ return vertices;}
std::vector<GLfloat> Chunk::getNormals() { return normals; }

void Chunk::setSeed(int seed) { Chunk::seed = seed; }
