#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <fstream>
#include <string>
#include <tuple>
#include <unordered_map>

#include <AntTweakBar.h>

#include <GL/glew.h>
#include <glfw3.h>
GLFWwindow* window;

#include <glm/glm.hpp>
#include <glm/gtx/transform.hpp>
#include "glm/gtc/matrix_transform.hpp"
#include <glm/gtc/type_ptr.hpp>
using namespace glm;

#include "common/shader.hpp"
#include "common/controls.hpp"

#include <boost/unordered_map.hpp>
#include <boost/tuple/tuple.hpp>
#include <boost/assign/std/vector.hpp> // for 'operator+=()'
using namespace boost::assign; // bring 'operator+=()' into scope

#include <noise/noise.h>
using namespace noise;

#include "octree.hpp"
#include "chunk.hpp"

bool		CreateWindow();
void		Draw();
std::string	UpdateVersion();
void 		setShading();

std::vector<GLfloat> vertices;
std::vector<GLfloat> normals;
std::vector<GLfloat> bary;
std::vector<int> indices;
std::vector<Octree> OctreeList;
std::vector<Chunk*> ChunkList;

GLuint shadeProgramID;
GLuint wireProgramID;

typedef enum { SHADED, WIREFRAME, POINTS } displayModes;
displayModes mode = SHADED;
int SIZE = 1;

TwBar *bar;

int main() {
	if (!CreateWindow()) return -1;
	srand(time(NULL));
	setSDF();
	for (int i = -SIZE; i <= SIZE; i++) //TODO: Speed up chunk generation. Severely limiting.
		for (int j = -SIZE; j <= SIZE; j++)
			for (int k = -SIZE; k <= SIZE; k++) {
				ChunkList += new Chunk(i, j, k);
				std::cout<<"Generated Chunk at " << i  << " " << j << " " << k << std::endl;
			}
	int p = 0;
	std::cout << "Generating Mesh" << std::endl;
	for (auto chunk : ChunkList) {
		chunk->update();
		chunk->generateMesh(vertices, normals, indices);
		chunk->generateSeamMesh(vertices, normals, indices);
		std::cout << 100 * float(++p) / float(ChunkList.size()) << "%" <<  std::endl;
	}

	Draw();
	// Close OpenGL window and terminate GLFW
	glfwTerminate();

	return 0;
}

bool CreateWindow() {
	// Initialise GLFW
	if( !glfwInit() )
	{
		fprintf( stderr, "Failed to initialize GLFW\n" );
		getchar();
		return false;
	}

	glfwWindowHint(GLFW_SAMPLES, 4);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE); // To make MacOS happy; should not be needed
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

	// Open a window and create its OpenGL context
	window = glfwCreateWindow( 1024, 768,("Astrum Engine Ver 0.1." + UpdateVersion() + " - Meshing").c_str(), NULL, NULL);
	if( window == NULL ){
		fprintf( stderr, "Failed to open GLFW window. If you have an Intel GPU, they are not 3.3 compatible. Try the 2.1 version of the tutorials.\n" );
		getchar();
		glfwTerminate();
		return false;
	}
	glfwMakeContextCurrent(window);

	// Initialize GLEW
	glewExperimental = true; // Needed for core profile
	if (glewInit() != GLEW_OK) {
		fprintf(stderr, "Failed to initialize GLEW\n");
		getchar();
		glfwTerminate();
		return -1;
	}
	glfwSwapInterval(0);
	// Initialize AntTweakBar
	TwInit(TW_OPENGL_CORE, NULL);

	TwWindowSize(1024, 768);
	// Create a tweak bar

	// Set GLFW event callbacks. I removed glfwSetWindowSizeCallback for conciseness
	glfwSetMouseButtonCallback(window, (GLFWmousebuttonfun)TwEventMouseButtonGLFW); // - Directly redirect GLFW mouse button events to AntTweakBar
	glfwSetCursorPosCallback(window, (GLFWcursorposfun)TwEventMousePosGLFW);          // - Directly redirect GLFW mouse position events to AntTweakBar
	glfwSetScrollCallback(window, (GLFWscrollfun)TwEventMouseWheelGLFW);    // - Directly redirect GLFW mouse wheel events to AntTweakBar
	glfwSetKeyCallback(window, (GLFWkeyfun)TwEventKeyGLFW);                         // - Directly redirect GLFW key events to AntTweakBar
	glfwSetCharCallback(window, (GLFWcharfun)TwEventCharGLFW);                      // - Directly redirect GLFW char events to AntTweakBar

	// Ensure we can capture the escape key being pressed below
	glfwSetInputMode(window, GLFW_STICKY_KEYS, GL_TRUE);
	// Hide the mouse and enable unlimited mouvement
	glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);

	// Set the mouse at the vertex of the screen
	glfwPollEvents();
	glfwSetCursorPos(window, 1024/2, 768/2);

	return true;
}

