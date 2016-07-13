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

#include "bitmap_image.hpp"

#include "systems/render.hpp"
#include "systems/terrain.hpp"
#include "systems/system.hpp"
#include "components/mesh.hpp"
#include "components/player.hpp"
#include "components/transform.hpp"
#include "engine.hpp"

GLuint objectColorLoc;
GLuint uTimeLoc;
GLuint sProjMatrixID;
GLuint sViewMatrixID;
GLuint sModelMatrixID;

GLuint wireColorLoc;
GLuint wProjMatrixID;
GLuint wViewMatrixID;
GLuint wModelMatrixID;

GLuint skyProjMatrixID;
GLuint skyViewMatrixID;
GLuint skyModelMatrixID;
GLuint sunLoc;

GLuint shadeProgramID;
GLuint wireProgramID;
GLuint skyProgramID;

mat4 ProjectionMatrix;
mat4 ViewMatrix;

TwBar *DebugGUI;
TwBar *PlayerGUI;

double lastTime = glfwGetTime();
int nbFrames = 0;
int fps = 0;

GLuint renderedTexture;
GLuint texSkyBox;
GLuint texID;
GLuint skyTexID;

const GLfloat g_cube_buffer_data[] = {
    -1000.0f,-1000.0f,-1000.0f, // triangle 1000 : begin
    -1000.0f,-1000.0f, 1000.0f,
    -1000.0f, 1000.0f, 1000.0f, // triangle 1000 : end
     1000.0f, 1000.0f,-1000.0f, // triangle 2 : begin
    -1000.0f,-1000.0f,-1000.0f,
    -1000.0f, 1000.0f,-1000.0f, // triangle 2 : end
     1000.0f,-1000.0f, 1000.0f,
    -1000.0f,-1000.0f,-1000.0f,
     1000.0f,-1000.0f,-1000.0f,
     1000.0f, 1000.0f,-1000.0f,
     1000.0f,-1000.0f,-1000.0f,
    -1000.0f,-1000.0f,-1000.0f,
    -1000.0f,-1000.0f,-1000.0f,
    -1000.0f, 1000.0f, 1000.0f,
    -1000.0f, 1000.0f,-1000.0f,
     1000.0f,-1000.0f, 1000.0f,
    -1000.0f,-1000.0f, 1000.0f,
    -1000.0f,-1000.0f,-1000.0f,
    -1000.0f, 1000.0f, 1000.0f,
    -1000.0f,-1000.0f, 1000.0f,
     1000.0f,-1000.0f, 1000.0f,
     1000.0f, 1000.0f, 1000.0f,
     1000.0f,-1000.0f,-1000.0f,
     1000.0f, 1000.0f,-1000.0f,
     1000.0f,-1000.0f,-1000.0f,
     1000.0f, 1000.0f, 1000.0f,
     1000.0f,-1000.0f, 1000.0f,
     1000.0f, 1000.0f, 1000.0f,
     1000.0f, 1000.0f,-1000.0f,
    -1000.0f, 1000.0f,-1000.0f,
     1000.0f, 1000.0f, 1000.0f,
    -1000.0f, 1000.0f,-1000.0f,
    -1000.0f, 1000.0f, 1000.0f,
     1000.0f, 1000.0f, 1000.0f,
    -1000.0f, 1000.0f, 1000.0f,
     1000.0f,-1000.0f, 1000.0f
};
GLuint cube_VertexArrayID;

