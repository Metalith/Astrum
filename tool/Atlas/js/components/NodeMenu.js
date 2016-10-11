import React from 'react';
import { connect } from 'react-redux';
import Actions from '../Actions';
import Inputs from './NodeTypes/Input';
import Maths from './NodeTypes/Math';
import Noise from './NodeTypes/Noise';
class MenuItem extends React.Component {
    render() {
        return <div
            className="NodeMenuItem"
            onClick={e => {
                this.props.dispatch(
                    Actions.addNode(
                        this.props.name,
                        {x: e.pageX - this.props.globalOffset.x, y: e.pageY - this.props.globalOffset.y},
                        this.props.defaultInput,
                        this.props.defaultOutput,
                        this.props.defaultHeight));
                this.props.hide()}}
        >
            {this.props.name}
        </div>
    }
}
MenuItem = connect()(MenuItem)

class SubMenu extends React.Component {
    render() {
        let i = 0
        return <div className="NodeMenuItem Arrow">
            {this.props.children}
            <div className="SubMenu">
                {Object.keys(this.props.nodegroup).map(type => {
                    return <MenuItem
                        key={i++}
                        name={type}
                        hide={this.props.hide}
                        defaultInput={this.props.nodegroup[type].input}
                        defaultOutput={this.props.nodegroup[type].output}
                        defaultHeight={this.props.nodegroup[type].height}
                        globalOffset={this.props.globalOffset}/>})}
            </div>
        </div>
    }
}


class NodeMenu extends React.Component {
    render() {
        let NodeTypes = Object.keys(Inputs);
        let show = this.props.show ? "show" : 'hide'
        let props = {
            globalOffset: this.props.globalOffset,
            hide: this.props.hide
        }
        return <div
            className={'NodeMenu ' + show}
            onMouseLeave={this.props.hide}
            style={{left: this.props.pos[0], top: this.props.pos[1]}} >
            <div>Create Node</div>
            <div className="NodeMenuItem Seperator"></div>
            <SubMenu {...props} nodegroup={Inputs}>Input</SubMenu>
            <SubMenu {...props} nodegroup={Maths}>Math</SubMenu>
            <SubMenu {...props} nodegroup={Noise}>Noise</SubMenu>
        </div>
    }
}

export default NodeMenu
