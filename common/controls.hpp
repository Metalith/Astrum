#ifndef CONTROLS_HPP
#define CONTROLS_HPP

void computeMatricesFromInputs();
glm::vec3 getPosition();
glm::mat4 getViewMatrix();
glm::mat4 getProjectionMatrix();
void lookAtOrigin();
void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods);

#endif