RenderSystem::displayModes RenderSystem::mode;
bool RenderSystem::bounds;
RenderSystem::RenderSystem() {
	std::cout << "New System :: Render!" << std::endl;
	setComponent<Mesh>();
	setComponent<Player>();
	this->window = glfwGetCurrentContext();

	mode = SHADED;
	bounds = false;

	glClearColor(0.1f, 0.2f, 0.3f, 0.0f);

	// Enable GL Flags
	glDepthFunc(GL_LESS);
	glEnable(GL_PROGRAM_POINT_SIZE);
	glEnable(GL_DEPTH_TEST);
	glEnable(GL_CULL_FACE);
	glEnable(GL_BLEND);
	glEnable(GL_DITHER);
	//glPolygonMode( GL_FRONT_AND_BACK, GL_LINE );
	glBlendFunc (GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glCullFace(GL_BACK);

	shadeProgramID = LoadShaders( "GasGiant.vp", "GasGiant.fp" );
	wireProgramID = LoadShaders( "Wireframe.vs", "Wireframe.fs" );

	texID = glGetUniformLocation(shadeProgramID, "renderedTexture");
	sProjMatrixID = glGetUniformLocation(shadeProgramID, "projection");
	sViewMatrixID = glGetUniformLocation(shadeProgramID, "view");
	sModelMatrixID = glGetUniformLocation(shadeProgramID, "model");

	wireColorLoc = glGetUniformLocation(wireProgramID, "objectColor");
	wProjMatrixID = glGetUniformLocation(wireProgramID, "projection");
	wViewMatrixID = glGetUniformLocation(wireProgramID, "view");
	wModelMatrixID = glGetUniformLocation(wireProgramID, "model");

	ProjectionMatrix = glm::perspective(45.0f, 4.0f / 3.0f, 0.1f, 4000.0f);

	TwDefine(" Debug size='240 240' valueswidth=100 refresh=0.1"); // Message added to the help DebugGUI.
	TwDefine(" Player position='768 16' size='240 160' valueswidth=150 refresh=0.1"); // Message added to the help DebugGUI.
	showDebug(totalVerts, "Vertices");
	TwAddVarRO(DebugGUI, "FPS", TW_TYPE_INT32, &fps,
			" label='FPS' ");
	TwAddSeparator(DebugGUI, NULL, NULL);
	TwAddVarRO(DebugGUI, "Display", TW_TYPE_DISPLAY_MODE, &mode, NULL);
	TwAddVarRO(DebugGUI, "Octree", TW_TYPE_BOOLCPP, &bounds," true='SHOW' false='HIDDEN' ");

	//----------------------------------------------------------------------------------------------------------------------
	// Gas FrameBuffer Code
	//----------------------------------------------------------------------------------------------------------------------

	// The framebuffer, which regroups 0, 1, or more textures, and 0 or 1 depth buffer.
	GLuint FramebufferName = 0;
	glGenFramebuffers(1, &FramebufferName);
	glBindFramebuffer(GL_FRAMEBUFFER, FramebufferName);

	// The texture we're going to render to
	glGenTextures(1, &renderedTexture);

	// "Bind" the newly created texture : all future texture functions will modify this texture
	glBindTexture(GL_TEXTURE_2D, renderedTexture);

	// Give an empty image to OpenGL ( the last "0" )
	glTexImage2D(GL_TEXTURE_2D, 0,GL_RGB, 2048, 1024, 0,GL_RGB, GL_UNSIGNED_BYTE, 0);

	// Poor filtering. Needed !
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR_MIPMAP_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);

	// Set "renderedTexture" as our colour attachement #0
	glFramebufferTexture(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, renderedTexture, 0);

	// Set the list of draw buffers.
	GLenum DrawBuffers[1] = {GL_COLOR_ATTACHMENT0};
	glDrawBuffers(1, DrawBuffers); // "1" is the size of DrawBuffers

	// Always check that our framebuffer is ok
	if(glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
		std::cout << "Framebuffer error" << std::endl;
		exit(EXIT_FAILURE);
	}

	// Render to our framebuffer
	glBindFramebuffer(GL_FRAMEBUFFER, FramebufferName);
	glViewport(0,0,2048,1024); // Render on the whole framebuffer, complete from the lower left corner to the upper right

	glm::mat4 tProj = glm::ortho(0.0f,2048.0f,0.0f,1024.0f,0.0f,100.0f);
	glm::mat4 tMod = glm::mat4(1.0);
	glm::mat4 tView = glm::lookAt(
			glm::vec3(0,0,1), // Camera is at (4,3,3), in World Space
			glm::vec3(0,0,0), // and looks at the origin
			glm::vec3(0,1,0)  // Head is up (set to 0,-1,0 to look upside-down)
	);

	GLuint simpleProgramID = LoadShaders( "GasTexture.vp", "GasTexture.fp" );

	GLuint tProjMatrixID = glGetUniformLocation(simpleProgramID, "projection");
	GLuint tViewMatrixID = glGetUniformLocation(simpleProgramID, "view");
	GLuint tModelMatrixID = glGetUniformLocation(simpleProgramID, "model");


	// The fullscreen quad's FBO
	GLuint quad_VertexArrayID;
	glGenVertexArrays(1, &quad_VertexArrayID);
	glBindVertexArray(quad_VertexArrayID);

	static const GLfloat g_quad_vertex_buffer_data[] = {
			0.0f, 0.0f, 0.0f,
			2048.0f,0.0f, 0.0f,
			0.0f,  1024.0f, 0.0f,
			0.0f,  1024.0f, 0.0f,
			2048.0f, 0.0f, 0.0f,
			2048.0f, 1024.0f, 0.0f
	};

	GLuint quad_vertexbuffer;
	glGenBuffers(1, &quad_vertexbuffer);
	glBindBuffer(GL_ARRAY_BUFFER, quad_vertexbuffer);
	glBufferData(GL_ARRAY_BUFFER, sizeof(g_quad_vertex_buffer_data), g_quad_vertex_buffer_data, GL_STATIC_DRAW);

	//// Dark blue background
	glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );
	glUseProgram(simpleProgramID);

	glUniformMatrix4fv(tProjMatrixID, 1, GL_FALSE, &tProj[0][0]);
	glUniformMatrix4fv(tModelMatrixID, 1, GL_FALSE, &tMod[0][0]);
	glUniformMatrix4fv(tViewMatrixID, 1, GL_FALSE, &tView[0][0]);

	// 1rst attribute buffer : vertices
	glEnableVertexAttribArray(0);
	glBindBuffer(GL_ARRAY_BUFFER, quad_vertexbuffer);
	glVertexAttribPointer(
			0,                  // attribute 0. No particular reason for 0, but must match the layout in the shader.
			3,                  // size
			GL_FLOAT,           // type
			GL_FALSE,           // normalized?
			0,                  // stride
			(void*)0            // array buffer offset
	);

	// Draw the triangles !
	glDrawArrays(GL_TRIANGLES, 0, 6); // 2*3 indices starting at 0 -> 2 triangles

	glDisableVertexAttribArray(0);

	saveBMP("GasGiant Texture.bmp", 2048, 1024);
	// Swap buffers
	glfwSwapBuffers(window);

	//----------------------------------------------------------------------------------------------------------------------
	// Generate Sky Box
	//----------------------------------------------------------------------------------------------------------------------

	genSkyBox();


	// Render to our framebuffer
	glBindFramebuffer(GL_FRAMEBUFFER, 0);
	glViewport(0,0,1024,768); // Render on the whole framebuffer, complete from the lower left corner to the upper right
}

