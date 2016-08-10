define ["react"], (React) ->
    class Node extends React.Component
        el: ''
        constructor: (props) ->
            super props
            @state =
                dragging: false
                pos:
                    x: @props.pos[0]
                    y: @props.pos[1]
                rel: null

        componentWillUpdate: (props, state) =>
            if !@state.dragging && state.dragging
                document.addEventListener('mousemove', @onMouseMove)
                document.addEventListener('mouseup', @onMouseUp)
            else if @state.dragging && !state.dragging
                document.removeEventListener('mousemove', @onMouseMove)
                document.removeEventListener('mouseup', @onMouseUp)

        onMouseDown: (e) =>
            if e.target.tagName != "INPUT" && e.target.className != "Field" && e.target.className != "Handle"
                @setState({
                    dragging: true
                    rel:
                        x: e.pageX - @state.pos.x
                        y: e.pageY - @state.pos.y
                })

        onMouseMove: (e) =>
            @setState({
                pos:
                    x: e.pageX - @state.rel.x
                    y: e.pageY - @state.rel.y
            })

        onMouseUp: (e) =>
            @setState({dragging: false})

        preventDrag: (e) ->
            e.stopPropagation()

        render: ->
            # Title   = <div className="NodeName">{@name}</div>
            i = 0
            Input = <div className="Input"><br />
                {for k,v of @input
                    <div className="Field" key={i++}>{k}<div className="Handle"></div></div>}
            </div>
            Center = <div className="Center"><div className="NodeName">{@name}</div><div className="Values">{@center}</div></div>
            Output = <div className="Output"><br />
                {for k,v of @output
                    <div className="Field" key={i++}>{k}<div className="Handle"></div></div>}
            </div>
            return <div className="Node" style={position: "absolute", left: @state.pos.x, top: @state.pos.y} onMouseDown={@onMouseDown}>
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

    class ValueNode extends Node
        name: 'Value'
        constructor: (props) ->
            super props
        center: <input type="number" name="fname" onChange={() -> }/>
        output:
            Val: () -> @Value

    class OutputNode extends Node
        name: 'Output'
        constructor: (props) ->
            super props
        center: ""
        input:
            Program: ""

    return {
        Node: Node
        TestNode: TestNode
        Value: ValueNode
        Output: OutputNode
    }
