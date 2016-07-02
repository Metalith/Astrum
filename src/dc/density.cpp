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
	corner corner;
	for (float i = -size; i <= size; i+=LOD) {
		for (float j = -size; j <= size; j+=LOD) {
			for (float k = -size; k <= size; k+=LOD) {
				float density = SDF(pos +  vec3(i,j,k));
				char material = density < 0 ? 1 : 0;
				corner.point = material;
				points.push_back(corner);
			}
		}
	}
}

char DensityField::getPoint(vec3 pos) {
	int arraySize = size * 2 * 1.0f / LOD + 1;
	ivec3 newPos = ivec3(((pos - this->pos) + float(this->size)) * (1.0f / LOD));
	return points[newPos.z + newPos.y * arraySize + newPos.x * arraySize * arraySize].point;
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