bool save = false;
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

	glm::vec3 direction(0,0,1);
	glm::vec3 right(1,0,0);

	direction =  direction * tPlayer->orientation;
	right = right * tPlayer->orientation;
	glm::vec3 up = glm::cross( direction, right );

	glm::mat4 ModelMatrix = glm::mat4(1.0);
	glm::mat4 ViewMatrix = lookAt(
			tPlayer->position,           // Camera is at player
			tPlayer->position + direction, // and looks here : at the same position, plus "direction"
			up // Head is up : cross of direction and right
	);

	// --------- Sky -------------------------------------------------------------------------------------------------------
	glBindVertexArray(cube_VertexArrayID);
	glUseProgram(skyProgramID);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, texSkyBox);

	glCullFace(GL_FRONT);
	glUniform1i(skyTexID, 0);
	glUniformMatrix4fv(skyProjMatrixID, 1, GL_FALSE, &ProjectionMatrix[0][0]);
	glm::mat4 skyModelMatrix = translate(tPlayer->position); //= glTranslate()
	glUniformMatrix4fv(skyModelMatrixID, 1, GL_FALSE, &skyModelMatrix[0][0]);
	glUniformMatrix4fv(skyViewMatrixID, 1, GL_FALSE, &ViewMatrix[0][0]);
	glEnableVertexAttribArray(0);

	switch(mode) {
	case SHADED:
		glEnable(GL_CULL_FACE);
		glDrawArrays(GL_TRIANGLES, 0, 12*3);
		glCullFace(GL_BACK);
		glUseProgram(shadeProgramID);
		// Set our "renderedTexture" sampler to user Texture Unit 0
		// Bind our texture in Texture Unit 0
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, renderedTexture);

		glUniform1i(texID, 0);
		glUniformMatrix4fv(sProjMatrixID, 1, GL_FALSE, &ProjectionMatrix[0][0]);
		glUniformMatrix4fv(sModelMatrixID, 1, GL_FALSE, &ModelMatrix[0][0]);
		glUniformMatrix4fv(sViewMatrixID, 1, GL_FALSE, &ViewMatrix[0][0]);
		break;
	case POINTS:
	case WIREFRAME:
		glDisable(GL_CULL_FACE);
		glPolygonMode( GL_FRONT_AND_BACK, GL_LINE );
		glDrawArrays(GL_TRIANGLES, 0, 12*3);
		glCullFace(GL_BACK);
		glUseProgram(wireProgramID);
		glUniformMatrix4fv(wProjMatrixID, 1, GL_FALSE, &ProjectionMatrix[0][0]);
		glUniformMatrix4fv(wModelMatrixID, 1, GL_FALSE, &ModelMatrix[0][0]);
		glUniformMatrix4fv(wViewMatrixID, 1, GL_FALSE, &ViewMatrix[0][0]);
		glUniform4f(wireColorLoc, 0.2f, 1.0f, 0.3f, 1.0f);
		break;
	}

	for (int i = 0; i < vertexArrays.size(); i++) {
		glBindVertexArray(vertexArrays[i]); // Bind our Vertex Array Object
		glEnableVertexAttribArray(0);
		glEnableVertexAttribArray(1);
		glDisableVertexAttribArray(2);
		if (mode == POINTS) glDrawArrays(GL_POINTS, 0, vSizes[i]);
		else glDrawElements(GL_TRIANGLES, sizes[i], GL_UNSIGNED_INT, (void*)0);
		glBindVertexArray(0); // Unbind our Vertex Array Object
	}

	if (bounds) {
		glPolygonMode( GL_FRONT_AND_BACK, GL_LINE );
		glUseProgram(wireProgramID);
		glUniformMatrix4fv(wProjMatrixID, 1, GL_FALSE, &ProjectionMatrix[0][0]);
		glUniformMatrix4fv(wModelMatrixID, 1, GL_FALSE, &ModelMatrix[0][0]);
		glUniformMatrix4fv(wViewMatrixID, 1, GL_FALSE, &ViewMatrix[0][0]);
		glUniform4f(wireColorLoc, 1.f, 1.f, 1.f, 0.4f);
		for (int i = 0; i < vertexArrays.size(); i++) {
			glBindVertexArray(vertexArrays[i]); // Bind our Vertex Array Object
			glDisableVertexAttribArray(0);
			glDisableVertexAttribArray(1);
			glEnableVertexAttribArray(2);
			glDrawArrays(GL_LINES, 0, bSizes[i]); // 12*3 indices starting at 0 -> 12 triangles
			glBindVertexArray(0); // Unbind our Vertex Array Object
		}
	}
	glPolygonMode( GL_FRONT_AND_BACK, GL_FILL );
	TwDraw();

	glfwSwapBuffers(this->window);
	glfwPollEvents();
}

