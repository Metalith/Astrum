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
var newNodeID = 0;
var value = '';
const Node = (state = initialNodeState, action) => {
    switch (action.type) {
        case 'ADD_NODE':
            return {
                nodeType: action.nodeType,
                id: newNodeID++,
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
                input[action.Input.Field] = value;
                fromNode = true;
                return Object.assign({}, state, {
                    input: input,
                    Connections: Connections(state.Connections, action)
                });
            }
            if (state.id === action.Output.Node) {
                fromNode = true;
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
        case 'REMOVE_CONNECTIONS':
            return Object.assign({}, state, {
                Connections:  state.Connections.filter(con => !ConnectionsToRemove.includes(con.id))
            });
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
            return [...state, Node(undefined, action)];
        case 'ADD_CONNECTION':
            value = state[action.Output.Node].output[action.Output.Field];
            return state.map(t => Node(t, action));
        case 'REMOVE_CONNECTIONS':
        case 'SET_POS':
        case 'START_DRAGGING':
        case 'STOP_DRAGGING':
        case 'UPDATE_NODE':
            return state.map(t => Node(t, action));
        }
    return state;
};

var newConnectionID = 0;
var currentConnectionID = 0;
var fromNode = false;
var ConnectionsToRemove = [];
const Connections = function(state = [], action) {
    switch (action.type) {
        case 'ADD_CONNECTION':
            let MatchCons = state.filter(con => con.Input.Node == action.Input.Node)
            let MatchedCon = MatchCons.filter(con => con.Input.Field == action.Input.Field)[0]
            if (MatchedCon) {
                if (fromNode) fromNode = false;
                currentConnectionID = MatchedCon.id;
                let i = state.map(con => con.id).indexOf(MatchedCon.id)
                return [...state.slice(0,i), {id: currentConnectionID, Input: action.Input, Output: action.Output}, ...state.slice(i+1)];
            }
            if (!fromNode) currentConnectionID = newConnectionID++;
            else fromNode = false;
            return [...state, {id: currentConnectionID, Input: action.Input, Output: action.Output}]
        case 'REMOVE_CONNECTIONS':
            ConnectionsToRemove = state.filter(con => con[action.FieldType].Node == action.Node)
            ConnectionsToRemove = ConnectionsToRemove.filter(con => con[action.FieldType].Field == action.Field)
            ConnectionsToRemove = ConnectionsToRemove.map(con => con.id)
            let Connections = state.slice(0)
            return Connections.filter(con => !ConnectionsToRemove.includes(con.id));
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
