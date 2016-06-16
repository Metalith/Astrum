#ifndef LUNA_SYSTEM
#define LUNA_SYSTEM

#include "components/component.hpp"
#include <iostream>
#include <vector>
#include <tuple>

class Engine;

class System {
	public:
		virtual void update() = 0; //TODO: Set to take float delta time;
		virtual void addEntity(int e) { entities.push_back(e); }
		template<class T> void setComponent() { T tmp = T(); componentIDs.push_back(tmp.getID()); }
		static void setEngine(Engine* engine) { System::engine = engine; }
		std::vector<int> getIDs() { return componentIDs; }
	protected:
		static Engine* engine;
		std::vector<int> componentIDs;
		std::vector<int> entities;

		virtual ~System() {}
};
#endif
