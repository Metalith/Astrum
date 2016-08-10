# class Node {
#     Name:
#     id:
#     connections: [{nodex, nodex.output.rgb, "output", input.rgb},
#                 {nodey, nodey.input.rgba, "input", output.rgb}]
#     constructor: ->
#         generateHTML
#     input:
#         RGB:
#             type: vec3
#             connection: {nodex, nodex.output.rgb}
#             value: vec3(0, 0, 0)
#     output:
#         RGB:
#             type: vec3
#             connection: nodey.input.rgba
#             value: ->
#                 return value / 3;
#     update: ->
#         for field in inputs
#             if connected
#                 field.value = connection.value
#     value: ->
#         sum = 0;
#         for input in inputs
#             sum += input.value
#     center: ->
#         return html or none
#     onConnect: (connection)->
#         if (connection[0][2] == "output") {
#             input[connection[4]].connection = connection;
#             input[connection[4]].value = connection[2]()
#
#         }
#         background.addConnection(connection)
#         update
# }
#
# var nodeArray
# getNode(el) -> return nodeArray[el.id];
# # Events
# on hover addClass selected
#
# on mouseup
#     if connecting
# Turn to backbone if need more readability and maintainability
define ["react"], (React) ->
    # class Node extends React.component
    #     name: ''
    #     id: -1
    #     connections: []
    #     # constructor: (x, y) ->
    #     #     Header  = '<div class="Node" id="Node'+@id+'" style="left:'+x+'px; top:'+y+'px">'
    #     #     Title   = '<div class="NodeName">'+@name+'</div>'
    #     #     Input   = ""
    #     #     for k,v of @input
    #     #         Input += '<div class="Field">'+k+'<div class="Handle"></div></div><br>'
    #     #     Input = '<div class="Input">'+Input+'</div>'
    #     #     Center = '<div class="Center">'+@center+'</div>'
    #     #     Output = "";
    #     #     for k,v of @output
    #     #       Output += '<div class="Field">' + k + '<div class="Handle"></div></div><br>';
    #     #     Output = '<div class="Output">' + Output + '</div>';
    #     #     $("body").append Header+Title+Input+Center+Output
    #     #     # $('.Node').draggable
    #     #     #     containment: "window"
    #     #     #     cancel: ".Handle, .Center, .Field"
    #     constructor: (props) ->
    #         super props
    #         @state =
    #           test: 123
    #     render: ->
    #         React.createElement('li', null, 'Second Text Content');
    #     input: ''
    #     center: ''
    #     output: ''
    class Node extends React.Component
        el: ''
        constructor: (props) ->
            super props

        render: ->
            Title   = <div className="NodeName">{@name}</div>
            Input = <div className="Input">
                {for k,v of @input
                    <div className="Field">{k}<div className="Handle"></div></div>}
            </div>
            Center = <div className="Center">{@center}</div>
            Output = <div className="Output">
                {for k,v of @output
                    <div className="Field">{k}<div className="Handle"></div></div>}
            </div>
            return <div className="Node" style={position: "absolute", left: @props.pos[0], top: @props.pos[1]}>
                    {Title}
                    {Input}
                    {Center}
                    {Output}
            </div>

    class TestNode extends Node
        name: 'Test Node'
        constructor: (props) ->
            super props
        input:
            TestInput: "Test"
        center: "Test Center"
        output:
            TestOutput: "Test"

    return {
        Node: Node
        TestNode: TestNode
    }
