define 'Actions', [''], () ->
    addNode = (nodeType, pos, input, output) ->
        return {
            type: 'ADD_NODE',
            nodeType: nodeType
            pos: pos
            input: input
            output: output
        }
    setPos = (node, pos) ->
        return {
            type: 'SET_POS'
            id: node
            pos: pos
        }

    startConnecting = (node, field, type) ->
        return {
            type: 'START_CONNECTING'
            node: node
            field: field
            fieldType: type
        }

    stopConnecting = () ->
        return {
            type: 'STOP_CONNECTING'
        }

    updateNode = (node, inputs, outputs, cons) ->
        return {
            type: 'UPDATE_NODE'
            node: node
            inputs: inputs
            outputs: outputs
            outputFields: cons.map((con) -> con.Output.Field)
            connectedNodes: cons.map((con) -> con.Input.Node)
            connectedFields: cons.map((con) -> con.Input.Field)
        }

    startDragging = (id) ->
        return {
            type: 'START_DRAGGING'
            id: id
        }

    stopDragging = (id) ->
        return {
            type: 'STOP_DRAGGING'
            id: id
        }

    addConnection = (Input, Output) ->
        return {
            type: 'ADD_CONNECTION'
            Input: Input
            Output: Output
    }

    return {
        addNode: addNode
        setPos: setPos
        startDragging: startDragging
        stopDragging: stopDragging
        startConnecting: startConnecting
        stopConnecting: stopConnecting
        addConnection: addConnection
        updateNode: updateNode
    }
