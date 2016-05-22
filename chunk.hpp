#ifndef CHUNK_HPP
#define CHUNK_HPP

#include <vector>
#include <glfw3.h>

class Chunk
{
	public:
		static const int CHUNK_SIZE = 32;

		Chunk(int x, int y, int z);
		~Chunk();

		void Update(float dt);
		void Generate();

		std::vector<GLfloat> getVertices();
		std::vector<GLfloat> getNormals();
		std::vector<GLfloat> getCenters();

		static void setSeed(int s);
	private:
		static int seed;

		struct Position {
			int x, y, z;
		};

		struct Voxel {
			char corners;
			Position position;
			Voxel(): corners(0), position({0,0,0}) {}
			Voxel(int x, int y, int z): corners(0), position({x, y, z}) {}
			Voxel(Voxel const& v): corners(v.corners), position({v.position.x, v.position.y, v.position.z }) {}
		};

		std::vector<GLfloat> vertices;
		std::vector<GLfloat> normals;
		std::vector<GLfloat> centers;
		std::vector<Voxel> voxels;
		Position position;

		float SDF(float x, float y, float z);
};

#endif
