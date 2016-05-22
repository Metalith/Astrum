// Include GLFW
#include <glfw3.h>

#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <math.h>
extern GLFWwindow* window; // The "extern" keyword here is to access the variable "window" declared in tutorialXXX.cpp. This is a hack to keep the tutorials simple. Please avoid this.

typedef enum { SHADED, WIREFRAME, POINTS } displayModes;
extern displayModes mode;

// Include GLM
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
using namespace glm;

#include "controls.hpp"

glm::mat4 ViewMatrix;
glm::mat4 ProjectionMatrix;

glm::mat4 getViewMatrix(){
	return ViewMatrix;
}
glm::mat4 getProjectionMatrix(){
	return ProjectionMatrix;
}


// Initial position : on +Z
glm::vec3 position = glm::vec3( 0, 0, -5 );
// Initial horizontal angle : toward -Z
float horizontalAngle = 0.0f;
// Initial vertical angle : none
float verticalAngle = 0.0f;
// Initial Field of View
float initialFoV = 45.0f;

float speed = 3.0f; // 3 units / second
float mouseSpeed = 0.005f;

char centered = 0;
bool test = false;
void computeMatricesFromInputs(){
	if (centered != 5) { lookAtOrigin(); centered++; } // TODO: REMOVE THIS

	// glfwGetTime is called only once, the first time this function is called
	static double lastTime = glfwGetTime();

	// Compute time difference between current and last frame
	double currentTime = glfwGetTime();
	float deltaTime = float(currentTime - lastTime);

	// Get mouse position
	double xpos, ypos;
	glfwGetCursorPos(window, &xpos, &ypos);

	// Reset mouse position for next frame
	glfwSetCursorPos(window, 1024/2, 768/2);

	// Compute new orientation
	horizontalAngle += mouseSpeed * float(1024/2 - xpos );
	if (fabs(verticalAngle) <= 1.57f || verticalAngle * float(768/2 - ypos) < 0) verticalAngle = fmod(verticalAngle + mouseSpeed * float( 768/2 - ypos ),3.14f);
	//std::cout << horizontalAngle << " " << verticalAngle << std::endl;
	// Direction : Spherical coordinates to Cartesian coordinates conversion
	glm::vec3 direction(
			cos(verticalAngle) * sin(horizontalAngle),
			sin(verticalAngle),
			cos(verticalAngle) * cos(horizontalAngle)
	);

	// Right vector
	glm::vec3 right = glm::vec3(
			sin(horizontalAngle - 3.14f/2.0f),
			0,
			cos(horizontalAngle - 3.14f/2.0f)
	);

	// Up vector
	glm::vec3 up = glm::cross( right, direction );
	if ( glfwGetKey( window, GLFW_KEY_RIGHT_SHIFT ) == GLFW_PRESS || glfwGetKey( window, GLFW_KEY_LEFT_SHIFT ) == GLFW_PRESS )
		speed = 15.0f;
	else
		speed = 3.0f;
	// Move forward
	if (glfwGetKey( window, GLFW_KEY_W ) == GLFW_PRESS){
		position += direction * deltaTime * speed;
	}
	// Move backward
	if (glfwGetKey( window, GLFW_KEY_S ) == GLFW_PRESS){
		position -= direction * deltaTime * speed;
	}
	// Strafe right
	if (glfwGetKey( window, GLFW_KEY_D ) == GLFW_PRESS){
		position += right * deltaTime * speed;
	}
	// Strafe left
	if (glfwGetKey( window, GLFW_KEY_A ) == GLFW_PRESS){
		position -= right * deltaTime * speed;
	}
	if (glfwGetKey( window, GLFW_KEY_SPACE ) == GLFW_PRESS){
		lookAtOrigin();
	}
	if (glfwGetKey( window, GLFW_KEY_E ) == GLFW_PRESS && !test){
		if (mode != POINTS) mode = static_cast<displayModes>(((int) mode)+1);
		else mode = SHADED;
		test = true;
	}
	if (glfwGetKey( window, GLFW_KEY_Q ) == GLFW_PRESS && !test){
		if (mode != SHADED) mode = static_cast<displayModes>(((int) mode)-1);
		else mode = POINTS;
		test = true;
	}
	if (glfwGetKey( window, GLFW_KEY_E ) == GLFW_RELEASE && glfwGetKey( window, GLFW_KEY_Q ) == GLFW_RELEASE) test = false;

	float FoV = initialFoV;// - 5 * glfwGetMouseWheel(); // Now GLFW 3 requires setting up a callback for this. It's a bit too complicated for this beginner's tutorial, so it's disabled instead.

	// Projection matrix : 45� Field of View, 4:3 ratio, display range : 0.1 unit <-> 100 units
	ProjectionMatrix = glm::perspective(FoV, 4.0f / 3.0f, 0.1f, 100.0f);
	// Camera matrix
	ViewMatrix = glm::lookAt(
		position,           // Camera is here
		position+direction, // and looks here : at the same position, plus "direction"
		up                  // Head is up (set to 0,-1,0 to look upside-down)
	);

	// For the next frame, the "last time" will be "now"
	lastTime = currentTime;
}

void lookAtOrigin() {
	horizontalAngle = 0 * 3.14f;
	verticalAngle = 0 * 3.14f;
}
