#include "systems/controls.hpp"
#include "systems/system.hpp"
#include "systems/render.hpp"
#include "engine.hpp"
#include "components/player.hpp"
#include "components/transform.hpp"

#include <iostream>

bool ControlSystem::moveW;
bool ControlSystem::moveA;
bool ControlSystem::moveS;
bool ControlSystem::moveD;
bool ControlSystem::moveQ;
bool ControlSystem::moveE;

float ControlSystem::speed = 3.f;
float ControlSystem::rotSpeed = 3.f; // 3 units / seconds
float ControlSystem::mouseSpeed = 0.005f;

ControlSystem::ControlSystem() {
	std::cout << "New System :: Control!" << std::endl;
	setComponent<Player>();
	this->window = glfwGetCurrentContext();
}

void ControlSystem::addEntity(int e) {
	System::addEntity(e);
	tPlayer = System::engine->getComponent<Transform>(entities[0]);
}

void ControlSystem::update() {
	if (entities.size() != 1) {
		std::cout << "No Player for Control System" << std::endl;
		exit(EXIT_FAILURE);
	}
	static double lastTime = glfwGetTime();

	// Compute time difference between current and last frame
	double currentTime = glfwGetTime();
	float deltaTime = float(currentTime - lastTime);

	//// Get mouse position
	double xpos, ypos;
	glfwGetCursorPos(window, &xpos, &ypos);

	// Reset mouse position for next frame
	glfwSetCursorPos(window, 1024/2, 768/2);
	OffsetOrientation(tPlayer->orientation, glm::vec3(0.0f, 1.0f, 0.0f), -mouseSpeed * float(1024/2 - xpos));
	OffsetOrientation(tPlayer->orientation, glm::vec3(1.0f, 0.0f, 0.0f), mouseSpeed * float(768/2 - ypos));
	glm::vec3 direction(0,0,1);
	glm::vec3 right(1,0,0);

	direction =  direction * tPlayer->orientation;
	right = right * tPlayer->orientation;
	if (moveW) tPlayer->position += direction * deltaTime * speed;
	if (moveS) tPlayer->position -= direction * deltaTime * speed;
	if (moveA) tPlayer->position += right * deltaTime * speed;
	if (moveD) tPlayer->position -= right * deltaTime * speed;
	if (moveQ) OffsetOrientation(tPlayer->orientation, glm::vec3(0.0f, 0.0f, 1.0f), rotSpeed * deltaTime);
	if (moveE) OffsetOrientation(tPlayer->orientation, glm::vec3(0.0f, 0.0f, 1.0f), -rotSpeed * deltaTime);
	lastTime = currentTime;
}

void ControlSystem::key_callback(GLFWwindow* window, int key, int scancode, int action, int mods) {
	bool set = (action != GLFW_RELEASE );
	switch (key){
		case GLFW_KEY_W: moveW = set; break;
		case GLFW_KEY_A: moveA = set; break;
		case GLFW_KEY_S: moveS = set; break;
		case GLFW_KEY_D: moveD = set; break;
		case GLFW_KEY_Q: moveQ = set; break;
		case GLFW_KEY_E: moveE = set; break;
		case GLFW_KEY_1: RenderSystem::setShading(0); break;
		case GLFW_KEY_2: RenderSystem::setShading(1); break;
		case GLFW_KEY_3: RenderSystem::setShading(2); break;
		case GLFW_KEY_SPACE: RenderSystem::showBounds(set); break;
		case GLFW_KEY_RIGHT_SHIFT:
		case GLFW_KEY_LEFT_SHIFT:
						if (set) ControlSystem::speed = 150.0f;
						else ControlSystem::speed = 3.0f;
						break;
	}
}

void ControlSystem::OffsetOrientation(quat& q, const glm::vec3 &_axis, float fAngRad) {
	vec3 axis = normalize(_axis);
	axis = axis * sinf(fAngRad / 2.0f);
	float scalar = cosf(fAngRad / 2.0f);

	quat offset(scalar, axis.x, axis.y, axis.z);

	q = offset * q; //Transforms it via worldspace. Reference TUT 08 of arc synthesis
	q = normalize(q);
}
