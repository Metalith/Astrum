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
    dragging: false,
    dirty: false
}
var newNodeID = 0;
var emptyNodeIDs = [];
var value = '';
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
                input[action.Input.Field] = value;
                fromNode = true;
                return Object.assign({}, state, {
                    input: input,
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
                    output: action.outputs,
                    dirty: false
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
                    input: Inputs,
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
    Vertex: `
    vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
    varying vec3 pos;
    void main() {
        vec3 newPosition = vec3(position.xy,position.z + snoise(position.xy) * 20.0);
        pos = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition,1.0);
    }`,
    Fragment: `
    varying vec3 pos;
    void main(void) {
        vec3 N = normalize(cross(dFdx(pos), dFdy(pos)));
        // vec3 L = normalize(vec3(50, 50, 50));
        // vec4 diffuse = vec4(0.4, 0.4, 1.0, 1.0) * max(dot(L, N), 0.0);
        gl_FragColor = vec4(N, 1.0);
    }
    `
}
const Program = (state = initialProgram, action) => {
    switch (action.type) {
        case 'SET_PROGRAM':
            return Object.assign({}, state, {
                Vertex: action.Vertex,
                Fragment: action.Fragment
            });
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
