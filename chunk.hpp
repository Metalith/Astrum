#ifndef CHUNK_HPP
#define CHUNK_HPP

#include <vector>
#include <glfw3.h>
#include <unordered_map>

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
			Position(int x, int y, int z): x(x), y(y), z(z) {}
		};

		struct Voxel {
			char corners;
			Position position;
			Voxel(): position({0,0,0}) {}
			Voxel(int x, int y, int z): position({x, y, z}) {}
			Voxel(Voxel const& v): position({v.position.x, v.position.y, v.position.z }) {}
		};

		std::vector<GLfloat> vertices;
		std::vector<GLfloat> normals;
		std::vector<GLfloat> centers;

		float SDF(float x, float y, float z);

		struct ihash : std::unary_function<Position, std::size_t> {
			std::size_t operator()(Position const& p) const
			{
				std::size_t seed = 0;
				boost::hash_combine( seed, p.x );
				boost::hash_combine( seed, p.y );
				boost::hash_combine( seed, p.z );
				return seed;
		}};

		struct iequal_to : std::binary_function<Position, Position, bool> {
			bool operator()(Position const& x, Position const& y) const
			{
				return (x.x == y.x &&
						x.y == y.y &&
						x.z == y.z);
		}};

		std::unordered_map<Position, Voxel, ihash, iequal_to> voxels;
};

#endif
