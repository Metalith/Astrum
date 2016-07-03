# CMake entry point
cmake_minimum_required (VERSION 2.6)
project (Astrum)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -O -g")

find_package(OpenGL REQUIRED)
FIND_PACKAGE( Boost 1.61 COMPONENTS REQUIRED )

find_library(NOISE_LIBRARY
	NAMES libnoise.so
	PATHS /usr/lib /usr/local/lib
)

find_path(NOISE_INCLUDE_DIR
	NAMES libnoise/noise.h noise/noise.h
	PATHS /usr/include /usr/local/include
)

# Compile external dependencies
add_subdirectory (lib)

include_directories(
	${Boost_INCLUDE_DIR}
	${NOISE_INCLUDE_DIR}
	lib/AntTweakBar-1.16/include/
	lib/glfw-3.1.2/include/GLFW/
	lib/glm-0.9.7.1/
	lib/glew-1.13.0/include/
	src/
)

set(ALL_LIBS
	${Boost_LIBRARIES}
	${NOISE_LIBRARY}
	${OPENGL_LIBRARY}
	glfw
	GLEW_1130
)

add_definitions(
	-DTW_STATIC
	-DTW_NO_LIB_PRAGMA
	-DTW_NO_DIRECT3D
	-DGLEW_STATIC
	-D_CRT_SECURE_NO_WARNINGS
)

file(GLOB headers
	"src/common/*.cpp"
	"src/common/*.hpp"
	"src/dc/*.cpp"
	"src/dc/*.h"
	"src/systems/*.cpp"
	"src/systems/*.hpp"
	"src/engine.cpp"
	"src/engine.hpp"
)
add_executable(main
	src/main.cpp
	${headers}
)
target_link_libraries(main
	${ALL_LIBS}
	ANTTWEAKBAR_116_OGLCORE_GLFW
)

add_custom_command(
	TARGET main POST_BUILD
	COMMAND ${CMAKE_COMMAND} -E copy "${CMAKE_CURRENT_BINARY_DIR}/${CMAKE_CFG_INTDIR}/main${CMAKE_EXECUTABLE_SUFFIX}" "${CMAKE_CURRENT_SOURCE_DIR}/bin"
)
