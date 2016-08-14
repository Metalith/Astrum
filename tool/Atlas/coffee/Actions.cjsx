define 'Actions', [''], () ->
    i = 0
    addNode = (nodeType, pos) ->
        return {
            type: 'ADD_NODE',
            nodeType: nodeType
            id: i++
            pos: pos
        }
    setPos = (node, pos) ->
        return {
            type: 'SET_POS'
            id: node
            pos: pos
        }

    startConnecting = (node, field, type, handlePos) ->
        return {
            type: 'START_CONNECTING'
            node: node
            field: field
            fieldType: type
            handlePos: handlePos
        }

    stopConnecting = () ->
        return {
            type: 'STOP_CONNECTING'
        }

    j = 0
    addConnection = (node1, node2) ->
        return {
            type: 'ADD_CONNECTION'
            id: j++
            node1: node1
            node2: node2
    }

    return {
        addNode: addNode
        setPos: setPos
        startConnecting: startConnecting
        stopConnecting: stopConnecting
        addConnection: addConnection
    }
