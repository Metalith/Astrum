#include "octree.hpp"

module::Perlin testModule;

#include <iostream>
#include <vector>
#include <glfw3.h>
#include <glm/glm.hpp>
using namespace glm;

#include <noise/noise.h>
using namespace noise;

#include <boost/assign/std/vector.hpp> // for 'operator+=()'
using namespace boost::assign; // bring 'operator+=()' into scope

float SDF(vec3 position);
void setSDF();
vec3 ApproximateZeroCrossingPosition(const vec3& p0, const vec3& p1);
vec3 CalculateSurfaceNormal(const vec3& p);

int Octree::seed = 0;
vec3 Octree::cornerOffset[8] {  vec3(-0.5, -0.5, -0.5),
								vec3(-0.5, -0.5,  0.5),
								vec3(-0.5,  0.5, -0.5),
								vec3(-0.5,  0.5,  0.5),
								vec3(0.5,  -0.5, -0.5),
								vec3(0.5,  -0.5,  0.5),
								vec3(0.5,   0.5, -0.5),
								vec3(0.5,   0.5,  0.5)	};

const float QEF_ERROR = 1e-6f;
const int QEF_SWEEPS = 4;
const int MATERIAL_AIR = 0;
const int MATERIAL_SOLID = 1;


// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// data from the original DC impl, drives the contouring process

const int edgevmap[12][2] = 
{
	{0,4},{1,5},{2,6},{3,7},	// x-axis 
	{0,2},{1,3},{4,6},{5,7},	// y-axis
	{0,1},{2,3},{4,5},{6,7}		// z-axis
};

const int edgemask[3] = { 5, 3, 6 } ;

const int vertMap[8][3] = 
{
	{0,0,0},
	{0,0,1},
	{0,1,0},
	{0,1,1},
	{1,0,0},
	{1,0,1},
	{1,1,0},
	{1,1,1}
};

const int faceMap[6][4] = {{4, 8, 5, 9}, {6, 10, 7, 11},{0, 8, 1, 10},{2, 9, 3, 11},{0, 4, 2, 6},{1, 5, 3, 7}} ;
const int cellProcFaceMask[12][3] = {{0,4,0},{1,5,0},{2,6,0},{3,7,0},{0,2,1},{4,6,1},{1,3,1},{5,7,1},{0,1,2},{2,3,2},{4,5,2},{6,7,2}} ;
const int cellProcEdgeMask[6][5] = {{0,1,2,3,0},{4,5,6,7,0},{0,4,1,5,1},{2,6,3,7,1},{0,2,4,6,2},{1,3,5,7,2}} ;

const int faceProcFaceMask[3][4][3] = {
	{{4,0,0},{5,1,0},{6,2,0},{7,3,0}},
	{{2,0,1},{6,4,1},{3,1,1},{7,5,1}},
	{{1,0,2},{3,2,2},{5,4,2},{7,6,2}}
} ;

const int faceProcEdgeMask[3][4][6] = {
	{{1,4,0,5,1,1},{1,6,2,7,3,1},{0,4,6,0,2,2},{0,5,7,1,3,2}},
	{{0,2,3,0,1,0},{0,6,7,4,5,0},{1,2,0,6,4,2},{1,3,1,7,5,2}},
	{{1,1,0,3,2,0},{1,5,4,7,6,0},{0,1,5,0,4,1},{0,3,7,2,6,1}}
};

const int edgeProcEdgeMask[3][2][5] = {
	{{3,2,1,0,0},{7,6,5,4,0}},
	{{5,1,4,0,1},{7,3,6,2,1}},
	{{6,4,2,0,2},{7,5,3,1,2}},
};

const int processEdgeMask[3][4] = {{3,2,1,0},{7,5,6,4},{11,10,9,8}} ;

std::vector<GLfloat> Octree::Vertices;

Octree::Octree() {
	this->position = vec3(10,10,10);
}
Octree::Octree(vec3 position, int size) {
	this->position = position;
	this->size=size;
	this->type = Node_Internal;
	if (size > 1)
		for (int i = 0; i < 8; i++) {
			Octree* node = new Octree(position+(cornerOffset[i] * vec3(size/2)),size/2);
			nodes[i]=node;
		}
	else
		GenerateVertex();
}

std::vector<GLfloat> Octree::getVertices(){ return Vertices;}

