define ["react", "Actions"], (React, Actions) ->
    connect = require('reactredux').connect

    class Field extends React.Component
        constructor: (props) ->
            super props

        startConnection: (e) =>
            @props.dispatch Actions.startConnecting @props.node, @props.field, e.target.parentElement.className
            document.addEventListener 'mouseup', @endConnection

        endConnection: (e) =>
            @props.dispatch Actions.stopConnecting()
            if (e.target.classList.contains("Field"))
                if e.target.parentElement.className != @props.Selected.Type
                    if e.target.parentElement.parentElement.id != "Node" + @props.Selected.Node
                        Selected =
                            Node: @props.Selected.Node
                            Field: @props.Selected.Field
                        if @props.Selected.Type == "Input"
                            @props.dispatch Actions.addConnection Selected, {
                                Node: parseInt(e.target.parentElement.parentElement.id.replace( /^\D+/g, ''))
                                Field: e.target.textContent}
                        else
                            @props.dispatch Actions.addConnection {
                                Node: parseInt(e.target.parentElement.parentElement.id.replace( /^\D+/g, ''))
                                Field: e.target.textContent},
                                Selected
                    else
                        alert("Error: Cannot connect a node to itself")
                else
                    alert "Error: Fields of same type"
            document.removeEventListener 'mouseup', @endConnection

        render: ->
            <div className="Field" id={@props.field}
                ref={(c) => @el = c}
                onMouseDown={@startConnection}
                onMouseEnter={() => @el.classList.add('hov')}
                onMouseLeave={() => @el.classList.remove('hov')}>
                {@props.field}
                <div className="Handle"></div></div>

    mapStateToProps = (state) ->
        return {
            Selected: state.Selected
        }

    connect(mapStateToProps)(Field)
