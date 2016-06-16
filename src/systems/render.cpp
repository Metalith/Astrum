#include <iostream>
#include <fstream>
#include <unistd.h>

#include <GL/glew.h>
//#include <glfw3.h>
#include <glm/glm.hpp>
#include <glm/gtx/transform.hpp>
#include "glm/gtc/matrix_transform.hpp"
#include <glm/gtc/type_ptr.hpp>
using namespace glm;

#include <AntTweakBar.h>

#include "systems/render.hpp"
#include "systems/system.hpp"
#include "components/mesh.hpp"
#include "engine.hpp"

#include "common/controls.hpp"

GLuint objectColorLoc;
GLuint sProjMatrixID;
GLuint sViewMatrixID;
GLuint sModelMatrixID;

GLuint shadeProgramID;
GLuint wireProgramID;

double lastTime = glfwGetTime();
int nbFrames = 0;
int fps = 0;

GLuint LoadShaders(const std::string& vertex_file_path,const std::string& fragment_file_path);

RenderSystem::RenderSystem() {
	std::cout << "New System :: Render!" << std::endl;
	setComponent<Mesh>();
	this->window = glfwGetCurrentContext();

	glClearColor(0.1f, 0.2f, 0.3f, 0.0f);

	// Enable GL Flags
	glDepthFunc(GL_LESS);
	glEnable(GL_PROGRAM_POINT_SIZE);
	glEnable(GL_DEPTH_TEST);
	glEnable(GL_CULL_FACE);
	glEnable (GL_BLEND);
	glBlendFunc (GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glCullFace(GL_BACK);

	shadeProgramID = LoadShaders( "Voxel.vs", "Voxel.fs" );
	wireProgramID = LoadShaders( "Wireframe.vs", "Wireframe.fs" );

	objectColorLoc = glGetUniformLocation(shadeProgramID, "objectColor");
	sProjMatrixID = glGetUniformLocation(shadeProgramID, "projection");
	sViewMatrixID = glGetUniformLocation(shadeProgramID, "view");
	sModelMatrixID = glGetUniformLocation(shadeProgramID, "model");
}

void RenderSystem::update() {
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
	//// Dark blue background
	glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );

	computeMatricesFromInputs();

	glm::mat4 ProjMatrix = getProjectionMatrix();
	glm::mat4 ModelMatrix = glm::mat4(1.0);
	glm::mat4 ViewMatrix = getViewMatrix();

	glUseProgram(shadeProgramID);


	glUniform3f(objectColorLoc, 0.6f, 1.0f, 0.31f);
	glUniformMatrix4fv(sProjMatrixID, 1, GL_FALSE, &ProjMatrix[0][0]);
	glUniformMatrix4fv(sModelMatrixID, 1, GL_FALSE, &ModelMatrix[0][0]);
	glUniformMatrix4fv(sViewMatrixID, 1, GL_FALSE, &ViewMatrix[0][0]);

	glEnableVertexAttribArray(0);
	glEnableVertexAttribArray(1);

	for (int i = 0; i < vertexArrays.size(); i++) {
		glBindVertexArray(vertexArrays[i]); // Bind our Vertex Array Object
		glDrawElements(GL_TRIANGLES, sizes[i], GL_UNSIGNED_INT, (void*)0);
		glBindVertexArray(0); // Unbind our Vertex Array Object
	}

	glfwSwapBuffers(this->window);
	glfwPollEvents();
}

void RenderSystem::addEntity(int e) {
	System::addEntity(e);
	Mesh* m = engine->getComponent<Mesh>(e);

	GLuint VertexArrayID;
	glGenVertexArrays(1, &VertexArrayID);
	glBindVertexArray(VertexArrayID);

	GLuint vertexbuffer;
	glGenBuffers(1, &vertexbuffer);
	glBindBuffer(GL_ARRAY_BUFFER, vertexbuffer);
	glBufferData(GL_ARRAY_BUFFER, m->vertices.size() * sizeof(GLfloat), &m->vertices[0], GL_STREAM_DRAW);
	glEnableVertexAttribArray(0);
	glVertexAttribPointer(
			0,                  // attribute. No particular reason for 0, but must match the layout in the shader.
			3,                  // size
			GL_FLOAT,           // type
			GL_FALSE,           // normalized?
			0,                  // stride
			(void*)0            // array buffer offset
			);

	GLuint normalbuffer;
	glGenBuffers(1, &normalbuffer);
	glBindBuffer(GL_ARRAY_BUFFER, normalbuffer);
	glBufferData(GL_ARRAY_BUFFER, m->normals.size() * sizeof(GLfloat), &m->normals[0], GL_STREAM_DRAW);
	glEnableVertexAttribArray(1);
	glVertexAttribPointer(
			1,                  // attribute. No particular reason for 0, but must match the layout in the shader.
			3,                  // size
			GL_FLOAT,           // type
			GL_FALSE,           // normalized?
			0,                  // stride
			(void*)0            // array buffer offset
			);

	GLuint indexbuffer;
	glGenBuffers(1, &indexbuffer);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexbuffer);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, m->indices.size() * sizeof(int), &m->indices[0], GL_STREAM_DRAW);

	vertexArrays.push_back(VertexArrayID);
	sizes.push_back(m->indices.size());
	//GLuint boundbuffer;
	//glGenBuffers(1, &boundbuffer);
	//glBindBuffer(GL_ARRAY_BUFFER, boundbuffer);
	//glBufferData(GL_ARRAY_BUFFER, bounds.size() * sizeof(GLfloat), &bounds[0], GL_STREAM_DRAW);
	//std::cout << "test" << std::endl;
}

