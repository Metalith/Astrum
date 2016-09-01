import React from 'react'
import { connect } from 'react-redux'
import Node from '../components/Node'
class Nodes extends React.Component {
    constructor(props) {
        super(props);
        let Inputs = [];
        props.nodes.forEach((node, i) => Inputs[i] = node.input);
        this.state = { Inputs };

        this.updateInputs = this.updateInputs.bind(this);
    }

    update() {
        let Inputs = Object.assign({}, this.state.Inputs)
        Inputs[0] = {val: "5000"}
        this.setState({Inputs: Inputs})
    }

    componentWillReceiveProps(nextProps) {
        this.updateInputs(nextProps.nodes)
    }

    // NOTE: Pretty slow, runs after every action involving nodes, cant imagine performance issues with small amount of nodes
    updateInputs(nodes) {
        let Inputs = [];
        nodes.forEach((node, i) => {Inputs[node.id] = node.input});
        this.setState({Inputs: Inputs});
    }

    updateInput(node, input) {
        let Inputs = this.state.Inputs;
        Inputs[node] = input;
        this.setState({ Inputs});
    }

    render() {
        let i = 0;
        return <div>
            {this.props.nodes.map(node => {
                let GenNode = Node[node.nodeType];
                return <GenNode
                    key={node.id}
                    pos={node.pos}
                    update={this.updateInput}
                    cons={node.Connections}
                    inputs={this.state.Inputs[node.id]}
                    outputs={node.output}
                    id={node.id} />})}
        </div>
    }
}


var mapStateToProps = (state) =>
    ({
        nodes: state.Nodes
    })

export default connect(mapStateToProps)(Nodes)
