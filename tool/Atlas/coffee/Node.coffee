class Node {
    Name:
    id:
    connections: [{nodex, nodex.output.rgb, "output", input.rgb},
                {nodey, nodey.input.rgba, "input", output.rgb}]
    constructor: ->
        generateHTML
    input:
        RGB:
            type: vec3
            connection: {nodex, nodex.output.rgb}
            value: vec3(0, 0, 0)
    output:
        RGB:
            type: vec3
            connection: nodey.input.rgba
            value: ->
                return value / 3;
    update: ->
        for field in inputs
            if connected
                field.value = connection.value
    value: ->
        sum = 0;
        for input in inputs
            sum += input.value
    center: ->
        return html or none
    onConnect: (connection)->
        if (connection[0][2] == "output") {
            input[connection[4]].connection = connection;
            input[connection[4]].value = connection[2]()

        }
        background.addConnection(connection)
        update
}

var nodeArray
getNode(el) -> return nodeArray[el.id];
# Events
on hover addClass selected

on mouseup
    if connecting