GLuint LoadShaders(const std::string& vertex_file_path,const std::string& fragment_file_path){

	// Create the shaders
	GLuint VertexShaderID = glCreateShader(GL_VERTEX_SHADER);
	GLuint FragmentShaderID = glCreateShader(GL_FRAGMENT_SHADER);

	// Read the Vertex Shader code from the file
	std::string VertexShaderCode;
	char cwd[1024];
	readlink("/proc/self/exe", cwd, 1024);
	std::string scwd = std::string(cwd);
	std::string path = scwd.substr(0, scwd.rfind("/")) + "/../res/shaders/";
	std::ifstream VertexShaderStream(path + vertex_file_path, std::ios::in);
	if(VertexShaderStream.is_open()){
		std::string Line = "";
		while(getline(VertexShaderStream, Line))
			VertexShaderCode += "\n" + Line;
		VertexShaderStream.close();
	}else{

		std::cout << "Current Path: " << path.substr(0, path.rfind("/")) << std::endl;
		std::cout << "Impossible to open " << vertex_file_path << ". Are you in the right directory ? Don't forget to read the FAQ !" << std::endl;
		exit(EXIT_FAILURE);
		return 0;
	}

	// Read the Fragment Shader code from the file
	std::string FragmentShaderCode;
	std::ifstream FragmentShaderStream(path + fragment_file_path, std::ios::in);
	if(FragmentShaderStream.is_open()){
		std::string Line = "";
		while(getline(FragmentShaderStream, Line))
			FragmentShaderCode += "\n" + Line;
		FragmentShaderStream.close();
	}else{
		std::cout << "Impossible to open " << fragment_file_path << ". Are you in the right directory ? Don't forget to read the FAQ !" << std::endl;
		exit(EXIT_FAILURE);
		return 0;
	}
	GLint Result = GL_FALSE;
	int InfoLogLength;


	// Compile Vertex Shader
	std::cout << "Compiling shader : " << vertex_file_path << std::endl;
	char const * VertexSourcePointer = VertexShaderCode.c_str();
	glShaderSource(VertexShaderID, 1, &VertexSourcePointer , NULL);
	glCompileShader(VertexShaderID);

	// Check Vertex Shader
	glGetShaderiv(VertexShaderID, GL_COMPILE_STATUS, &Result);
	glGetShaderiv(VertexShaderID, GL_INFO_LOG_LENGTH, &InfoLogLength);
	if ( InfoLogLength > 0 ){
		std::vector<char> VertexShaderErrorMessage(InfoLogLength+1);
		glGetShaderInfoLog(VertexShaderID, InfoLogLength, NULL, &VertexShaderErrorMessage[0]);
		printf("%s\n", &VertexShaderErrorMessage[0]);
	}



	// Compile Fragment Shader
	std::cout << "Compiling shader : " << fragment_file_path << std::endl;
	char const * FragmentSourcePointer = FragmentShaderCode.c_str();
	glShaderSource(FragmentShaderID, 1, &FragmentSourcePointer , NULL);
	glCompileShader(FragmentShaderID);

	// Check Fragment Shader
	glGetShaderiv(FragmentShaderID, GL_COMPILE_STATUS, &Result);
	glGetShaderiv(FragmentShaderID, GL_INFO_LOG_LENGTH, &InfoLogLength);
	if ( InfoLogLength > 0 ){
		std::vector<char> FragmentShaderErrorMessage(InfoLogLength+1);
		glGetShaderInfoLog(FragmentShaderID, InfoLogLength, NULL, &FragmentShaderErrorMessage[0]);
		printf("%s\n", &FragmentShaderErrorMessage[0]);
	}



	// Link the program
	printf("Linking program\n");
	GLuint ProgramID = glCreateProgram();
	glAttachShader(ProgramID, VertexShaderID);
	glAttachShader(ProgramID, FragmentShaderID);
	glLinkProgram(ProgramID);

	// Check the program
	glGetProgramiv(ProgramID, GL_LINK_STATUS, &Result);
	glGetProgramiv(ProgramID, GL_INFO_LOG_LENGTH, &InfoLogLength);
	if ( InfoLogLength > 0 ){
		std::vector<char> ProgramErrorMessage(InfoLogLength+1);
		glGetProgramInfoLog(ProgramID, InfoLogLength, NULL, &ProgramErrorMessage[0]);
		printf("%s\n", &ProgramErrorMessage[0]);
	}

	glDetachShader(ProgramID, VertexShaderID);
	glDetachShader(ProgramID, FragmentShaderID);

	glDeleteShader(VertexShaderID);
	glDeleteShader(FragmentShaderID);

	return ProgramID;
}
