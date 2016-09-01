import React from 'react';
import { connect } from 'react-redux';
import Actions from '../Actions';
import Input from './Input'
import Output from './Output'
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
            rel: null
        };
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
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

    onMouseDown(e) {
        if (e.target.tagName != "INPUT" && !e.target.classList.contains("Field") && e.target.className != "Handle") {
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
    render() {
        return <div className="Node" id={"Node" + this.props.id} style={{position: "absolute", left: this.state.pos.x, top: this.state.pos.y}} onMouseDown={this.onMouseDown}>
            <Input input={this.props.inputs} node={this.props.id} cons={this.props.cons.filter(con => {return (con.Input.Node == this.props.id) ? true : false })}/>
            <div className="Center"><div className="NodeName">{this.name}</div><div className="Values">{this.center()}</div></div>
            <Output output={this.props.outputs} node={this.props.id} cons={this.props.cons.filter(con => {return (con.Output.Node == this.props.id) ? true : false })}/>
        </div>
    }
}

class TestNode extends Node {
    get name() {return 'Test Node'}
    constructor(props) { super(props) }
    static get input() {return {
        TestInput: ''
    }}
    static get output() {return {
    }}
    center() {return <input type="number" name="fname" onChange={this.update}/>}
}

class ValueNode extends Node {
    get name() { return 'Value'; }
    constructor(props) { super(props); }
    center() {
        return <input
            type="number"
            onChange={(e) => {
                this.props.dispatch(Actions.updateNode(
                    this.props.id,
                    {Value: parseInt(e.target.value)},
                    {Value: parseInt(e.target.value)},
                    this.props.cons))}}
                value={this.props.inputs.Value}/>}
    static get input() {return {
        Value: 10
    }}
    static get output() {return {
        Value: 10
    }}
}

class MathNode extends Node {
    get name() {return 'Math'}
    constructor(props) { super(props) }

    center() { return <input type="number" value={this.props.inputs.Value1 + this.props.inputs.Value2}/> }

    static get input() {return {
        Value1: 0,
        Value2: 0
    }}
    static get output() {return {
        Result: 0
    }}
}

export default {
    TestNode: connect()(TestNode),
    Value: connect()(ValueNode),
    // Output: connect()(OutputNode),
    MathNode: connect()(MathNode)
}
