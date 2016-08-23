define ["react"], (React) ->
    connect = require('reactredux').connect

    class Connector extends React.Component
        d: 'M150 150 L0 0'
        constructor: (props) ->
            super props
            @state = {
                update: true
            }

        componentWillUpdate: (nextProps, nextState) =>
            if (!@props.Input.dragging && nextProps.Input.dragging) || (!@props.Output.dragging && nextProps.Output.dragging)
                document.addEventListener('mousemove', @updateD)
            else if @props.Input.dragging && !nextProps.Input.dragging
                document.removeEventListener('mousemove', @updateD) || (@props.Output.dragging && !nextProps.Output.dragging)
        componentWillMount: ->
            @updateD()
        updateD: =>
            InHandleRect = document.querySelector('#Node'+@props.Connection.Input.Node+'>.Input>#'+@props.Connection.Input.Field+'>.Handle').getBoundingClientRect()
            OutHandleRect = document.querySelector('#Node'+@props.Connection.Output.Node+'>.Output>#'+@props.Connection.Output.Field+'>.Handle').getBoundingClientRect()
            InHandle =
                x: InHandleRect.left + InHandleRect.width / 2
                y: InHandleRect.top + InHandleRect.height / 2
            OutHandle =
                x: OutHandleRect.left + OutHandleRect.width / 2
                y: OutHandleRect.top + OutHandleRect.height / 2

            @d = "M" + InHandle.x + " " + InHandle.y
            @d += "h-50"
            if (InHandle.x < OutHandle.x + 100)
                half = (OutHandle.y - InHandle.y) / 2
                h1 = document.querySelector("#Node" + @props.Connection.Input.Node).getBoundingClientRect()
                h2 = document.querySelector("#Node" + @props.Connection.Output.Node).getBoundingClientRect()
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
                    @d += "v"+(t * h)
                    @d += "H"+(OutHandle.x+50)
                    @d += "v"+(t*(-h+(t*half)*2))
                    @d += "h-50"
                else
                    @d += "v"+half
                    @d += "H"+(OutHandle.x+50)
                    @d += "v"+half
                    @d += "h-50"
            else
                half = (OutHandle.x - InHandle.x) / 2 + 50
                @d += "h"+half
                @d += "V"+(OutHandle.y)
                @d += "h"+half
                @d += "h-50"
            @setState(@state)

        render: ->
            <path d={@d}  stroke="white" strokeWidth="2" fill="none"/>

    mapStateToProps = (state, ownProps) =>
        console.log ownProps
        return {
            Input: state.Nodes[ownProps.Connection.Input.Node]
            Output: state.Nodes[ownProps.Connection.Output.Node]
        }

    connect(mapStateToProps)(Connector)
