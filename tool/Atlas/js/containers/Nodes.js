import React from 'react'
import { connect } from 'react-redux'
import Actions from '../Actions';
import Input from '../components/NodeTypes/Input'
import Output from '../components/NodeTypes/Output'
import Maths from '../components/NodeTypes/Math'
import Noise from '../components/NodeTypes/Noise'
class Nodes extends React.Component {
    constructor(props) {
        super(props);
        let Inputs = [];
        let Dirty = [];
        let Heights = [];
        props.nodes.forEach((node, i) => {Inputs[node.id] = node.input; Dirty[node.id] = node.dirty, Heights[node.id] = node.heights})
        this.state = { Inputs, Dirty, Heights };
        this.nodeTypes = Object.assign({}, Input, Output, Maths, Noise);
        this.updateNodes = this.updateNodes.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.updateNodes(nextProps.nodes)
    }

    componentWillMount() {
        this.props.dispatch(Actions.addNode(
            "Output",
            {x: 0.0, y: 0.0},
            {
                Height: [0.0, 0.0],
                R: "1.0",
                G: "1.0",
                B: "1.0"
            },
            {},
            [0, 0]))
    }

    // NOTE: Pretty slow, runs after every action involving nodes, cant imagine performance issues with small amount of nodes
    updateNodes(nodes) {
        let Inputs = [];
        let Dirty  = [];
        let Heights = [];
        nodes.forEach((node, i) => {
            for (let input in node.input) {
                if (node.input[input] == '\0') {
                    console.log("beep")
                    node.input[input] = this.nodeTypes[node.nodeType].input[input]
                }
            }
            Inputs[node.id] = node.input;
            Dirty[node.id] = node.dirty;
            Heights[node.id] = node.heights;
        });
        this.setState({Inputs: Inputs, Dirty: Dirty, Heights: Heights});
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
                let GenNode = this.nodeTypes[node.nodeType];
                return <GenNode
                    key={node.id}
                    pos={node.pos}
                    globalOffset={this.props.globalOffset}
                    update={this.updateInput}
                    cons={node.Connections}
                    inputs={this.state.Inputs[node.id]}
                    height={node.height}
                    heights={this.state.Heights[node.id]}
                    outputs={node.output}
                    dirty={this.state.Dirty[node.id]}
                    id={node.id} />})}
        </div>
    }
}


var mapStateToProps = (state) =>
    ({
        nodes: state.Nodes
    })

export default connect(mapStateToProps)(Nodes)
