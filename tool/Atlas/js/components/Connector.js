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
        this.d += "h-50"
        if (InHandle.x < OutHandle.x + 100) {
            let half = (OutHandle.y - InHandle.y) / 2
            let h1 = document.querySelector("#Node" + this.Connection.Input.Node).getBoundingClientRect()
            let h2 = document.querySelector("#Node" + this.Connection.Output.Node).getBoundingClientRect()
            let height = 0
            if (half >= 0)
                height = h1.bottom - h2.top
            else
                height = h2.bottom - h1.top
            if  (height + 25 >= 0) {
                let h = h1.height+h2.height+25
                let t = 1
                if (half < 0)
                    t = -1
                this.d += "v"+(t * h)
                this.d += "H"+(OutHandle.x+50)
                this.d += "v"+(t*(-h+(t*half)*2))
                this.d += "h-50"
            } else {
                this.d += "v"+half
                this.d += "H"+(OutHandle.x+50)
                this.d += "v"+half
                this.d += "h-50"
            }
        } else {
            let half = (OutHandle.x - InHandle.x) / 2 + 50
            this.d += "h"+half
            this.d += "V"+(OutHandle.y)
            this.d += "h"+half
            this.d += "h-50"
        }
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
