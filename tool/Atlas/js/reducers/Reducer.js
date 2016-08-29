import { combineReducers } from 'redux';

var initialNodeState  = {
    nodeType: '',
    id: -1,
    pos: {
        x: -1,
        y: -1
    },
    Connections: [],
    output: {},
    input: {},
    dragging: false
}
var Node = (state = initialNodeState, action) => {
    switch (action.type) {
        case 'ADD_NODE':
            return {
                nodeType: action.nodeType,
                id: action.id,
                pos: action.pos,
                Connections: [],
                output: action.output,
                input: action.input,
                dragging: false
            };
        case 'SET_POS':
            if (state.id == action.id) {
                return Object.assign({}, state, {
                    pos: action.pos,
                    dragging: false
                })
            }
            break;
        case 'ADD_CONNECTION':
            if (state.id === action.Input.Node) {
                let input = Inputs = Object.assign({}, state.input);
                input[action.Input.Field] = action.value;
                return Object.assign({}, state, {
                    input: input,
                    Connections: Connections(state.Connections, action)
                });
            }
            if (state.id === action.Output.Node) {
                return Object.assign({}, state, {
                    Connections: Connections(state.Connections, action)
                });
            }
            break;
        case 'START_DRAGGING':
            if (state.id === action.id) {
                return Object.assign({}, state, {
                    dragging: true
                });
            }
            break;
        case 'STOP_DRAGGING':
            if (state.id === action.id) {
                return Object.assign({}, state, {
                    dragging: false
                });
            }
            break;
        case 'UPDATE_NODE':
            if (state.id === action.node) {
                return Object.assign({}, state, {
                    input: action.inputs,
                    output: action.outputs
                });
            }
            let conNodesArray = action.connectedNodes.slice(0);
            if (conNodesArray.indexOf(state.id) !== -1) {
                let Inputs = Object.assign({}, state.input);
                let i = -1;
                while ((i = conNodesArray.indexOf(state.id, i + 1)) !== -1) {
                    Inputs[action.connectedFields[i]] = action.outputs[action.outputFields[i]];
                }
                return Object.assign({}, state, {
                    input: Inputs
                });
            }
    }
    return state;
};

var Nodes = function(state = [], action) {
    switch (action.type) {
        case 'ADD_NODE':
            action.id = state.length;
            return [...state, Node(undefined, action)];
        case 'ADD_CONNECTION':
            action.value = state[action.Output.Node].output[action.Output.Field];
            return state.map(t => Node(t, action));
        case 'SET_POS':
        case 'START_DRAGGING':
        case 'STOP_DRAGGING':
        case 'UPDATE_NODE':
            return state.map(t => Node(t, action));
        }
    return state;
};

var Connections = function(state = [], action) {
    switch (action.type) {
        case 'ADD_CONNECTION':
            action.id = state.length;
            return [...state, {id: action.id, Input: action.Input, Output: action.Output}]
    }
    return state;
}

var Connecting = function(state = false, action) {
    switch (action.type) {
        case 'START_CONNECTING':
            return true;
        case 'STOP_CONNECTING':
            return false;
    }
    return state;
};

var initialSelectedState = {
    Node: -1,
    Field: '',
    Type: ''
};

var Selected = function(state = initialSelectedState, action) {
    switch (action.type) {
        case 'START_CONNECTING':
            return {
                Node: action.node,
                Field: action.field,
                Type: action.fieldType
            };
    }
    return state;
};

var Dragging = function(state = false, action) {
    switch (action.type) {
        case 'START_DRAGGING':
            return true;
        case 'STOP_DRAGGING':
            return false;
    }
    return state;
};

export default combineReducers({
    Nodes: Nodes,
    Connections: Connections,
    Connecting: Connecting,
    Selected: Selected,
    Dragging: Dragging
});
