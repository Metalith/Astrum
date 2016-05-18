#ifndef CHUNK_HPP
#define CHUNK_HPP

#include <vector>
#include <glfw3.h>

#include <boost/unordered_map.hpp>
#include <boost/tuple/tuple.hpp>

class Chunk
{
public:
    Chunk(int x, int y, int z);
    ~Chunk();

    void Update(float dt);
    void Generate();

 	std::vector<GLfloat> getVertices();
 	std::vector<GLfloat> getNormals();

 	static void setSeed(int s);
private:
	static int seed;
    static const int CHUNK_SIZE = 16;

    char corners;
    boost::tuple<int,int,int> position;

    std::vector<GLfloat> vertices;
	std::vector<GLfloat> normals;

	struct ihash : std::unary_function<boost::tuple<int,int,int>, std::size_t> {
    std::size_t operator()(boost::tuple<int,int,int> const& p) const
    {
        std::size_t seed = 0;
        boost::hash_combine( seed, p.get<0>() );
        boost::hash_combine( seed, p.get<1>() );
        boost::hash_combine( seed, p.get<2>() );
        return seed;
    }};

	struct iequal_to : std::binary_function<boost::tuple<int,int,int>, boost::tuple<int,int,int>, bool> {
    bool operator()(boost::tuple<int,int,int> const& x, boost::tuple<int,int,int> const& y) const
    {
        return ( x.get<0>()==y.get<0>() &&
                 x.get<1>()==y.get<1>() &&
                 x.get<2>()==y.get<2>());
    }};

	boost::unordered_map<boost::tuple<int,int,int>, unsigned char, ihash, iequal_to> voxels;
};

#endif
