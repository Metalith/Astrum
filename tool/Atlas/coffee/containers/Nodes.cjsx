define ["react", "reactredux", "Actions", "Node", 'MenuItem'], ( React, t, Actions, Node, MenuItem) ->
    connect = require('reactredux').connect

    class Nodes extends React.Component
        constructor: (props) ->
            super props
            @state =
                Inputs: []

        update: =>
            Inputs = Object.assign({}, @state.Inputs)
            Inputs[0] = {val: "5000"}
            @setState({Inputs: Inputs})
            # console.log @TestInput

        render: ->
            i = 0;
            <div>
                {@props.nodes.map((node) =>
                    GenNode = Node[node.nodeType]
                    <GenNode
                        key={node.id}
                        pos={node.pos}
                        update={@update}
                        inputs={@state.Inputs[node.id]}
                        ConIDs={node.Connections}
                        id={node.id} />)}
            </div>


    mapStateToProps = (state) =>
        return {
            nodes: state.Nodes
        }

    return Nodes = connect(mapStateToProps)(Nodes)
