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
    height: 0.0,
    heights: {},
    dragging: false,
    dirty: false
}
var newNodeID = 0;
var emptyNodeIDs = [];
var value = '';
var valueH = 0.0;
const Node = (state = initialNodeState, action) => {
    switch (action.type) {
        case 'ADD_NODE':
            let id;
            if (emptyNodeIDs.length==0) id = newNodeID;
            else id = emptyNodeIDs.shift();
            return {
                nodeType: action.nodeType,
                id: id,
                pos: action.pos,
                Connections: [],
                output: action.output,
                input: action.input,
                height: action.height,
                heights: {},
                dragging: false
            };
        case 'REMOVE_NODE':
            return Object.assign({}, state, {
                Connections: state.Connections.filter(t => !action.connections.includes(t.id))
            })
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
                let heights = Object.assign({}, state.heights);
                input[action.Input.Field] = value;
                heights[action.Input.Field] = valueH;
                fromNode = true;
                return Object.assign({}, state, {
                    input: input,
                    heights: heights,
                    Connections: Connections(state.Connections, action),
                    dirty: true
                });
            }
            if (state.id === action.Output.Node) {
                fromNode = true;
                return Object.assign({}, state, {
                    Connections: Connections(state.Connections, action)
                });
            }
            let i = state.Connections.map(con => con.id).indexOf(currentConnectionID);
            if (i != -1)
                return Object.assign({}, state, {
                    Connections: [...state.Connections.slice(0,i), ...state.Connections.slice(i+1)]
                });
            break;
        case 'REMOVE_CONNECTIONS':
            let match = ConnectionsToRemove.filter(id => state.Connections.some(con => con.id == id))
            if (match.length != -1) {
                if (state.Connections.some(con => match.includes(con.id) && con.Input.Node == state.id)) {
                    let input = Object.assign({}, state.input);
                    let heights = Object.assign({}, state.heights);
                    state.Connections.forEach((con) => {
                        if (match.includes(con.id)) {
                            input[con.Input.Field] = '\0';
                            heights[con.Input.Field] = '';
                        }

                    })
                    return Object.assign({}, state, {
                        input: input,
                        heights: heights,
                        dirty: true,
                        Connections:  state.Connections.filter(con => !ConnectionsToRemove.includes(con.id))
                    });
                }
                return Object.assign({}, state, {
                    Connections:  state.Connections.filter(con => !ConnectionsToRemove.includes(con.id))
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
                    input: Object.assign({}, state.input, action.inputs),
                    output: Object.assign({}, state.output, action.outputs),
                    height: action.height,
                    dirty: false
                });
            }
            let conNodesArray = action.connectedNodes.slice(0);
            if (conNodesArray.indexOf(state.id) !== -1) {
                let Inputs = Object.assign({}, state.input);
                let Heights = Object.assign({}, state.heights);
                let i = -1;
                while ((i = conNodesArray.indexOf(state.id, i + 1)) !== -1) {
                    Inputs[action.connectedFields[i]] = action.outputs[action.outputFields[i]];
                    Heights[action.connectedFields[i]] = action.height;
                }
                return Object.assign({}, state, {
                    input: Inputs,
                    heights: Heights,
                    dirty: true
                });
            }
    }
    return state;
};

const Nodes = function(state = [], action) {
    switch (action.type) {
        case 'ADD_NODE':
            newNodeID = state.length;
            return [...state, Node(undefined, action)];
        case 'REMOVE_NODE':
            emptyNodeIDs.push(action.id);
            return state.map(t => Node(t, action)).filter(t => t.id != action.id)
        case 'ADD_CONNECTION':
            value = state[state.map(node => node.id).indexOf(action.Output.Node)].output[action.Output.Field];
            valueH = state[state.map(node => node.id).indexOf(action.Output.Node)].height;
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

var emptyConnectionIDs = [];
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
            if (!fromNode) {
                if (emptyConnectionIDs.length==0) currentConnectionID = state.length;
                else currentConnectionID = emptyConnectionIDs.shift();
            }
            else fromNode = false;
            return [...state, {id: currentConnectionID, Input: action.Input, Output: action.Output}]
        case 'REMOVE_CONNECTIONS':
            ConnectionsToRemove = state.filter(con => con[action.FieldType].Node == action.Node)
            ConnectionsToRemove = ConnectionsToRemove.filter(con => con[action.FieldType].Field == action.Field)
            ConnectionsToRemove = ConnectionsToRemove.map(con => con.id)
            emptyConnectionIDs.push(...ConnectionsToRemove);
            let Connections = state.slice(0)
            return Connections.filter(con => !ConnectionsToRemove.includes(con.id));
        case 'REMOVE_NODE':
            return state.filter(t => !action.connections.includes(t.id))
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

const Editor = (state = { dragging: false }, action) => {
    switch (action.type) {
        case 'TOGGLE_DRAG_EDITOR':
            return Object.assign({}, state, {
                dragging: !state.dragging
            });
    }
    return state;
}

const initialProgram = {
    Height: [0, 0],
    R: `1.0`,
    G: `1.0`,
    B: `1.0`,
    Width: 0.2,
}
const Program = (state = initialProgram, action) => {
    switch (action.type) {
        case 'SET_PROGRAM':
            return Object.assign({}, state, {
                Height: action.Height,
                R: action.R,
                G: action.G,
                B: action.B
            });
        case 'SET_WIDTH':
            return Object.assign({}, state, {
                Width: action.width
            })
    }
    return state;
}

const View = (state = "2D", action) => {
    switch (action.type) {
        case 'SWITCH_VIEW':
            if (state == "2D")
                return "3D"
            else
                return "2D"
    }
    return state;
}

export default combineReducers({
    Connections: Connections,
    Connecting: Connecting,
    Nodes: Nodes,
    Selected: Selected,
    Dragging: Dragging,
    Editor: Editor,
    Program: Program,
    View: View
});
