define ["react", "reactredux", "Actions", "Node", 'MenuItem'], ( React, t, Actions, Node, MenuItem) ->
    connect = require('reactredux').connect

    class Nodes extends React.Component
        constructor: (props) ->
            super props

        render: ->
            i = 0;
            <div>
                {@props.nodes.map((node) => GenNode = connect()(Node[node.nodeType]); <GenNode key={node.id} pos={node.initPos} id={node.id}/>)}
            </div>


    mapStateToProps = (state) =>
        return {
            nodes: state.Nodes
        }

    return Nodes = connect(mapStateToProps)(Nodes)