void Draw() {
	// Dark blue background
	glClearColor(0.2f, 0.2f, 0.4f, 0.0f);

	// Enable depth test
	glDepthFunc(GL_LESS);
	glEnable(GL_PROGRAM_POINT_SIZE);
	glEnable(GL_DEPTH_TEST);
	glEnable(GL_CULL_FACE);
	glCullFace(GL_BACK);
	GLuint VertexArrayID;
	glGenVertexArrays(1, &VertexArrayID);
	glBindVertexArray(VertexArrayID);

	GLuint vertexbuffer;
	glGenBuffers(1, &vertexbuffer);
	glBindBuffer(GL_ARRAY_BUFFER, vertexbuffer);
	glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizeof(GLfloat), &vertices[0], GL_STATIC_DRAW);

	GLuint normalbuffer;
	glGenBuffers(1, &normalbuffer);
	glBindBuffer(GL_ARRAY_BUFFER, normalbuffer);
	glBufferData(GL_ARRAY_BUFFER, normals.size() * sizeof(GLfloat), &normals[0], GL_STATIC_DRAW);

	GLuint indexbuffer;
	glGenBuffers(1, &indexbuffer);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexbuffer);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, indices.size() * sizeof(int), &indices[0], GL_STATIC_DRAW);

	shadeProgramID = LoadShaders( "Voxel.vs", "Voxel.fs" );
	wireProgramID = LoadShaders( "Wireframe.vs", "Wireframe.fs" );

	GLint objectColorLoc = glGetUniformLocation(shadeProgramID, "objectColor");
	// Get a handle for our "MVP" uniform
	GLuint sProjMatrixID = glGetUniformLocation(shadeProgramID, "projection");
	GLuint sViewMatrixID = glGetUniformLocation(shadeProgramID, "view");
	GLuint sModelMatrixID = glGetUniformLocation(shadeProgramID, "model");

	GLuint wProjMatrixID = glGetUniformLocation(wireProgramID, "projection");
	GLuint wViewMatrixID = glGetUniformLocation(wireProgramID, "view");
	GLuint wModelMatrixID = glGetUniformLocation(wireProgramID, "model");

	GLint wireColorLoc = glGetUniformLocation(wireProgramID, "objectColor");

	double lastTime = glfwGetTime();
	int nbFrames = 0;
	int fps = 0;
	int vsize = vertices.size() / 3.0;
	int chunk_size = static_cast<int>(Chunk::CHUNK_SIZE);
	int csize = ChunkList.size();
	bar = TwNewBar("Debug");
	TwDefine(" Debug size='240 240' valueswidth=100 color='125 255 255' refresh=0.1"); // Message added to the help bar.
	TwAddVarRO(bar, "size", TW_TYPE_INT32, &chunk_size,
			" label='Chunk Size' ");
	TwAddVarRO(bar, "Chunks", TW_TYPE_INT32, &csize,
			" label='Chunk List' ");
	TwAddVarRO(bar, "vertices", TW_TYPE_INT32, &vsize,
			" label='Vertices' ");
	TwAddVarRO(bar, "FPS", TW_TYPE_INT32, &fps,
			" label='FPS' ");
	TwAddSeparator(bar, NULL, NULL);

	TwEnumVal dmEV[] = { {SHADED, "Shaded"}, {WIREFRAME, "Wireframe"}, {POINTS, "Points"} };
	TwType dmType;

	// Defining season enum type
	dmType = TwDefineEnum("dmType", dmEV, 3);
	// Adding season to bar
	TwAddVarRW(bar, "Display", dmType, &mode, NULL);

	do{
		// Measure speed
		double currentTime = glfwGetTime();
		nbFrames++;
		if ( currentTime - lastTime >= 1.0 ){ // If last prinf() was more than 1 sec ago
			// printf and reset timer
			printf("%f ms/frame\n", 1000.0/double(nbFrames));
			fps = nbFrames;
			nbFrames = 0;
			lastTime += 1.0;
		}
		// Clear the screen
		glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );


		// Compute the MVP matrix from keyboard and mouse input
		computeMatricesFromInputs();
		glm::mat4 ProjectionMatrix = getProjectionMatrix();
		glm::mat4 ModelMatrix = glm::translate(glm::mat4(1.0), glm::vec3(float(SIZE) / 2.0f, float(SIZE) / 2.0f, float(SIZE) / 2.0f));
		glm::mat4 ViewMatrix = getViewMatrix();
		glm::mat4 ProjMatrix = ProjectionMatrix;

		glEnableVertexAttribArray(0);
		glBindBuffer(GL_ARRAY_BUFFER, vertexbuffer);
		glVertexAttribPointer(
				0,                  // attribute. No particular reason for 0, but must match the layout in the shader.
				3,                  // size
				GL_FLOAT,           // type
				GL_FALSE,           // normalized?
				0,                  // stride
				(void*)0            // array buffer offset
				);
		switch(mode) {
			case SHADED:
				glUseProgram(shadeProgramID);

				glUniform3f(objectColorLoc, 0.6f, 1.0f, 0.31f);
				// glUniform3f(viewPosLoc,     getCamPosition().x, getCamPosition().y, getCamPosition().z);
				glUniformMatrix4fv(sProjMatrixID, 1, GL_FALSE, &ProjMatrix[0][0]);
				glUniformMatrix4fv(sModelMatrixID, 1, GL_FALSE, &ModelMatrix[0][0]);
				glUniformMatrix4fv(sViewMatrixID, 1, GL_FALSE, &ViewMatrix[0][0]);

				glEnableVertexAttribArray(1);
				glBindBuffer(GL_ARRAY_BUFFER, normalbuffer);
				glVertexAttribPointer(
						1,                  // attribute. No particular reason for 0, but must match the layout in the shader.
						3,                  // size
						GL_FLOAT,           // type
						GL_FALSE,           // normalized?
						0,                  // stride
						(void*)0            // array buffer offset
						);
				glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexbuffer);
				break;
			case POINTS:
			case WIREFRAME:
				glPolygonMode( GL_FRONT_AND_BACK, GL_LINE );
				glUseProgram(wireProgramID);
				glUniformMatrix4fv(wProjMatrixID, 1, GL_FALSE, &ProjMatrix[0][0]);
				glUniformMatrix4fv(wModelMatrixID, 1, GL_FALSE, &ModelMatrix[0][0]);
				glUniformMatrix4fv(wViewMatrixID, 1, GL_FALSE, &ViewMatrix[0][0]);
				glUniform3f(wireColorLoc, 0.2f, 1.0f, 0.3f);
				break;
		}
		if (mode == POINTS) glDrawArrays(GL_POINTS, 0, vertices.size() / 3);
		else glDrawElements(GL_TRIANGLES, indices.size(), GL_UNSIGNED_INT, (void*)0);
		glDisableVertexAttribArray(0);
		// Draw GUI
		glPolygonMode( GL_FRONT_AND_BACK, GL_FILL );
		TwDraw();
		glfwSwapBuffers(window);
		glfwPollEvents();

	} // Check if the ESC key was pressed or the window was closed
	while( glfwGetKey(window, GLFW_KEY_ESCAPE ) != GLFW_PRESS &&
			glfwWindowShouldClose(window) == 0 );
	// Cleanup VBO and shader
	glDeleteBuffers(1, &vertexbuffer);
	glDeleteProgram(shadeProgramID);
	glDeleteVertexArrays(1, &VertexArrayID);
}

std::string UpdateVersion() {
	int v;
	std::fstream myfile("VERSION", std::ios::in | std::ios::out);
	myfile >> v;
	myfile.clear();
	myfile.seekp(0,std::ios::beg);
	myfile << ++v;
	myfile.close();
	return std::to_string(v);
}
