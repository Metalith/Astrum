#ifndef RENDER_SYS_HPP
#define RENDER_SYS_HPP

#include <glfw3.h>
#include "system.hpp"

class RenderSystem: public System {
	public:
		RenderSystem();
		void update();
		void addEntity(int e);
	private:
		GLFWwindow* window;
		std::vector<GLuint> vertexArrays;
		std::vector<int> sizes;
};
#endif
