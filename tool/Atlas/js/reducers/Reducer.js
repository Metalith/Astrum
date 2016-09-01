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

const Node = (state = initialNodeState, action) => {
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
                let input = Object.assign({}, state.input);
                input[action.Input.Field] = action.value;
                action.fromNode = true;
                return Object.assign({}, state, {
                    input: input,
                    Connections: Connections(state.Connections, action)
                });
            }
            if (state.id === action.Output.Node) {
                action.fromNode = true;
                return Object.assign({}, state, {
                    Connections: Connections(state.Connections, action)
                });
            }
            let i = state.Connections.map(con => con.id).indexOf(action.id);
            if (i != -1)
                return Object.assign({}, state, {
                    Connections: [...state.Connections.slice(0,i), ...state.Connections.slice(i+1)]
                });
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

const Nodes = function(state = [], action) {
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

var newConnectionID = 0;
const Connections = function(state = [], action) {
    switch (action.type) {
        case 'ADD_CONNECTION':
            let Inputs = state.map(con => con.Input.Node);
            let Fields = state.map(con  => con.Input.Field);
            if (!action.fromNode) {
                console.log(Inputs)
                console.log(Fields)
            }
            let i = Inputs.indexOf(action.Input.Node);
            let j = Fields.indexOf(action.Input.Field, i);
            console.log(i);
            console.log(j);
            if (i == j && i != -1 ) {
                let connections = [...state];
                if (action.fromNode) action.fromNode = false;
                action.id = state[i].id;
                connections[i] = {id: action.id, Input: action.Input, Output: action.Output}
                return [...state.slice(0,i), {id: action.id, Input: action.Input, Output: action.Output}, ...state.slice(i+1)];
                return state
            }
            if (!action.fromNode) action.id = newConnectionID++;
            else action.fromNode = false;
            return [...state, {id: action.id, Input: action.Input, Output: action.Output}]
    }
    return state;
}

const Connecting = function(state = false, action) {
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

const Selected = function(state = initialSelectedState, action) {
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

const Dragging = function(state = false, action) {
    switch (action.type) {
        case 'START_DRAGGING':
            return true;
        case 'STOP_DRAGGING':
            return false;
    }
    return state;
};

export default combineReducers({
    Connections: Connections,
    Connecting: Connecting,
    Nodes: Nodes,
    Selected: Selected,
    Dragging: Dragging
});
