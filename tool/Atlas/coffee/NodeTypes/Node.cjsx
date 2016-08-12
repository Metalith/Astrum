define ["react", "Actions"], (React, Actions) ->

    class NodeField extends React.Component
        constructor: (props) ->
            super props

        render: ->
            # if @state.hovering
            #     classes = "Field " + "hov"
            # else if @state.selectedclasses = "Field"
            <div className="Field" id={@props.field}
                ref={(c) => @el = c}
                onMouseDown={(e) => @el.classList.toggle('sel'); @props.startConnection @props.field, @props.type; e.stopPropagation()}
                onMouseEnter={() => @el.classList.toggle('hov')}
                onMouseLeave={() => @el.classList.toggle('hov')}>
                {@props.field}
                <div className="Handle"></div></div>

    class Node extends React.Component
        el: ''
        constructor: (props) ->
            super props
            @state =
                dragging: false
                pos:
                    x: @props.pos.x
                    y: @props.pos.y
                rel: null

        componentWillUpdate: (props, state) =>
            if !@state.dragging && state.dragging
                document.addEventListener('mousemove', @onDrag)
                document.addEventListener('mouseup', @onMouseUp)
            else if @state.dragging && !state.dragging
                document.removeEventListener('mousemove', @onDrag)
                document.removeEventListener('mouseup', @onMouseUp)

        onMouseDown: (e) =>
            if e.target.tagName != "INPUT" && e.target.className != "Field" && e.target.className != "Handle"
                @setState({
                    dragging: true
                    rel:
                        x: e.pageX - @state.pos.x
                        y: e.pageY - @state.pos.y
                })

        onDrag: (e) =>
            @setState({
                pos:
                    x: e.pageX - @state.rel.x
                    y: e.pageY - @state.rel.y
            })

        onMouseUp: (e) =>
            @setState({dragging: false})
            @props.dispatch(Actions.setPos(@props.id, @state.pos))

        startConnection: (field, type) =>
            @props.dispatch Actions.select @props.id, field, type
            document.addEventListener 'mouseup', @endConnection

        endConnection: (e) =>
            @props.dispatch Actions.stopConnecting()
            if (e.target.classList.contains("Field"))
                alert(e.target.className)
            document.removeEventListener 'mouseup', @endConnection

        render: ->
            i = 0
            Input = <div className="Input"><br />
                {for k,v of @input
                    <NodeField key={++i} field={k} type={"Input"} startConnection={@startConnection}/>}
            </div>
            Center = <div className="Center"><div className="NodeName">{@name}</div><div className="Values">{@center}</div></div>
            Output = <div className="Output"><br />
                {for k,v of @output
                    <NodeField key={++i} field={k} type={"Output"} startConnection={@startConnection}/>}
            </div>
            return <div className="Node" id={"Node" + @props.id} style={position: "absolute", left: @state.pos.x, top: @state.pos.y} onMouseDown={@onMouseDown}>
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
