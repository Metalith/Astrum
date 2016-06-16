#ifndef CONTROLS_HPP
#define CONTROLS_HPP

#include <glm/glm.hpp>
#include <glm/gtx/transform.hpp>
#include "glm/gtc/matrix_transform.hpp"
#include <glm/gtc/type_ptr.hpp>
using namespace glm;

void computeMatricesFromInputs();
glm::vec3 getPosition();
glm::mat4 getViewMatrix();
glm::mat4 getProjectionMatrix();
void lookAtOrigin();
void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods);

#endif
