initialState =
    Nodes: []
    Connecting: false
    Connections: []
    SelectedNode: -1
    SelectedField: ''

define ['redux'], () ->
    combineReducers = require('redux').combineReducers

    Node =  (state = {nodeType: '', id: -1, pos:{x:-1,y:-1}, Connections: [], dragging: false}, action) ->
        switch action.type
            when 'ADD_NODE'
                return {nodeType: action.nodeType, id: action.id, pos: action.pos, Connections: [], dragging: false}
            when 'SET_POS'
                if state.id != action.id then return state
                return Object.assign({}, state, {pos: action.pos, dragging: false})
            when 'ADD_CONNECTION'
                if state.id == action.Input.Node || state.id == action.Output.Node
                    return Object.assign({}, state, {Connections: [state.Connections..., action.id]})
            when 'START_DRAGGING'
                if state.id == action.id
                    return Object.assign({}, state, {dragging: true})
            when 'STOP_DRAGGING'
                if state.id == action.id
                    return Object.assign({}, state, {dragging: false})
        return state

    Nodes = (state = [], action) ->
        switch action.type
            when 'ADD_NODE'
                return [state..., Node(undefined, action)]
            when 'SET_POS', 'SET_VAL', 'ADD_CONNECTION', 'START_DRAGGING', 'STOP_DRAGGING'
                return state.map((t) => Node(t, action))
        return state
    Connections = (state = [], action) ->
        switch action.type
            when 'ADD_CONNECTION'
                return [state..., {id: action.id, Input: action.Input, Output: action.Output}]
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
                }
        return state

    Dragging = (state = false, action) ->
        switch action.type
            when 'START_DRAGGING'
                return true
            when 'STOP_DRAGGING'
                return false
        return state

    return combineReducers({
        Nodes,
        Connections,
        Connecting,
        Selected,
        Dragging
    })
