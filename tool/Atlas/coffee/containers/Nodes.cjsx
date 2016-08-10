define ["react", "reactredux", "Actions", "Node", 'MenuItem'], ( React, t, Actions, Node, MenuItem) ->
    connect = require('reactredux').connect

    class Nodes extends React.Component
        constructor: (props) ->
            super props

        render: ->
            i = 100;
            <div key={99}>
                {@props.nodes.map((node) => GenNode = Node[node.nodeType]; <GenNode key={i++} pos={node.pos}/>)}
            </div>


    mapStateToProps = (state) =>
        return {
            nodes: state.Nodes
        }

    return Nodes = connect(mapStateToProps)(Nodes)
