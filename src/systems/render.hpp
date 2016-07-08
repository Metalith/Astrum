#ifndef RENDER_SYS_HPP
#define RENDER_SYS_HPP

#include "system.hpp"
#include "components/transform.hpp"
#include <glfw3.h>
#include <AntTweakBar.h>

class RenderSystem: public System {
	public:
		RenderSystem();
		void update();
		void addEntity(int e);
		GLuint LoadShaders(const std::string& vertex_file_path,const std::string& fragment_file_path);

		void saveBMP(std::string filename);

		static void initTw();
		static void showDebug(const int& debugNum, std::string debugLabel);
		static void showBounds(bool show);
		static void setShading(int shading);
	private:
		GLFWwindow* window;
		std::vector<GLuint> vertexArrays;
		std::vector<int> sizes;
		std::vector<int> bSizes;
		std::vector<int> vSizes;

		int totalVerts = 0;
		Transform* tPlayer;

		static enum displayModes { SHADED, WIREFRAME, POINTS } mode;
		static bool bounds;

		TwStructMember vectorFMembers[3] = {
			{ "x", TW_TYPE_FLOAT, offsetof(vec3, x), "precision=1" },
			{ "y", TW_TYPE_FLOAT, offsetof(vec3, y), "precision=1" },
			{ "z", TW_TYPE_FLOAT, offsetof(vec3, z), "precision=1" }
		};
		TwType TW_TYPE_VECTORF = TwDefineStruct("Vector3F", vectorFMembers, 3, sizeof(vec3), NULL, NULL); // Add elem to bar;

		TwStructMember vectorMembers[3] = {
			{ "x", TW_TYPE_INT32, offsetof(ivec3, x), "precision=1" },
			{ "y", TW_TYPE_INT32, offsetof(ivec3, y), "precision=1" },
			{ "z", TW_TYPE_INT32, offsetof(ivec3, z), "precision=1" }
		};
		TwType TW_TYPE_VECTORI = TwDefineStruct("MyStructType", vectorMembers, 3, sizeof(ivec3), NULL, NULL); // Add elem to bar;

		TwEnumVal dmEV[3] = { {SHADED, "Shaded"}, {WIREFRAME, "Wireframe"}, {POINTS, "Points"} };
		TwType TW_TYPE_DISPLAY_MODE = TwDefineEnum("dmType", dmEV, 3);

		static void TW_CALL GetChunkCallback(void *value, void *clientData) { *static_cast<ivec3 *>(value) = ivec3(*static_cast<vec3 *>(clientData) / vec3(32)); }
};
#endif
