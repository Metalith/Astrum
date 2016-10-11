import React from 'react';
import { connect } from 'react-redux';
import Actions from '../../Actions';
import Fields from '../../containers/Fields'
class Node extends React.Component {
    el: ''
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            pos: {
                x: this.props.pos.x,
                y: this.props.pos.y
            },
            rel: null,
            showRemove: false
        };
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.removeNode = this.removeNode.bind(this);
    }

    componentWillUpdate(props, state) {
        if (!this.state.dragging && state.dragging) {
            document.addEventListener('mousemove', this.onDrag)
            document.addEventListener('mouseup', this.onMouseUp)
        }
        else if (this.state.dragging && !state.dragging) {
            document.removeEventListener('mousemove', this.onDrag)
            document.removeEventListener('mouseup', this.onMouseUp)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dirty)
            this.props.dispatch(Actions.updateNode(this.props.id,
                nextProps.inputs,
                this.getOutputs(nextProps.inputs),
                this.getHeight(nextProps.heights),
            this.props.cons))
    }
    onMouseDown(e) {
        if (e.target.className == "Node" || e.target.className == "NodeName") {
            this.setState({
                dragging: true,
                rel: {
                    x: e.pageX - this.state.pos.x,
                    y: e.pageY - this.state.pos.y
                }
            })
            this.props.dispatch(Actions.startDragging(this.props.id))
        }
    }

    onDrag(e) {
        this.setState({
            pos: {
                x: e.pageX - this.state.rel.x,
                y: e.pageY - this.state.rel.y
            }
        })
    }

    onMouseUp(e) {
        this.setState({dragging: false})
        this.props.dispatch(Actions.setPos(this.props.id, this.state.pos))
    }
    removeNode(e) {
        this.props.dispatch(Actions.removeNode(this.props.id, this.props.cons));
    }
    render() {
        return <div
            className="Node"
            id={"Node" + this.props.id}
            style={{position: "absolute", left: this.props.globalOffset.x + this.state.pos.x, top: this.props.globalOffset.y + this.state.pos.y}}
            onMouseDown={this.onMouseDown}
        >

            <svg onMouseDown={this.removeNode} className="removeNodeButton" width="24" height="24" viewBox="0 0 300 300">
                <path d="   M150, 150 L0, 300Z
                            M150, 150 L300, 0Z
                            M150, 150 L0, 0Z
                            M150, 150 L300, 300Z"/>
            </svg>
            <Fields
                fields={this.show.inputs}
                node={this.props.id}
                type={"Input"}
                cons={this.props.cons.filter(con => {return (con.Input.Node == this.props.id) ? true : false })}
            />
            <div className="Center">
                <div className="NodeName">
                    {this.name}
                </div>
                <div className="Values">
                    {this.center()}
                </div>
            </div>
            <Fields
                fields={this.show.outputs}
                node={this.props.id}
                type={"Output"}
                cons={this.props.cons.filter(con => {return (con.Output.Node == this.props.id) ? true : false })}
            />
        </div>
    }
}

export default Node;
