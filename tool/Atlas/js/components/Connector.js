import React from 'react'
import { connect } from 'react-redux'

class Connector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            update: true
        };
        this.d = 'M150 150 L0 0';
        this.updateD = this.updateD.bind(this);
        this.Connection = props.Connection;
    }

    componentWillUpdate(nextProps, nextState) {
        if ((!this.props.Input.dragging && nextProps.Input.dragging) || (!this.props.Output.dragging && nextProps.Output.dragging) || (!this.props.Editor.dragging && nextProps.Editor.dragging))
            document.addEventListener('mousemove', this.updateD)
        else if ((this.props.Input.dragging && !nextProps.Input.dragging) || (this.props.Output.dragging && !nextProps.Output.dragging) || (this.props.Editor.dragging && !nextProps.Editor.dragging))
            document.removeEventListener('mousemove', this.updateD)
    }

    componentWillReceiveProps(nextProps) {
        this.Connection = nextProps.Connection;
        this.updateD();
    }
    componentDidMount() { this.updateD() }
    updateD() {
        let InHandleRect = document.querySelector('#Node'+this.Connection.Input.Node+'>.Input>#'+this.Connection.Input.Field+'>.Handle').getBoundingClientRect()
        let OutHandleRect = document.querySelector('#Node'+this.Connection.Output.Node+'>.Output>#'+this.Connection.Output.Field+'>.Handle').getBoundingClientRect()
        let InHandle = {
            x: InHandleRect.left + InHandleRect.width / 2,
            y: InHandleRect.top + InHandleRect.height / 2
        }
        let OutHandle = {
            x: OutHandleRect.left + OutHandleRect.width / 2,
            y: OutHandleRect.top + OutHandleRect.height / 2
        }
        this.d = "M" + InHandle.x + " " + InHandle.y
        this.d += "L" + OutHandle.x + " " + OutHandle.y
        this.setState(this.state)
    }
    render() {
        return <path d={this.d}  stroke="white" strokeWidth="2" fill="none"/>
    }
}

const mapStateToProps = (state, ownProps) =>
    ({
        Input: state.Nodes[state.Nodes.map(node => node.id).indexOf(ownProps.Connection.Input.Node)],
        Output: state.Nodes[state.Nodes.map(node => node.id).indexOf(ownProps.Connection.Output.Node)],
        Editor: state.Editor
    })

export default connect(mapStateToProps)(Connector)
