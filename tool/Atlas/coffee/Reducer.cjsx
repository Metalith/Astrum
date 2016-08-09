initialState =
    { Nodes: [] }

define ['redux'], () ->
    combineReducers = require('redux').combineReducers

    Nodes = (state = [], action) ->
        # if (typeof state == 'undefined')
        #     return initialState
        switch action.type
            when 'ADD_NODE'
                return [state..., {nodeType: action.nodeType, pos: action.pos}]
        return state

    return combineReducers({
        Nodes
    })
