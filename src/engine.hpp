#ifndef LUNA_ENGINE_H
#define LUNA_ENGINE_H

#include "system.hpp"
#include <vector>

class Engine {
	public:
		Engine();
		void addSystem(System* sys);
		void update();
	private:
		std::vector<System*> m_SystemList;
};
#endif
