#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <fstream>
#include <string>

#include <AntTweakBar.h>

#include <GL/glew.h>
#include <glfw3.h>
GLFWwindow* window;

#include <glm/glm.hpp>
#include <glm/gtx/transform.hpp>
#include "glm/gtc/matrix_transform.hpp"
#include <glm/gtc/type_ptr.hpp>
using namespace glm;

#include <common/shader.hpp>
#include <common/controls.hpp>

#include <boost/unordered_map.hpp>
#include <boost/tuple/tuple.hpp>
#include <boost/assign/std/vector.hpp> // for 'operator+=()'
using namespace boost::assign; // bring 'operator+=()' into scope

#include <noise/noise.h>
using namespace noise;

#include <chunk.hpp>

bool		CreateWindow();
void		Draw();
std::string UpdateVersion();
void 		setShading();

std::vector<GLfloat> vertices;
std::vector<GLfloat> normals;
std::vector<GLfloat> bary;
std::vector<Chunk> ChunkList;

GLuint shadeProgramID;
GLuint wireProgramID;

typedef enum { SHADED, WIREFRAME, POINTS } displayModes;
displayModes mode = WIREFRAME;
int SIZE = 4;

TwBar *bar;

int main()
{
	if (!CreateWindow())
		return -1;
	srand(time(NULL));
	Chunk::setSeed(0);
	for (int i = -SIZE; i <= SIZE; i++)
		for (int j = -SIZE; j <= SIZE; j++)
			ChunkList+=Chunk(i, 0, j);
	std::vector<GLfloat> temp;
	for (std::vector<Chunk>::iterator it = ChunkList.begin(); it != ChunkList.end(); ++it) {
		temp = it->getVertices();
		vertices.insert(vertices.end(), temp.begin(), temp.end());
		temp = it->getNormals();
		normals.insert(normals.end(), temp.begin(), temp.end());
	}
	for (unsigned int i = 0; i < vertices.size(); i+=3)
		bary += 1,0,0,
				0,1,0,
				0,0,1;

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
	window = glfwCreateWindow( 1024, 768,("Astrum Engine Ver 0.0." + UpdateVersion() + " - Voxel Generation").c_str(), NULL, NULL);
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

	// Set the mouse at the center of the screen
	glfwPollEvents();
	glfwSetCursorPos(window, 1024/2, 768/2);

	return true;
}

