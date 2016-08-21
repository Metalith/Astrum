define ["react", "TempConnector", "Connector"], (React, TempConnector, Connector) ->
    connect = require('reactredux').connect

    class Connectors extends React.Component
        constructor: (props) ->
            super props

        render: ->
            temp = null
            if @props.Connecting
                temp = <TempConnector Selected={@props.Selected}/>
            <svg className="Connectors" height="100%" width="100%">
                {temp}
                {@props.Connections.map((Con) => <Connector key={Con.id} Connection={Con}/>)}
            </svg>

    mapStateToProps = (state) =>
        return {
            Selected: state.Selected
            Connecting: state.Connecting
            Connections: state.Connections
        }

    return connect(mapStateToProps)(Connectors)
