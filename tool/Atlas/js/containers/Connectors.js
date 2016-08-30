import React from 'react'
import { connect } from 'react-redux'
import Connector from '../components/Connector'
import TempConnector from '../components/TempConnector'

class Connectors extends React.Component {
    render() {
        let temp = null
        if (this.props.Connecting)
            temp = <TempConnector Selected={this.props.Selected}/>
        return <svg className="Connectors" height="100%" width="100%">
            {temp}
            {this.props.Connections.map((Con) => <Connector key={Con.id} Connection={Con}/>)}
        </svg>
    }
}

const mapStateToProps = (state) =>
    ({
        Selected: state.Selected,
        Connecting: state.Connecting,
        Connections: state.Connections
    })

export default connect(mapStateToProps)(Connectors)
