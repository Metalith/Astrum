define ["react", "reactredux", "Actions", "Node", 'MenuItem'], ( React, t, Actions, Node, MenuItem) ->
    connect = require('reactredux').connect

    class Nodes extends React.Component
        constructor: (props) ->
            super props

        mapSelectedToProps: (state) =>
            return {
                Selected: state.Selected
            }

        render: ->
            i = 0;
            <div>
                {@props.nodes.map((node) => GenNode = connect(@mapSelectedToProps)(Node[node.nodeType]); <GenNode key={node.id} pos={node.pos} Connections={node.Connections} id={node.id}/>)}
            </div>


    mapStateToProps = (state) =>
        return {
            nodes: state.Nodes
        }

    return Nodes = connect(mapStateToProps)(Nodes)
