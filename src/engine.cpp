#include "engine.hpp"
#include "system.hpp"
#include <vector>

Engine::Engine() {}

void Engine::addSystem(System* sys) {
	m_SystemList.push_back(sys);	
}

void Engine::update() {
	for (auto* sys : m_SystemList)
		sys->update();
}
