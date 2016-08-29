define ["react", "Actions"], (React, Actions) ->
    connect = require('reactredux').connect
    class Field extends React.Component
        constructor: (props) ->
            super props
            # console.log "#Node"+@props.node + ">."+@props.type+">#"+@props.field+">.Handle>.HandlePath"
        componentDidMount: () =>
            # console.log "#Node"+@props.node + ">."+@props.type+">#"+@props.field+">.Handle>.HandlePath"
            # @toX = KUTE.to("#Node"+@props.node + ">."+@props.type+">#"+@props.field+">.Handle>.HandlePath", { path: ''})

        startConnection: (e) =>
            @props.dispatch Actions.startConnecting @props.node, @props.field, @props.type
            document.addEventListener 'mouseup', @endConnection

        endConnection: (e) =>
            @props.dispatch Actions.stopConnecting()
            el = e.target
            if (el.className == 'Handle')
                el = e.target.parentElement
            if (el.classList.contains("Field"))
                if el.parentElement.className != @props.Selected.Type
                    if el.parentElement.parentElement.id != "Node" + @props.Selected.Node
                        Selected =
                            Node: @props.Selected.Node
                            Field: @props.Selected.Field
                        if @props.Selected.Type == "Input"
                            @props.dispatch Actions.addConnection Selected, {
                                Node: parseInt(el.parentElement.parentElement.id.replace( /^\D+/g, ''))
                                Field: el.textContent}
                        else
                            @props.dispatch Actions.addConnection {
                                Node: parseInt(el.parentElement.parentElement.id.replace( /^\D+/g, ''))
                                Field: el.textContent},
                                Selected
                    else
                        alert("Error: Cannot connect a node to itself")
                else
                    alert "Error: Fields of same type"
            document.removeEventListener 'mouseup', @endConnection

        render: ->
            <div className="Field" id={@props.field}
                ref={(c) => @el = c}
                onMouseDown={(e) => e.stopPropagation(); KUTE.to("#Test", { path: 'M100 100L500 500'}).start();@startConnection()}
                onMouseEnter={() => @el.classList.add('hov')}
                onMouseLeave={() => @el.classList.remove('hov')}>
                {@props.field}
                <svg className="Handle" viewBox="0 0 150 150" width="8" height="8" style={preserveAspectRatio:"xMinYMax meet"}>
                    <path id="Test" className="HandlePath" d="M 75, 75m 75, 0a 75,75 0 1,0 -150,0a 75,75 0 1,0 150,0"/>
                </svg>
            </div>

    mapStateToProps = (state) ->
        return {
            Selected: state.Selected
        }

    connect(mapStateToProps)(Field)
