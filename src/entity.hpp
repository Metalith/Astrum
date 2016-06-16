#ifndef LUNA_ENTITY
#define LUNA_ENTITY

class Entity {
	public:
		virtual void update() = 0; //TODO: Set to take float delta time;
		static void setEngine(Engine* engine) { engine = engine; }
		static Engine* getEngine() { return engine; }
	protected:
		static Engine* engine;
};
#endif
