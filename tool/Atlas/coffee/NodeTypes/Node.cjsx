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
                onMouseDown={(e) => @el.classList.add('sel'); @props.startConnection @props.field, @props.type; e.stopPropagation()}
                onMouseEnter={() => @el.classList.add('hov')}
                onMouseLeave={() => @el.classList.remove('hov')}>
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
            newPos = {
                x: e.pageX - @state.rel.x
                y: e.pageY - @state.rel.y
            }
            for i, Con of @props.Connections
                Connector = document.querySelector "#Connector" + Con.id
                h1 = document.querySelector("#Node" + Con.Node1.Node).getBoundingClientRect()
                h2 = document.querySelector("#Node" + Con.Node2.Node).getBoundingClientRect()
                Handle1 = {}
                Handle2 = {}
                if (Con.Node1.Node == @props.id)
                    Handle1 =
                        x: e.pageX - @state.rel.x + Con.Node1.HandlePos.x
                        y: e.pageY - @state.rel.y + Con.Node1.HandlePos.y
                    Handle2 =
                        x: h2.left + Con.Node2.HandlePos.x
                        y: h2.top + Con.Node2.HandlePos.y
                else
                    Handle1 =
                        x: h1.left + Con.Node1.HandlePos.x
                        y: h1.top + Con.Node1.HandlePos.y
                    Handle2 =
                        x: e.pageX - @state.rel.x + Con.Node2.HandlePos.x
                        y: e.pageY - @state.rel.y + Con.Node2.HandlePos.y
                d = "M" + Handle1.x + " " + Handle1.y
                d += "h-50"
                if (Handle1.x < Handle2.x + 100)
                    half = (Handle2.y - Handle1.y) / 2
                    height = 0
                    if (half >= 0)
                        height = h1.bottom - h2.top
                    else
                        height = h2.bottom - h1.top
                    if  height + 25 >= 0
                        h = h1.height+h2.height+25
                        t = 1
                        if (half < 0)
                            t = -1
                        d += "v"+(t * h)
                        d += "H"+(Handle2.x+50)
                        d += "v"+(t*(-h+(t*half)*2))
                        d += "h-50"
                    else
                        d += "v"+half
                        d += "H"+(Handle2.x+50)
                        d += "v"+half
                        d += "h-50"
                else
                    half = (Handle2.x - Handle1.x) / 2 + 50
                    d += "h"+half
                    d += "V"+(Handle2.y)
                    d += "h"+half
                    d += "h-50"
                Connector.setAttribute("d", d)
            @setState({
                pos: newPos
            })

        onMouseUp: (e) =>
            @setState({dragging: false})
            @props.dispatch(Actions.setPos(@props.id, @state.pos))

        startConnection: (field, type) =>
            handleRect = document.querySelector("#Node" + @props.id+">."+type+">#"+field+">.Handle").getBoundingClientRect()
            handlePos =
                x: handleRect.left + handleRect.width / 2 - @state.pos.x
                y: handleRect.top + handleRect.height / 2 - @state.pos.y
            @props.dispatch Actions.startConnecting @props.id, field, type, handlePos
            document.addEventListener 'mouseup', @endConnection

        endConnection: (e) =>
            @props.dispatch Actions.stopConnecting()
            if (e.target.classList.contains("Field"))
                if e.target.parentElement.className != @props.Selected.Type
                    if e.target.parentElement.parentElement.id != "Node" + @props.Selected.Node
                        handleRect = e.target.querySelector('.Handle').getBoundingClientRect()
                        handlePos =
                            x: handleRect.left + handleRect.width / 2 -  e.target.parentElement.parentElement.offsetLeft
                            y: handleRect.top + handleRect.height / 2 -  e.target.parentElement.parentElement.offsetTop
                        if @props.Selected.Type == "Input"
                            @props.dispatch Actions.addConnection @props.Selected, {
                                Node: parseInt(e.target.parentElement.parentElement.id.replace( /^\D+/g, ''))
                                Field: e.target.textContent
                                Type: e.target.parentElement.className
                                HandlePos: handlePos}
                        else
                            @props.dispatch Actions.addConnection {
                                Node: parseInt(e.target.parentElement.parentElement.id.replace( /^\D+/g, ''))
                                Field: e.target.textContent
                                Type: e.target.parentElement.className
                                HandlePos: handlePos},
                                @props.Selected
                    else
                        alert("Error: Cannot connect a node to itself")
                else
                    alert "Error: Fields of same type"
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
            GreenInput: "2"
        center: "Test Center"
        output:
            TestOutput: "Test"
            TestOutput2: "test"
            TestOutput3: "Blue"

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
