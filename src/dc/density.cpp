#include "density.hpp"
#include <iostream>

DensityField::DensityField(vec3 pos, int size, float LOD) {
	size = size / 2;
	this->module.SetSeed(0);
	this->module.SetFrequency (0.5);
	this->module.SetPersistence (0.25);
	this->size = size;	
	this->LOD = LOD;
	this->pos = pos;
	Point point;
	vec3 p, n, tmp;
	for (float i = -size; i <= size; i+=LOD) {
		for (float j = -size; j <= size; j+=LOD) {
			for (float k = -size; k <= size; k+=LOD) {
				tmp = this->pos + vec3(i, j, k);
				float density = SDF(tmp);
				char material = density < 0 ? 1 : 0;
				point.material = material;
				if (points.size() > 0) {
					if (material != points [points.size() - 1].material) {
						p = ApproximateZeroCrossingPosition(tmp - vec3(0,0,1), tmp);
						n = CalculateSurfaceNormal(p);
						point.edges[2] = edges.size();
						edges.push_back(p);
						edges.push_back(n);
					}
				}
				if (points.size() > size * 2 *1.0f / LOD + 1) {
					if (material != points [points.size() - (size * 2 *1.0f / LOD + 1)].material) {
						p = ApproximateZeroCrossingPosition(tmp - vec3(0,1,0), tmp);
						n = CalculateSurfaceNormal(p);
						point.edges[1] = edges.size();
						edges.push_back(p);
						edges.push_back(n);
					}
				}
				if (points.size() > size * 2 *1.0f / LOD + 1) {
					if (material != points [points.size() - ((size * 2 *1.0f / LOD + 1) * (size * 2 *1.0f / LOD + 1))].material) {
						p = ApproximateZeroCrossingPosition(tmp - vec3(1,0,0), tmp);
						n = CalculateSurfaceNormal(p);
						point.edges[0] = edges.size();
						edges.push_back(p);
						edges.push_back(n);
					}
				}
				points.push_back(point);
			}
		}
	}
}

char DensityField::getPoint(vec3 pos) {
	int arraySize = size * 2 * 1.0f / LOD + 1;
	ivec3 newPos = ivec3(((pos - this->pos) + float(this->size)) * (1.0f / LOD));
	return points[newPos.z + newPos.y * arraySize + newPos.x * arraySize * arraySize].material;
}

std::pair<vec3, vec3> DensityField::getEdge(const vec3& p0, const vec3& p1) {
	int arraySize = size * 2 * 1.0f / LOD + 1;
	ivec3 newPos = ivec3(((p1 - this->pos) + float(this->size)) * (1.0f / LOD));
	int index = newPos.z + newPos.y * arraySize + newPos.x * arraySize * arraySize;
	Point p = points[index];
	ivec3 dir = ivec3(p1 - p0);
	if (dir.z == 1) return std::make_pair(edges[p.edges[2]], edges[p.edges[2] + 1]);
	if (dir.y == 1) return std::make_pair(edges[p.edges[1]], edges[p.edges[1] + 1]);
	return std::make_pair(edges[p.edges[0]], edges[p.edges[0] + 1]);
}

float DensityField::SDF(vec3 pos) { return this->module.GetValue(pos.x / 32, 0.0, pos.z / 32) + ( pos.y / 32); }

vec3 DensityField::CalculateSurfaceNormal(const vec3& p) {
	const float H = 0.001f;
	const float dx = SDF(p + vec3(H, 0.f, 0.f)) - SDF(p - vec3(H, 0.f, 0.f));
	const float dy = SDF(p + vec3(0.f, H, 0.f)) - SDF(p - vec3(0.f, H, 0.f));
	const float dz = SDF(p + vec3(0.f, 0.f, H)) - SDF(p - vec3(0.f, 0.f, H));

	return glm::normalize(vec3(dx, dy, dz));
}

vec3 DensityField::ApproximateZeroCrossingPosition(const vec3& p0, const vec3& p1) {
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
