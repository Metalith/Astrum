#ifndef RENDER_SYS_HPP
#define RENDER_SYS_HPP

#include "system.hpp"
#include "components/transform.hpp"
#include <glfw3.h>

class RenderSystem: public System {
	public:
		RenderSystem();
		void update();
		void addEntity(int e);
	private:
		GLFWwindow* window;
		std::vector<GLuint> vertexArrays;
		std::vector<int> sizes;

		Transform* tPlayer;
};
#endif
