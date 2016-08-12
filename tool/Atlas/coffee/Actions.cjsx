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

    select = (node, field, type) ->
        return {
            type: 'SELECT'
            node: node
            field: field
            fieldType: type
        }

    stopConnecting = () ->
        return {
            type: 'STOP_CONNECTING'
        }

    return {
        addNode: addNode
        setPos: setPos
        select: select
        stopConnecting: stopConnecting
    }
