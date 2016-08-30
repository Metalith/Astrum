import React from 'react';
import Actions from '../Actions';
import { connect } from 'react-redux';
class Field extends React.Component {
    constructor(props) {
        super(props);
        this.startConnection = this.startConnection.bind(this);
        this.endConnection = this.endConnection.bind(this);
    }

    startConnection(e) {
        this.props.dispatch(Actions.startConnecting(this.props.node, this.props.field, this.props.type))
        document.addEventListener('mouseup', this.endConnection)
    }
    endConnection(e) {
        this.props.dispatch(Actions.stopConnecting());
        let el = e.target;
        if (el.className == 'Handle')
            el = e.target.parentElement;
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
                    alert("Error: Cannot connect a node to itself")
             } else
                alert("Error: Fields of same type")
        }
        document.removeEventListener('mouseup', this.endConnection);
    }
    render() {
        return <div className="Field" id={this.props.field}
            ref={(c) => this.el = c}
            onMouseDown={(e) => {e.stopPropagation(); this.startConnection()}}
            onMouseEnter={() => this.el.classList.add('hov')}
            onMouseLeave={() => this.el.classList.remove('hov')}>
            {this.props.field}
            <div className="Handle"></div>
        </div>
    }
}
const mapStateToProps = (state) => {
    return {
        Selected: state.Selected
    }}

export default connect(mapStateToProps)(Field)