void RenderSystem::addEntity(int e) {
	Transform* tmp = nullptr;
	if ((tmp = System::engine->getComponent<Transform>(e)) != nullptr) {
		tPlayer = tmp;
		TwAddVarRO(PlayerGUI, "Position", TW_TYPE_VECTORF, &tPlayer->position, NULL);
		TwAddVarCB(PlayerGUI, "Chunk", TW_TYPE_VECTORI, NULL, GetChunkCallback, &tPlayer->position, "");
		TwAddVarRO(PlayerGUI, "Direction", TW_TYPE_QUAT4F, &tPlayer->orientation, "opened=true");
		TwDefine(" Player/Direction axisx=-x axisy=y axisz=-z ");
		return;
	}
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
	glBufferData(GL_ARRAY_BUFFER, m->normals.size() * sizeof(GLfloat), &m->normals[0], GL_STATIC_DRAW);
	glEnableVertexAttribArray(1);
	glVertexAttribPointer(
			1,                  // attribute. No particular reason for 0, but must match the layout in the shader.
			3,                  // size
			GL_FLOAT,           // type
			GL_FALSE,           // normalized?
			0,                  // stride
			(void*)0            // array buffer offset
	);

	GLuint boundbuffer;
	glGenBuffers(1, &boundbuffer);
	glBindBuffer(GL_ARRAY_BUFFER, boundbuffer);
	glBufferData(GL_ARRAY_BUFFER, m->bounds.size() * sizeof(GLfloat), &m->bounds[0], GL_STATIC_DRAW);
	glEnableVertexAttribArray(2);
	glVertexAttribPointer(
			2,                  // attribute. No particular reason for 0, but must match the layout in the shader.
			3,                  // size
			GL_FLOAT,           // type
			GL_FALSE,           // normalized?
			0,                  // stride
			(void*)0            // array buffer offset
	);

	GLuint indexbuffer;
	glGenBuffers(1, &indexbuffer);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexbuffer);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, m->indices.size() * sizeof(int), &m->indices[0], GL_STATIC_DRAW);

	vertexArrays.push_back(VertexArrayID);
	sizes.push_back(m->indices.size());
	bSizes.push_back(m->bounds.size() / 3);
	vSizes.push_back(m->vertices.size() / 3);
	totalVerts+=m->vertices.size() / 3;

	glBindVertexArray(0);
	glDisableVertexAttribArray(0);
	glDisableVertexAttribArray(1);
	glDisableVertexAttribArray(2);
}

