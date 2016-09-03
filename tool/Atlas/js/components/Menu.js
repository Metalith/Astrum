import React from 'react';
import Node from './Node'
import MenuItem from './MenuItem'

class Menu extends React.Component {
    render() {
        let i = 0
        let NodeTypes = Object.keys(Node);
        let show = this.props.show ? "show" : 'hide'
        return <div
            className={'context-menu ' + show}
            onMouseLeave={this.props.hide}
            style={{left: this.props.pos[0], top: this.props.pos[1]}} >
            &nbsp;&nbsp;Create Node
            {NodeTypes.map(type => {
                return <MenuItem
                    key={i++}
                    name={type}
                    hide={this.props.hide}
                    defaultInput={Node[type].input}
                    defaultOutput={Node[type].output}
                    globalOffset={this.props.globalOffset}/>})}
        </div>
    }
}

export default Menu
