define 'Actions', [''], () ->
    addNode = (nodeType, pos) ->
        return {
            type: 'ADD_NODE',
            nodeType: nodeType
            pos: pos
        }

    return {
        addNode: addNode
    }
