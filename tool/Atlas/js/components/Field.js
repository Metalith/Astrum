import React from 'react';
import Actions from '../Actions';
import { connect } from 'react-redux';
import { MorphReplace } from 'react-svg-morph';

class Connect extends React.Component {
    render() {
        return (
            <svg width="24" height="24" viewBox="0 0 300 300">
                <path d="   M150, 300 L300 150 L150 0L0 150L150 300 "/>
            </svg>
        );
    }
}

class Disconnect extends React.Component {
    render() {
        return (
            <svg width="24" height="24" viewBox="0 0 300 300">
                <path d="   M150, 150 L0, 300Z
                            M150, 150 L300, 0Z
                            M150, 150 L0, 0Z
                            M150, 150 L300, 300Z"/>
            </svg>
        );
    }
}



class Field extends React.Component {
    constructor(props) {
        super(props);
        this.startConnection = this.startConnection.bind(this);
        this.endConnection = this.endConnection.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.state = {
            showDisconnect: false
        };
    }

    onMouseDown(e) {
        if (e.button == 0)
            if (!this.state.showDisconnect)
                this.startConnection()
            else {
                this.props.dispatch(Actions.removeConnections(this.props.type, this.props.node, this.props.field));
                this.setState({ showDisconnect: false});
            }
        else
            if (this.props.connected)
                this.setState({ showDisconnect: !this.state.showDisconnect})
        return false;
    }
    startConnection() {
        this.props.dispatch(Actions.startConnecting(this.props.node, this.props.field, this.props.type))
        document.addEventListener('mouseup', this.endConnection)
        this.setState({checked: !this.state.checked});
    }
    endConnection(e) {
        this.props.dispatch(Actions.stopConnecting());
        let el = e.target;
        if (el.tagName == 'path')
            el = e.target.parentElement.parentElement;
        if (el.classList.contains("Field")) {
            if (el.parentElement.className != this.props.Selected.Type) {
                if (el.parentElement.parentElement.id != "Node" + this.props.Selected.Node) {
                    let Selected = {
                        Node: this.props.Selected.Node,
                        Field: this.props.Selected.Field
                    }
                    if (this.props.Selected.Type == "Input")
                        this.props.dispatch(Actions.addConnection(Selected, {
                            Node: parseInt(el.parentElement.parentElement.id.replace( /^\D+/g, '')),
                            Field: el.textContent}))
                    else
                        this.props.dispatch(Actions.addConnection({
                            Node: parseInt(el.parentElement.parentElement.id.replace( /^\D+/g, '')),
                            Field: el.textContent},
                            Selected))
                } else
                    console.log("Error: Cannot connect a node to itself")
             } else
                console.log("Error: Fields of same type")
        }
        document.removeEventListener('mouseup', this.endConnection);
    }
    render() {
        return <div className="Field" id={this.props.field}
            ref={(c) => this.el = c}
            onMouseDown={this.onMouseDown}
            onMouseEnter={() => this.el.classList.add('hov')}
            onMouseLeave={() => this.el.classList.remove('hov')}>
            {this.props.field}
            <MorphReplace rotation="counterclock" duration={250} width={100} height={100} className="Handle">
                {this.state.showDisconnect ?  <Disconnect key="disconnect" /> : <Connect key="connect" />}
            </MorphReplace>
        </div>
    }
}
const mapStateToProps = (state) => {
    return {
        Selected: state.Selected
    }}

export default connect(mapStateToProps)(Field)