//--------------------------------------------------------------------------------------------------------------------------
// Generates SkyBox
// 100u^3
// For now generates a square
//--------------------------------------------------------------------------------------------------------------------------
void RenderSystem::genSkyBox() {
	// The framebuffer, which regroups 0, 1, or more textures, and 0 or 1 depth buffer.
	GLuint fbSkyBox = 0;
	glGenFramebuffers(1, &fbSkyBox);
	glBindFramebuffer(GL_FRAMEBUFFER, fbSkyBox);

	// The texture we're going to render to
	glGenTextures(1, &texSkyBox);

	// "Bind" the newly created texture : all future texture functions will modify this texture
	glBindTexture(GL_TEXTURE_CUBE_MAP, texSkyBox);

	glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_BASE_LEVEL, 0);
	glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAX_LEVEL, 0);
	glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR_MIPMAP_LINEAR);
	glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR);

	for(int loop = 0; loop < 6; loop++) {
		glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + loop, 0, GL_RGBA8, 1024, 1024, 0, GL_RGBA, GL_UNSIGNED_BYTE, 0);
	}

	glm::mat4 tProj = glm::ortho(0.0f,1024.0f,0.0f,1024.0f,0.0f,100.0f);
	glm::mat4 tMod = glm::mat4(1.0);
	glm::mat4 tView = glm::lookAt(
			glm::vec3(0,0,1), // Camera is at (0,0,1), in World Space
			glm::vec3(0,0,0), // and looks at the origin
			glm::vec3(0,1,0)  // Head is up (set to 0,1,0)
	);

	GLuint starProgramID = LoadShaders( "StarTexture.vp", "StarTexture.fp" );

	GLuint tProjMatrixID = glGetUniformLocation(starProgramID, "projection");
	GLuint tViewMatrixID = glGetUniformLocation(starProgramID, "view");
	GLuint tModelMatrixID = glGetUniformLocation(starProgramID, "model");

	GLuint testLoc = glGetUniformLocation(starProgramID, "test");
	// The fullscreen quad's FBO
	GLuint quad_VertexArrayID;
	glGenVertexArrays(1, &quad_VertexArrayID);
	glBindVertexArray(quad_VertexArrayID);

	static const GLfloat g_quad_vertex_buffer_data[] = {
			0.0f, 	0.0f, 	0.0f,
			1024.f,	0.0f, 	0.0f,
			0.0f,  	1024.f, 0.0f,
			0.0f,  	1024.f, 0.0f,
			1024.f,	0.0f, 	0.0f,
			1024.f,	1024.f, 0.0f
	};

	GLuint quad_vertexbuffer;
	glGenBuffers(1, &quad_vertexbuffer);
	glBindBuffer(GL_ARRAY_BUFFER, quad_vertexbuffer);
	glBufferData(GL_ARRAY_BUFFER, sizeof(g_quad_vertex_buffer_data), g_quad_vertex_buffer_data, GL_STATIC_DRAW);

	// Render to our framebuffer
	glBindFramebuffer(GL_FRAMEBUFFER, fbSkyBox);
	glViewport(0,0,1024,1024); // Render on the whole framebuffer, complete from the lower left corner to the upper right

	for (int face = 0; face < 6; face++) {
		// Set "renderedTexture" as our colour attachement #0
		glFramebufferTexture2D(GL_DRAW_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_CUBE_MAP_POSITIVE_X + face, texSkyBox, 0);

		// Set the list of draw buffers.
		GLenum DrawBuffers[1] = {GL_COLOR_ATTACHMENT0};
		glDrawBuffers(1, DrawBuffers); // "1" is the size of DrawBuffers

		// Always check that our framebuffer is ok
		if(glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
			std::cout << "Framebuffer error" << std::endl;
			exit(EXIT_FAILURE);
		}

		//// Dark blue background
		glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );
		glUseProgram(starProgramID);

		glUniformMatrix4fv(tProjMatrixID, 1, GL_FALSE, &tProj[0][0]);
		glUniformMatrix4fv(tModelMatrixID, 1, GL_FALSE, &tMod[0][0]);
		glUniformMatrix4fv(tViewMatrixID, 1, GL_FALSE, &tView[0][0]);

		glUniform1i(testLoc, face);
		// 1rst attribute buffer : vertices
		glEnableVertexAttribArray(0);
		glBindBuffer(GL_ARRAY_BUFFER, quad_vertexbuffer);
		glVertexAttribPointer(
				0,                  // attribute 0. No particular reason for 0, but must match the layout in the shader.
				3,                  // size
				GL_FLOAT,           // type
				GL_FALSE,           // normalized?
				0,                  // stride
				(void*)0            // array buffer offset
		);

		// Draw the triangles !
		glDrawArrays(GL_TRIANGLES, 0, 6); // 2*3 indices starting at 0 -> 2 triangles

		glDisableVertexAttribArray(0);
	}

	skyProgramID = LoadShaders( "SkyBox.vp", "SkyBox.fp" );

	skyProjMatrixID = glGetUniformLocation(skyProgramID, "projection");
	skyViewMatrixID = glGetUniformLocation(skyProgramID, "view");
	skyModelMatrixID = glGetUniformLocation(skyProgramID, "model");

	skyTexID = glGetUniformLocation(skyProgramID, "renderedTexture");

	// The fullscreen quad's FBO
	glGenVertexArrays(1, &cube_VertexArrayID);
	glBindVertexArray(cube_VertexArrayID);

	GLuint cube_vertexbuffer;
	glGenBuffers(1, &cube_vertexbuffer);
	glEnableVertexAttribArray(0);
	glBindBuffer(GL_ARRAY_BUFFER, cube_vertexbuffer);
	glBufferData(GL_ARRAY_BUFFER, sizeof(g_cube_buffer_data), g_cube_buffer_data, GL_STATIC_DRAW);
	glVertexAttribPointer(
			0,                  // attribute 0. No particular reason for 0, but must match the layout in the shader.
			3,                  // size
			GL_FLOAT,           // type
			GL_FALSE,           // normalized?
			0,                  // stride
			(void*)0            // array buffer offset
	);

	//	saveBMP("Star Texture.bmp", 1024, 1024);
}

