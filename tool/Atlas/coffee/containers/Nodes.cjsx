define ["react", "Actions", "Node", 'MenuItem'], ( React, Actions, Node, MenuItem) ->
    connect = require('reactredux').connect

    class Nodes extends React.Component
        constructor: (props) ->
            super props
            Inputs = []
            for i, node of props.nodes
                Inputs[i] = node.input
            @state =
                Inputs: Inputs

        update: =>
            Inputs = Object.assign({}, @state.Inputs)
            Inputs[0] = {val: "5000"}
            @setState({Inputs: Inputs})
            # console.log @TestInput
        componentWillReceiveProps: (nextProps) ->
            @updateInputs(nextProps.nodes)

        # NOTE: Pretty slow, runs after every action involving nodes, cant imagine performance issues with small amount of nodes
        updateInputs: (nodes) ->
            Inputs = []
            for i, node of nodes
                Inputs[i] = node.input
            @setState({Inputs: Inputs})

        updateInput: (node, input) =>
            Inputs = @state.Inputs
            Inputs[node] = input
            @setState({Inputs: Inputs})

        render: ->
            i = 0;
            <div>
                {@props.nodes.map((node) =>
                    GenNode = Node[node.nodeType]
                    <GenNode
                        key={node.id}
                        pos={node.pos}
                        update={@updateInput}
                        cons={node.Connections}
                        inputs={@state.Inputs[node.id]}
                        id={node.id} />)}
            </div>


    mapStateToProps = (state) =>
        return {
            nodes: state.Nodes
        }

    return Nodes = connect(mapStateToProps)(Nodes)