bool Octree::GenerateVertex() {
	this->type = Node_Leaf;

	int corners = 0;
	for (int c = 0; c < 8; c++)
	{
		float density = SDF(position + cornerOffset[c]);
		char material = density < 0 ? 1 : 0;
		corners |= (material << c);
	}
	if (corners == 0 || corners == 255) {
		vertex = new Vertex();
		return false;
	}

	this->vertex = new Vertex();
	vertex->corners = corners;
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

		if ((m1 == 0 && m2 == 1) ||
				(m1 == 1 && m2 == 0))
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

	vertex->position = vec3(qefPosition.x, qefPosition.y, qefPosition.z);
	vertex->qef = qef.getData();

	const vec3 min = position + vec3(-0.5);
	const vec3 max = position + vec3(0.5);
	if (vertex->position.x < min.x || vertex->position.x > max.x ||
			vertex->position.y < min.y || vertex->position.y > max.y ||
			vertex->position.z < min.z || vertex->position.z > max.z)
	{
		const auto& mp = qef.getMassPoint();
		vertex->position = vec3(mp.x, mp.y, mp.z);
	}
	//std::cout << vertex.position.x << " " << vertex.position.y << " " << vertex.position.z << std::endl;
	vertex->averageNormal = glm::normalize(averageNormal / (float)edgeCount);
	vertex->index = Vertices.size();
	Vertices+=vertex->position.x, vertex->position.y, vertex->position.z;
}

void setSDF() {
	testModule.SetSeed(0);
	testModule.SetFrequency (0.5);
	testModule.SetPersistence (0.25);
}

float SDF(vec3 p) { return testModule.GetValue(p.x / 32.0f, p.y / 32.0f, p.z / 32.0f); }

vec3 CalculateSurfaceNormal(const vec3& p) {
	const float H = 0.001f;
	const float dx = SDF(p + vec3(H, 0.f, 0.f)) - SDF(p - vec3(H, 0.f, 0.f));
	const float dy = SDF(p + vec3(0.f, H, 0.f)) - SDF(p - vec3(0.f, H, 0.f));
	const float dz = SDF(p + vec3(0.f, 0.f, H)) - SDF(p - vec3(0.f, 0.f, H));

	return glm::normalize(vec3(dx, dy, dz));
}

