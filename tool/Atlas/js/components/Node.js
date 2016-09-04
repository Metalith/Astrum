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
            this.props.cons))
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
            <Input
                input={this.show.inputs}
                node={this.props.id}
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
            <Output
                output={this.show.outputs}
                node={this.props.id}
                cons={this.props.cons.filter(con => {return (con.Output.Node == this.props.id) ? true : false })}
            />
        </div>
    }
}

class ValueNode extends Node {
    get name() { return 'Value'; }
    constructor(props) { super(props); }
    getOutputs(inputs) { return { Value: inputs.Value } }
    center() {
        return <input
            type="number"
            onChange={(e) => {
                this.props.dispatch(Actions.updateNode(
                    this.props.id,
                    {Value: (e.target.value.length == 0) ? "0" : e.target.value },
                    {Value: parseFloat((e.target.value.length == 0) ? "0" : e.target.value)},
                    this.props.cons))}}
                value={this.props.inputs.Value}
                step="0.01"/>}
    static get input() {return {
        Value: "10"
    }}
    get show() {
        return {
            inputs: {},
            outputs: {Value: ''}
        }
    }
    static get output() {return {
        Value: 10.0
    }}
}

class MathNode extends Node {
    get name() {return 'Math'}
    constructor(props) {
        super(props)
    }

    getOutputs(inputs) { return { Result: `${inputs.Value1} + ${inputs.Value2}` } }
    center() { return <input type="number" value={this.props.inputs.Value1 + this.props.inputs.Value2}/> }

    static get input() {return {
        Value1: 0,
        Value2: 0
    }}

    get show() {
        return {
            inputs: {
                Value1: 0,
                Value2: 0
            },
            outputs: {Result: ''}
        }
    }
    static get output() {return {
        Result: 0
    }}
}

class OutputNode extends Node {
    get name() { return 'Output'; }
    constructor(props) { super(props); }
    getOutputs(inputs) {
        let Vertex = `
        varying vec2 pos;
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }`
        let Fragment = `void main(void) {
            gl_FragColor = vec4(vec3(${inputs.Color}), 1.0);
        }`
        this.props.dispatch(Actions.setProgram(Vertex, Fragment))
    }
    center() {}
    static get input() {return {
        Color: 0
    }}
    get show() {
        return {
            inputs: { Color: ''},
            outputs: {}
        }
    }
    static get output() {return {
    }}
}

export default {
    Value: connect()(ValueNode),
    MathNode: connect()(MathNode),
    Output: connect()(OutputNode)
}
