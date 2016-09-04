import React from 'react'
import { connect } from 'react-redux';

import Actions from '../Actions'
class ViewToggle extends React.Component {
    render() {
        return <label className="3DToggle">
            <input className="toggle" onClick={(e) =>  this.props.dispatch(Actions.switchView())} type="checkbox" />
            <div className="slider"></div>
        </label>
    }
}
ViewToggle = connect()(ViewToggle)
export default ViewToggle