vec3 ApproximateZeroCrossingPosition(const vec3& p0, const vec3& p1) {
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

// ----------------------------------------------------------------------------

void GenerateVertexIndices(Octree* node, std::vector<GLfloat>& vertexBuffer)
{	
	if (!node)
	{
		return;
	}

	if (node->type != Node_Leaf)
	{
		for (int i = 0; i < 8; i++)
		{
			GenerateVertexIndices(node->nodes[i], vertexBuffer);
		}
	}

	if (node->type != Node_Internal)
	{
		Vertex* v = node->vertex;
		if (!v)
		{
			printf("Error! Could not add vertex!\n");
			exit(EXIT_FAILURE);
		}
		if (v->index > -1) {
			v->index = vertexBuffer.size() / 3;
			vertexBuffer+=v->position.x, v->position.y, v->position.z;
		}
	}
}

// ----------------------------------------------------------------------------

void ContourProcessEdge(Octree* node[4], int dir, std::vector<int>& indexBuffer)
{
	int minSize = 1000000;		// arbitrary big number
	int minIndex = 0;
	int indices[4] = { -1, -1, -1, -1 };
	bool flip = false;
	bool signChange[4] = { false, false, false, false };

	for (int i = 0; i < 4; i++)
	{
		const int edge = processEdgeMask[dir][i];
		const int c1 = edgevmap[edge][0];
		const int c2 = edgevmap[edge][1];

		const int m1 = (node[i]->vertex->corners >> c1) & 1;
		const int m2 = (node[i]->vertex->corners >> c2) & 1;

		if (node[i]->size < minSize)
		{
			minSize = node[i]->size;
			minIndex = i;
			flip = m1 != MATERIAL_AIR; 
		}

		indices[i] = node[i]->vertex->index;

		signChange[i] = 
			(m1 == MATERIAL_AIR && m2 != MATERIAL_AIR) ||
			(m1 != MATERIAL_AIR && m2 == MATERIAL_AIR);
	}

	if (signChange[minIndex])
	{
		if (!flip)
		{
			indexBuffer.push_back(indices[0]);
			indexBuffer.push_back(indices[1]);
			indexBuffer.push_back(indices[3]);

			indexBuffer.push_back(indices[0]);
			indexBuffer.push_back(indices[3]);
			indexBuffer.push_back(indices[2]);
		}
		else
		{
			indexBuffer.push_back(indices[0]);
			indexBuffer.push_back(indices[3]);
			indexBuffer.push_back(indices[1]);

			indexBuffer.push_back(indices[0]);
			indexBuffer.push_back(indices[2]);
			indexBuffer.push_back(indices[3]);
		}
	}
}

// ----------------------------------------------------------------------------

void ContourEdgeProc(Octree* node[4], int dir, std::vector<int>& indexBuffer)
{
	if (!node[0] || !node[1] || !node[2] || !node[3])
	{
		return;
	}

	if (node[0]->type != Node_Internal &&
		node[1]->type != Node_Internal &&
		node[2]->type != Node_Internal &&
		node[3]->type != Node_Internal)
	{
		ContourProcessEdge(node, dir, indexBuffer);
	}
	else
	{
		for (int i = 0; i < 2; i++)
		{
			Octree* edgeNodes[4];
			const int c[4] = 
			{
				edgeProcEdgeMask[dir][i][0],
				edgeProcEdgeMask[dir][i][1],
				edgeProcEdgeMask[dir][i][2],
				edgeProcEdgeMask[dir][i][3],
			};

			for (int j = 0; j < 4; j++)
			{
				if (node[j]->type == Node_Leaf || node[j]->type == Node_Psuedo)
				{
					edgeNodes[j] = node[j];
				}
				else
				{
					edgeNodes[j] = node[j]->nodes[c[j]];
				}
			}

			ContourEdgeProc(edgeNodes, edgeProcEdgeMask[dir][i][4], indexBuffer);
		}
	}
}

// ----------------------------------------------------------------------------

void ContourFaceProc(Octree* node[2], int dir, std::vector<int>& indexBuffer)
{
	if (!node[0] || !node[1])
	{
		return;
	}

	if (node[0]->type == Node_Internal || 
		node[1]->type == Node_Internal)
	{
		for (int i = 0; i < 4; i++)
		{
			Octree* faceNodes[2];
			const int c[2] = 
			{
				faceProcFaceMask[dir][i][0], 
				faceProcFaceMask[dir][i][1], 
			};

			for (int j = 0; j < 2; j++)
			{
				if (node[j]->type != Node_Internal)
				{
					faceNodes[j] = node[j];
				}
				else
				{
					faceNodes[j] = node[j]->nodes[c[j]];
				}
			}

			ContourFaceProc(faceNodes, faceProcFaceMask[dir][i][2], indexBuffer);
		}
		
		const int orders[2][4] =
		{
			{ 0, 0, 1, 1 },
			{ 0, 1, 0, 1 },
		};
		for (int i = 0; i < 4; i++)
		{
			Octree* edgeNodes[4];
			const int c[4] =
			{
				faceProcEdgeMask[dir][i][1],
				faceProcEdgeMask[dir][i][2],
				faceProcEdgeMask[dir][i][3],
				faceProcEdgeMask[dir][i][4],
			};

			const int* order = orders[faceProcEdgeMask[dir][i][0]];
			for (int j = 0; j < 4; j++)
			{
				if (node[order[j]]->type == Node_Leaf ||
					node[order[j]]->type == Node_Psuedo)
				{
					edgeNodes[j] = node[order[j]];
				}
				else
				{
					edgeNodes[j] = node[order[j]]->nodes[c[j]];
				}
			}

			ContourEdgeProc(edgeNodes, faceProcEdgeMask[dir][i][5], indexBuffer);
		}
	}
}

// ----------------------------------------------------------------------------

void ContourCellProc(Octree* node, std::vector<int>& indexBuffer)
{
	if (node == NULL)
	{
		return;
	}

	if (node->type == Node_Internal)
	{
		for (int i = 0; i < 8; i++)
		{
			ContourCellProc(node->nodes[i], indexBuffer);
		}

		for (int i = 0; i < 12; i++)
		{
			Octree* faceNodes[2];
			const int c[2] = { cellProcFaceMask[i][0], cellProcFaceMask[i][1] };
			
			faceNodes[0] = node->nodes[c[0]];
			faceNodes[1] = node->nodes[c[1]];

			ContourFaceProc(faceNodes, cellProcFaceMask[i][2], indexBuffer);
		}

		for (int i = 0; i < 6; i++)
		{
			Octree* edgeNodes[4];
			const int c[4] = 
			{
				cellProcEdgeMask[i][0],
				cellProcEdgeMask[i][1],
				cellProcEdgeMask[i][2],
				cellProcEdgeMask[i][3],
			};

			for (int j = 0; j < 4; j++)
			{
				edgeNodes[j] = node->nodes[c[j]];
			}

			ContourEdgeProc(edgeNodes, cellProcEdgeMask[i][4], indexBuffer);
		}
	}
}

// ----------------------------------------------------------------------------

void GenerateMeshFromOctree(Octree* node, std::vector<GLfloat>& vertexBuffer, std::vector<int>& indexBuffer)
{
	if (!node)
	{
		return;
	}

	vertexBuffer.clear();
	indexBuffer.clear();

	GenerateVertexIndices(node, vertexBuffer);
	ContourCellProc(node, indexBuffer);
}
