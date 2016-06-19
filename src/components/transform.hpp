#ifndef COMPONENT_TRANSFORM
#define COMPONENT_TRANSFORM

#include <glm/glm.hpp>
#include <glm/gtc/quaternion.hpp>
#include <glm/gtx/quaternion.hpp>
using namespace glm;

class Transform : public Component {
	public:
		int getID() { return 2; }
		vec3 position = vec3(0,0,0);
		fquat orientation = quat(1.0f, 0.0f, 0.0f, 0.0f);
};

#endif
