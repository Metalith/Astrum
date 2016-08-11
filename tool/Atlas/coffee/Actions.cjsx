define 'Actions', [''], () ->
    i = 0
    addNode = (nodeType, pos) ->
        return {
            type: 'ADD_NODE',
            nodeType: nodeType
            id: i++
            pos: pos
        }

    select = (node, field) ->
        return {
            type: 'SELECT'
            node: node
            field: field
        }
    # startConnection = (node)

    return {
        addNode: addNode
        select: select
    }
