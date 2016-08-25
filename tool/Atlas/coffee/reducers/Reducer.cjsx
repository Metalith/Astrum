initialState =
    Nodes: []
    Connecting: false
    Connections: []
    SelectedNode: -1
    SelectedField: ''

define ['redux'], () ->
    combineReducers = require('redux').combineReducers

    Node =  (state = {
        nodeType: ''
        id: -1
        pos:
            x:-1
            y:-1
        Connections: []
        output: {}
        input: {}
        dragging: false}, action) ->
        switch action.type
            when 'ADD_NODE'
                return {nodeType: action.nodeType, id: action.id, pos: action.pos, Connections: [], output: action.output, input: action.input, dragging: false}
            when 'SET_POS'
                if state.id != action.id then return state
                return Object.assign({}, state, {pos: action.pos, dragging: false})
            when 'ADD_CONNECTION'
                if state.id == action.Input.Node
                    input = Inputs = Object.assign({}, state.input)
                    input[action.Input.Field] = action.value
                    return Object.assign({}, state, {input: input, Connections: Connections(state.Connections, action)})
                if state.id == action.Output.Node
                    return Object.assign({}, state, {Connections: Connections(state.Connections, action)})
            when 'START_DRAGGING'
                if state.id == action.id
                    return Object.assign({}, state, {dragging: true})
            when 'STOP_DRAGGING'
                if state.id == action.id
                    return Object.assign({}, state, {dragging: false})
            when 'UPDATE_NODE'
                if state.id == action.node
                    return Object.assign({}, state, {input: action.inputs, output: action.outputs})
                conNodesArray = action.connectedNodes.slice(0)
                console.log conNodesArray.indexOf(state.id, 1)
                if (conNodesArray.indexOf(state.id) != -1)
                    Inputs = Object.assign({}, state.input)
                    i = -1
                    while (i = conNodesArray.indexOf(state.id, i+1)) != -1
                        Inputs[action.connectedFields[i]] = action.outputs[action.outputFields[i]]
                    return Object.assign({}, state, {input: Inputs})
        return state

    Nodes = (state = [], action) ->
        switch action.type
            when 'ADD_NODE'
                action.id = state.length
                return [state..., Node(undefined, action)]
            when 'ADD_CONNECTION'
                action.value = state[action.Output.Node].output[action.Output.Field]
                return state.map((t) => Node(t, action))
            when 'SET_POS', 'START_DRAGGING', 'STOP_DRAGGING', 'UPDATE_NODE'
                return state.map((t) => Node(t, action))
        return state
    Connections = (state = [], action) ->
        switch action.type
            when 'ADD_CONNECTION'
                action.id = state.length
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
