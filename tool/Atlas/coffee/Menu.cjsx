define ["react", "reactredux", "Actions", "Node", 'MenuItem'], ( React, t, Actions, Node, MenuItem) ->
    connect = require('reactredux').connect


    class Menu extends React.Component
        constructor: (props) ->
            super props

        render: ->
            i = 0
            NodeTypes = Object.keys(Node)
            show = if @props.show then "show" else 'hide'
            return (<div className={'context-menu ' + show} onMouseLeave={@props.hide} style={ left: @props.pos[0], top: @props.pos[1]}>&nbsp;&nbsp;Create Node{NodeTypes.map((type) => <MenuItem key={i++} name={type} hide={@props.hide} />)} </div>)
    return Menu