void Draw() {
	// Dark blue background
	glClearColor(0.2f, 0.2f, 0.4f, 0.0f);

	// Enable depth test
	glEnable (GL_BLEND);
	glBlendFunc (GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glDepthFunc(GL_LESS);
	glEnable(GL_PROGRAM_POINT_SIZE);

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

	GLuint barybuffer;
	glGenBuffers(1, &barybuffer);
	glBindBuffer(GL_ARRAY_BUFFER, barybuffer);
	glBufferData(GL_ARRAY_BUFFER, bary.size() * sizeof(GLfloat), &bary[0], GL_STATIC_DRAW);

	// Create and compile our GLSL program from the shaders
	shadeProgramID = LoadShaders( "Voxel.vs", "Voxel.fs" );
	wireProgramID = LoadShaders( "Wireframe.vs", "Wireframe.fs" );

	GLint objectColorLoc = glGetUniformLocation(shadeProgramID, "objectColor");
	GLint lightColorLoc  = glGetUniformLocation(shadeProgramID, "lightColor");
	GLint lightPosLoc    = glGetUniformLocation(shadeProgramID, "lightPos");
	// GLint viewPosLoc     = glGetUniformLocation(shadeProgramID, "viewPos");
	// Get a handle for our "MVP" uniform
	GLuint sProjMatrixID = glGetUniformLocation(shadeProgramID, "projection");
	GLuint sViewMatrixID = glGetUniformLocation(shadeProgramID, "view");
	GLuint sModelMatrixID = glGetUniformLocation(shadeProgramID, "model");

	GLuint wProjMatrixID = glGetUniformLocation(wireProgramID, "projection");
	GLuint wViewMatrixID = glGetUniformLocation(wireProgramID, "view");
	GLuint wModelMatrixID = glGetUniformLocation(wireProgramID, "model");

	double lastTime = glfwGetTime();
	int nbFrames = 0;
	int fps = 0;
	int vsize = vertices.size();
	int csize = ChunkList.size();
	int numVoxels = csize * 16 * 16 * 16;
	bar = TwNewBar("Debug");
	TwDefine(" Debug size='240 240' valueswidth=100 color='125 255 255' refresh=0.1"); // Message added to the help bar.
	TwAddVarRO(bar, "size", TW_TYPE_INT32, &SIZE,
					" label='Chunk Size' ");
	TwAddVarRO(bar, "Chunks", TW_TYPE_INT32, &csize,
					" label='Chunk List' ");
	TwAddVarRO(bar, "vertices", TW_TYPE_INT32, &vsize,
					" label='Vertices' ");
	TwAddVarRO(bar, "Voxels", TW_TYPE_INT32, &numVoxels,
					" label='Voxels' ");
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

		switch(mode) {
			case SHADED:
				// Enable depth test
				glEnable(GL_DEPTH_TEST);
				glEnable(GL_CULL_FACE);
				glUseProgram(shadeProgramID);
				// Send our transformation to the currently bound shader,
				// in the "MVP" uniform
				glUniform3f(objectColorLoc, 0.6f, 0.2f, 0.31f);
				glUniform3f(lightColorLoc,  1.0f, 1.0f, 1.0f);
				glUniform3f(lightPosLoc,    40.0f, 50.0f, 30.0f);
				// glUniform3f(viewPosLoc,     getCamPosition().x, getCamPosition().y, getCamPosition().z);
				glUniformMatrix4fv(sProjMatrixID, 1, GL_FALSE, &ProjMatrix[0][0]);
				glUniformMatrix4fv(sModelMatrixID, 1, GL_FALSE, &ModelMatrix[0][0]);
				glUniformMatrix4fv(sViewMatrixID, 1, GL_FALSE, &ViewMatrix[0][0]);

				// 3rd attribute buffer : normals
				glEnableVertexAttribArray(1);
				glBindBuffer(GL_ARRAY_BUFFER, normalbuffer);
				glVertexAttribPointer(
					1,                                // attribute
					3,                                // size
					GL_FLOAT,                         // type
					GL_FALSE,                         // normalized?
					0,                                // stride
					(void*)0                          // array buffer offset
				);

				break;
			case POINTS:
			case WIREFRAME:
				glDisable(GL_DEPTH_TEST);
				glDisable(GL_CULL_FACE);
				glUseProgram(wireProgramID);
				glUniformMatrix4fv(wProjMatrixID, 1, GL_FALSE, &ProjMatrix[0][0]);
				glUniformMatrix4fv(wModelMatrixID, 1, GL_FALSE, &ModelMatrix[0][0]);
				glUniformMatrix4fv(wViewMatrixID, 1, GL_FALSE, &ViewMatrix[0][0]);
				glEnableVertexAttribArray(2);
				glBindBuffer(GL_ARRAY_BUFFER, barybuffer);
				glVertexAttribPointer(
					2,                                // attribute
					3,                                // size
					GL_FLOAT,                         // type
					GL_FALSE,                         // normalized?
					0,                                // stride
					(void*)0                          // array buffer offset
				);
				break;
		}


		// 1rst attribute buffer : vertices
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

		// Draw the triangle !
		if (mode != POINTS) glDrawArrays(GL_TRIANGLES, 0, vertices.size()); // 12*3 indices starting at 0 -> 12 triangles
		else glDrawArrays(GL_POINTS, 0, vertices.size());
		glDisableVertexAttribArray(0);
		glDisableVertexAttribArray(1);
		glDisableVertexAttribArray(2);
		// Draw GUI
		TwDraw();
		glfwSwapBuffers(window);
		glfwPollEvents();

	} // Check if the ESC key was pressed or the window was closed
	while( glfwGetKey(window, GLFW_KEY_ESCAPE ) != GLFW_PRESS &&
		glfwWindowShouldClose(window) == 0 );
	// Cleanup VBO and shader
	glDeleteBuffers(1, &vertexbuffer);
	glDeleteBuffers(1, &normalbuffer);
	glDeleteBuffers(1, &barybuffer);
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

void setShading() {

}
