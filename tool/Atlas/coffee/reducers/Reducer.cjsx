initialState =
    Nodes: []
    Connecting: false
    Connections: []
    SelectedNode: -1
    SelectedField: ''

define ['redux'], () ->
    combineReducers = require('redux').combineReducers
    Node =  (state = {nodeType: '', id: -1, pos:{x:-1,y:-1}}, action) ->
        switch action.type
            when 'ADD_NODE'
                return {nodeType: action.nodeType, id: action.id, pos: action.pos}
            when 'SET_POS'
                if state.id != action.id then return state

                return Object.assign({}, state, {pos: action.pos})
        return state

    Nodes = (state = [], action) ->
        switch action.type
            when 'ADD_NODE'
                return [state..., Node(undefined, action)]
            when 'SET_POS'
                return state.map((t) => Node(t, action))
        return state

    Connecting = (state = false, action) ->
        switch action.type
            when 'SELECT'
                return true
            when 'STOP_CONNECTING'
                return false
        return state

    Selected = (state = { Node: -1, Field: '', Type: ''}, action) ->
        switch action.type
            when 'SELECT'
                return {
                    Node: action.node
                    Field: action.field
                    Type: action.fieldType
                }
        return state

    return combineReducers({
        Nodes,
        Connecting,
        Selected
    })
