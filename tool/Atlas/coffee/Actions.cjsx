define 'Actions', [''], () ->
    addNode = (nodeType, pos) ->
        return {
            type: 'ADD_NODE',
            nodeType: nodeType
            pos: pos
        }

    registerType = (name, nodeType) ->
        return {
            type: 'REGISTER_NODETYPE'
            name: name
            nodeType: nodeType
        }

    return {
        addNode: addNode
        registerType: registerType
    }
