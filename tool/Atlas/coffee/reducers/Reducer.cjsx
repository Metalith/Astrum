initialState =
    Nodes: []
    Connecting: false
    Connections: []
    SelectedNode: -1
    SelectedField: ''

define ['redux'], () ->
    combineReducers = require('redux').combineReducers

    Nodes = (state = [], action) ->
        # if (typeof state == 'undefined')
        #     return initialState
        switch action.type
            when 'ADD_NODE'
                return [state..., {nodeType: action.nodeType, id: action.id, initPos: action.pos}]
        return state

    Connecting = (state = false, action) ->
        switch action.type
            when 'SELECT'
                return true
        return state

    Selected = (state = { Node: -1, Field: ''}, action) ->
        switch action.type
            when 'SELECT'
                return {
                    Node: action.node
                    Field: action.field
                }
        return state



    return combineReducers({
        Nodes,
        Connecting,
        Selected
    })
