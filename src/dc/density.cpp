#include "density.hpp"
#include <iostream>

DensityField::DensityField(vec3 pos, int size, int LOD) {
	size = size / 2;
	this->module.SetSeed(0);
	this->module.SetFrequency (0.5);
	this->module.SetPersistence (0.25);
	this->size = size;	
	this->pos = pos;
	for (int i = -size; i <= size; i+=LOD) {
		for (int j = -size; j <= size; j+=LOD) {
			for (int k = -size; k <= size; k+=LOD) {
				float density = SDF(pos +  vec3(i,j,k));
				char material = density < 0 ? 1 : 0;
				points.push_back(material);	
			}
		}
	}
}

char DensityField::getPoint(vec3 pos) {
	int arraySize = size * 2 + 1;
	ivec3 newPos = ivec3((pos - this->pos) + float(this->size));
	return points[newPos.z + newPos.y * arraySize + newPos.x * arraySize * arraySize];
}

float DensityField::SDF(vec3 pos) { return module.GetValue(pos.x / 32, 0.0, pos.z / 32) + (2 * pos.y / 32); }
