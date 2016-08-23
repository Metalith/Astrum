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
            @input = @constructor.input
            if @props.inputs
                @input = @props.inputs

        componentWillUpdate: (props, state) =>
            if !@state.dragging && state.dragging
                document.addEventListener('mousemove', @onDrag)
                document.addEventListener('mouseup', @onMouseUp)
            else if @state.dragging && !state.dragging
                document.removeEventListener('mousemove', @onDrag)
                document.removeEventListener('mouseup', @onMouseUp)

        componentWillReceiveProps: (nextProps) ->
            @input = nextProps.inputs

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
                <Input input={@input} node={@props.id} cons={@props.cons}/>
                <div className="Center"><div className="NodeName">{@name}</div><div className="Values">{@center()}</div></div>
                <Output output={@output} node={@props.id}/>
            </div>


    class TestNode extends Node
        name: 'Test Node'
        constructor: (props) ->
            super props
        @input:
            TestInput: ''
        center: ->
            <input type="number" name="fname" onChange={@update}/>

    class ValueNode extends Node
        name: 'Value'
        constructor: (props) ->
            super props
        center: =>
            <input type="number" onChange={(e) => @props.update 0, {Value: e.target.value}; @props.update 1, {Value: e.target.value}} value={@input.Value}/>
        @input:
            Value: 10
        output:
            Value: 10

    class OutputNode extends Node
        name: 'Output'
        constructor: (props) ->
            super props
        center: -> ""
        @input:
            Program: ""

    class MathNode extends Node
        name: 'Math'
        constructor: (props) ->
            super props
        center: -> ''
        @input:
            Value1: 0
            Value2: 0
        output:
            Result: 0

    return {
        TestNode: connect()(TestNode)
        Value: connect()(ValueNode)
        Output: connect()(OutputNode)
        MathNode: connect()(MathNode)
    }