void RenderSystem::drawSkyBox() {



}

void RenderSystem::showDebug(const int& debugNum, std::string debugLabel) {
	std::string label = "label='" + debugLabel + "'";
	TwAddVarRO(DebugGUI, debugLabel.c_str(), TW_TYPE_INT32, &debugNum, label.c_str());
}

void RenderSystem::initTw() {
	TwInit(TW_OPENGL_CORE, NULL);
	TwWindowSize(1024, 768);
	DebugGUI = TwNewBar("Debug");
	PlayerGUI = TwNewBar("Player");
}

void RenderSystem::showBounds(bool show) {
	bounds = show;
}

void RenderSystem::setShading(int shading) {
	mode = static_cast<RenderSystem::displayModes>(shading);
}

GLuint RenderSystem::LoadShaders(const std::string& vertex_file_path,const std::string& fragment_file_path){

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

//TODO: Remove this and bitmap library. Debug purposes only
void RenderSystem::saveBMP(std::string filename, int width, int height) {
	if (!save) {
		unsigned char *p;

		p = (unsigned char *) malloc(width * height * 3);
		glReadPixels(0, 0, width, height, GL_RGB, GL_UNSIGNED_BYTE, p);

		bitmap_image image(width, height);

		for (unsigned int x = 0; x < width; ++x)
		{
			for (unsigned int y = 0; y < height; ++y)
			{
				int index = (x + (height - y) * width) *3;
				image.set_pixel(x,y,p[index],p[index+1],p[index+2]);
			}
		}
		image.save_image(filename);
	}
}
