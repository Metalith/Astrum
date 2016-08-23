define 'Actions', [''], () ->
    addNode = (nodeType, pos, input) ->
        return {
            type: 'ADD_NODE',
            nodeType: nodeType
            pos: pos
            input: input
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
    }
