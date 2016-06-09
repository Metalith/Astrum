#ifndef CONTROLS_HPP
#define CONTROLS_HPP

void computeMatricesFromInputs();
glm::vec3 getPosition();
glm::mat4 getViewMatrix();
glm::mat4 getProjectionMatrix();
void lookAtOrigin();

#endif
