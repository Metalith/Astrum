#include "engine.hpp"
#include "components/component.hpp"
#include "components/mesh.hpp"
#include "systems/system.hpp"
#include <iostream>
#include <vector>

Engine::Engine() {
	System::setEngine(this);
}


void Engine::update() {
	for (int e : added) {
		for (auto* c : entities[e]) {
			for (auto* sys : systemList) {
				for (int id : sys->getIDs()) {
					if (id == c->getID()) {
						sys->addEntity(e);
					}
				}
			}
		}
	}
	added.clear();
	for (auto* sys : systemList)
		sys->update();
	//std::cout << "update" << std::endl;
}

void Engine::addSystem(System* sys) {
	systemList.push_back(sys);
}

void Engine::addComponent(int id, Component* c) {
	entities[id].push_back(c);
}

int Engine::createEntity() {
	entities.push_back(std::vector<Component*>());
	added.push_back(entities.size() - 1);
	return entities.size() - 1;
}
