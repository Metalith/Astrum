import React from 'react';
import { connect } from 'react-redux';

import Actions from '../Actions'
class MenuItem extends React.Component {
    render() {
        return <div
            className="context-menu-item"
            onClick={e => {
                this.props.dispatch(
                    Actions.addNode(
                        this.props.name,
                        {x: e.pageX - this.props.globalOffset.x, y: e.pageY - this.props.globalOffset.y},
                        this.props.defaultInput,
                        this.props.defaultOutput));
                this.props.hide()}}
        >
            {this.props.name}
        </div>
    }
}
MenuItem = connect()(MenuItem)
export default MenuItem
