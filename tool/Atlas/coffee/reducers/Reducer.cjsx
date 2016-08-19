initialState =
    Nodes: []
    Connecting: false
    Connections: []
    SelectedNode: -1
    SelectedField: ''

define ['redux'], () ->
    combineReducers = require('redux').combineReducers

    Node =  (state = {nodeType: '', id: -1, pos:{x:-1,y:-1}, Connections: []}, action) ->
        switch action.type
            when 'ADD_NODE'
                return {nodeType: action.nodeType, id: action.id, pos: action.pos, Connections: []}
            when 'SET_POS'
                if state.id != action.id then return state
                return Object.assign({}, state, {pos: action.pos})
            when 'ADD_CONNECTION'
                if state.id == action.node1.Node || state.id == action.node2.Node
                    return Object.assign({}, state, {Connections: Connections(state.Connections, action)})
        return state

    Nodes = (state = [], action) ->
        switch action.type
            when 'ADD_NODE'
                return [state..., Node(undefined, action)]
            when 'SET_POS', 'SET_VAL', 'ADD_CONNECTION'
                return state.map((t) => Node(t, action))
        return state
    Connections = (state = [], action) ->
        switch action.type
            when 'ADD_CONNECTION'
                return [state..., {id: action.id, Node1: action.node1, Node2: action.node2}]
        return state

    Connecting = (state = false, action) ->
        switch action.type
            when 'START_CONNECTING'
                return true
            when 'STOP_CONNECTING'
                return false
        return state

    Selected = (state = { Node: -1, Field: '', Type: ''}, action) ->
        switch action.type
            when 'START_CONNECTING'
                return {
                    Node: action.node
                    Field: action.field
                    Type: action.fieldType
                    HandlePos: action.handlePos
                    Value: action.value
                }
        return state

    return combineReducers({
        Nodes,
        Connections,
        Connecting,
        Selected
    })
