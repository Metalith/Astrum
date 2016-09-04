const addNode = (nodeType, pos, input, output) =>
    ({
        type: 'ADD_NODE',
        nodeType: nodeType,
        pos: pos,
        input: input,
        output: output
    })
const removeNode = (node, cons) =>
    ({
        type: 'REMOVE_NODE',
        id: node,
        connections: cons.map(con => con.id)
    })

const setPos = (node, pos) =>
    ({
        type: 'SET_POS',
        id: node,
        pos: pos
    })

const startConnecting = (node, field, type) =>
    ({
        type: 'START_CONNECTING',
        node: node,
        field: field,
        fieldType: type
    })

const stopConnecting = _ =>
    ({
        type: 'STOP_CONNECTING'
    })

const updateNode = (node, inputs, outputs, cons) =>
    ({
        type: 'UPDATE_NODE',
        node: node,
        inputs: inputs,
        outputs: outputs,
        outputFields: cons.map(con => con.Output.Field),
        connectedNodes: cons.map(con => con.Input.Node),
        connectedFields: cons.map(con => con.Input.Field)
    })

const startDragging = (id) =>
    ({
        type: 'START_DRAGGING',
        id: id
    })

const stopDragging = (id) =>
    ({
        type: 'STOP_DRAGGING',
        id: id
    })

const addConnection = (Input, Output) =>
    ({
        type: 'ADD_CONNECTION',
        Input: Input,
        Output: Output
    })
const removeConnections = (Type, Node, Field) =>
    ({
        type: 'REMOVE_CONNECTIONS',
        Node: Node,
        FieldType: Type,
        Field: Field
    })

const toggleDragEditor = () =>
    ({
        type: 'TOGGLE_DRAG_EDITOR'
    })

const setProgram = (Vertex, Fragment) =>
    ({
        type: 'SET_PROGRAM',
        Vertex: Vertex,
        Fragment: Fragment
    })

const switchView = () =>
    ({
        type: 'SWITCH_VIEW'
    })

export default {
    addNode: addNode,
    removeNode: removeNode,
    setPos: setPos,
    startDragging: startDragging,
    stopDragging: stopDragging,
    startConnecting: startConnecting,
    stopConnecting: stopConnecting,
    addConnection: addConnection,
    removeConnections: removeConnections,
    updateNode: updateNode,
    toggleDragEditor: toggleDragEditor,
    setProgram: setProgram,
    switchView: switchView
}
