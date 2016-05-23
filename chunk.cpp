#include "chunk.hpp"
#include "qef.h"
#include "svd.h"
#include <iostream>
#include <unordered_map>
#include <vector>
#include <glfw3.h>
#include <glm/glm.hpp>
using namespace glm;
#include <boost/assign/std/vector.hpp> // for 'operator+=()'
using namespace boost::assign; // bring 'operator+=()' into scope

#include <noise/noise.h>
using namespace noise;

int Chunk::seed = 0;
module::Perlin myModule; //TODO: Set this inside main.cpp

const char MATERIAL_AIR = 0;
const char MATERIAL_SOLID = 1;

const float QEF_ERROR = 1e-6f;
const int QEF_SWEEPS = 4;

Chunk::Chunk(int x, int y, int z) {
	myModule.SetSeed(seed);
	myModule.SetFrequency (0.5);
	myModule.SetPersistence (0.25);
	position = {float(x),float(y), float(z)};
	Voxel voxel;
	for(int i = -CHUNK_SIZE / 2; i < CHUNK_SIZE / 2; ++i) {
		for (int j = - CHUNK_SIZE / 2; j < CHUNK_SIZE / 2; ++j) {
			for (int k = - CHUNK_SIZE / 2; k < CHUNK_SIZE / 2; ++k) {
				int corners = 0;
				vec3 position = vec3(i + (x * CHUNK_SIZE),j + (y * CHUNK_SIZE),k + (z * CHUNK_SIZE));
				for (int c = 0; c < 8; c++)
				{
					float density = SDF(position + cornerOffset[c]);
					char material = density < 0 ? 1 : 0;
					corners |= (material << c);
				}
				if (corners != 0 && corners != 255)
				{
					voxel = Voxel(position);
					voxel.corners = corners;
					const int MAX_CROSSINGS = 6;
					int edgeCount = 0;
					vec3 averageNormal(0.f);
					svd::QefSolver qef;
					for (int i = 0; i < 12 && edgeCount < MAX_CROSSINGS; i++)
					{
						const int c1 = edgevmap[i][0];
						const int c2 = edgevmap[i][1];

						const int m1 = (corners >> c1) & 1;
						const int m2 = (corners >> c2) & 1;

						if ((m1 == MATERIAL_AIR && m2 == MATERIAL_AIR) ||
								(m1 == MATERIAL_SOLID && m2 == MATERIAL_SOLID))
						{
							// no zero crossing on this edge
							continue;
						}

						const vec3 p1 = position + cornerOffset[c1];
						const vec3 p2 = position + cornerOffset[c2];
						const vec3 p = ApproximateZeroCrossingPosition(p1, p2);
						const vec3 n = CalculateSurfaceNormal(p);

						qef.add(p.x, p.y, p.z, n.x, n.y, n.z);

						averageNormal += n;
						edgeCount++;
					}

					svd::Vec3 qefPosition;
					qef.solve(qefPosition, QEF_ERROR, QEF_SWEEPS, QEF_ERROR);

					voxel.drawPos = vec3(qefPosition.x, qefPosition.y, qefPosition.z);
					voxel.qef = qef.getData();

					const vec3 min = position + vec3(-0.5);
					const vec3 max = position + vec3(0.5);
					if (voxel.drawPos.x < min.x || voxel.drawPos.x > max.x ||
							voxel.drawPos.y < min.y || voxel.drawPos.y > max.y ||
							voxel.drawPos.z < min.z || voxel.drawPos.z > max.z)
					{
						const auto& mp = qef.getMassPoint();
						voxel.drawPos = vec3(mp.x, mp.y, mp.z);
					}
					//std::cout << voxel.drawPos.x << " " << voxel.drawPos.y << " " << voxel.drawPos.z << std::endl;
					voxel.averageNormal = glm::normalize(averageNormal / (float)edgeCount);
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
		centers+=v.drawPos.x,v.drawPos.y,v.drawPos.z;
		std::cout << v.averageNormal.x  << std::endl;
	}
}


std::vector<GLfloat> Chunk::getVertices(){ return vertices;}
std::vector<GLfloat> Chunk::getNormals() { return normals; }
std::vector<GLfloat> Chunk::getCenters() { return centers; }

void Chunk::setSeed(int seed) { Chunk::seed = seed; }

// Returns a value between [-1, 1] 1 is outside and -1 is inside. Should be an easy Signed Density Function
float Chunk::SDF(vec3 p) { return myModule.GetValue(p.x / CHUNK_SIZE, p.y / CHUNK_SIZE, p.z / CHUNK_SIZE); }

vec3 Chunk::CalculateSurfaceNormal(const vec3& p) {
	const float H = 0.001f;
	const float dx = SDF(p + vec3(H, 0.f, 0.f)) - SDF(p - vec3(H, 0.f, 0.f));
	const float dy = SDF(p + vec3(0.f, H, 0.f)) - SDF(p - vec3(0.f, H, 0.f));
	const float dz = SDF(p + vec3(0.f, 0.f, H)) - SDF(p - vec3(0.f, 0.f, H));

	return glm::normalize(vec3(dx, dy, dz));
}

vec3 Chunk::ApproximateZeroCrossingPosition(const vec3& p0, const vec3& p1) {
	// approximate the zero crossing by finding the min value along the edge
	float minValue = 100000.f;
	float t = 0.f;
	float currentT = 0.f;
	const int steps = 8;
	const float increment = 1.f / (float)steps;
	while (currentT <= 1.f)
	{
		const vec3 p = p0 + ((p1 - p0) * currentT);
		const float density = glm::abs(SDF(p));
		if (density < minValue)
		{
			minValue = density;
			t = currentT;
		}

		currentT += increment;
	}

	return p0 + ((p1 - p0) * t);
}


