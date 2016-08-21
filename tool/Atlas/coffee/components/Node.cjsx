define ["react", "Actions", "Input", "Output"], (React, Actions, Input, Output) ->
    connect = require('reactredux').connect

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
            testA = [2132, 21, 52, 821, 29, 2003, 763]
            testB = [2, 5]
            console.log testB.map((i) -> testA[i])

        componentWillUpdate: (props, state) =>
            if !@state.dragging && state.dragging
                document.addEventListener('mousemove', @onDrag)
                document.addEventListener('mouseup', @onMouseUp)
            else if @state.dragging && !state.dragging
                document.removeEventListener('mousemove', @onDrag)
                document.removeEventListener('mouseup', @onMouseUp)
            console.log "b"

        onMouseDown: (e) =>
            if e.target.tagName != "INPUT" && !e.target.classList.contains("Field") && e.target.className != "Handle"
                @setState({
                    dragging: true
                    rel:
                        x: e.pageX - @state.pos.x
                        y: e.pageY - @state.pos.y
                })
                @props.dispatch(Actions.startDragging(@props.id))
                return false

        onDrag: (e) =>
            @setState({
                pos:
                    x: e.pageX - @state.rel.x
                    y: e.pageY - @state.rel.y
            })


        onMouseUp: (e) =>
            @setState({dragging: false})
            @props.dispatch(Actions.setPos(@props.id, @state.pos))

        render: ->
            return <div className="Node" id={"Node" + @props.id} style={position: "absolute", left: @state.pos.x, top: @state.pos.y} onMouseDown={@onMouseDown}>
                <Input input={@input} node={@props.id}/>
                <div className="Center"><div className="NodeName">{@name}</div><div className="Values">{@center()}</div></div>
                <Output output={@output} node={@props.id}/>
            </div>


    class TestNode extends Node
        name: 'Test Node'
        constructor: (props) ->
            super props
        input:
            TestInput: "Test"
        center: ->
            <input type="number" name="fname" onChange={@update}/>

    class ValueNode extends Node
        name: 'Value'
        constructor: (props) ->
            super props

        center: ->
            <input type="number" name="fname" value={@Value}/>
        Value: "20"
        input:
            Test: 0
        output:
            Val: 2

    class OutputNode extends Node
        name: 'Output'
        constructor: (props) ->
            super props
        center: -> ""
        input:
            Program: ""

    class MathNode extends Node
        name: 'Math'
        constructor: (props) ->
            super props
        center: -> ''
        input:
            Value1: 0
            Value2: 0
        output:
            Result: 0

    mapSelectedToProps = (state, ownProps) =>
        return {
            Selected: state.Selected
            Connections: ownProps.ConIDs.map((i) -> state.Connections[i])
        }

    return {
        TestNode: connect(mapSelectedToProps)(TestNode)
        Value: connect(mapSelectedToProps)(ValueNode)
        Output: connect(mapSelectedToProps)(OutputNode)
        MathNode: connect(mapSelectedToProps)(MathNode)
    }
