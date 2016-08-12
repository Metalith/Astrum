define ["react", 'Actions', "reactredux"], (React, Actions) ->
    connect = require('reactredux').connect

    class MenuItem extends React.Component
        constructor: (props) ->
            super props

        render: ->
            <div className="context-menu-item" onClick={(e) => @props.dispatch(Actions.addNode(@props.name, {x: e.pageX, y: e.pageY}); @props.hide())}>
                &nbsp;&nbsp;{@props.name}
            </div>
    return MenuItem = connect()(MenuItem)
