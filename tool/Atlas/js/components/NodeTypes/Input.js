import React from 'react';
import { connect } from 'react-redux';
import Actions from '../../Actions';
import Node from './Node.js';

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
                    {Value: e.target.value},
                    {Value: (e.target.value.length == 0) ? "0.0" : parseFloat(e.target.value).toFixed(Math.max(1, (e.target.value.split('.')[1] || []).length))},
                    this.props.cons))}}
                step="0.01"/>}
    static get input() {return {
        Value: "0.0"
    }}
    get show() {
        return {
            inputs: {},
            outputs: {Value: ''}
        }
    }
    static get output() {return {
        Value: "0.0"
    }}
}

class RandomNode extends Node {
    get name() { return 'Random'; }
    constructor(props) { super(props); }
    getOutputs(inputs) { return RandomNode.output }
    center() { return <input id={"random"+this.props.id} type="number" value={Math.random()} readOnly /> }
    componentDidMount() {
        this.loop = setInterval(() => {
            document.querySelector("#random"+this.props.id).value = Math.random();
        },30)
    }
    componentWillUnmount() {
        clearInterval(this.loop)
    }
    static get input() {return {
    }}
    get show() {
        return {
            inputs: {},
            outputs: {
                Random: '',
            }
        }
    }
    static get output() {return {
        Random: 'rand(position.x, position.z)',
    }}
}

class VectorNode extends Node {
    get name() { return 'Vector'; }
    constructor(props) {
        super(props);
        this.updateInput = this.updateInput.bind(this)
    }
    getOutputs(inputs) { return inputs }
    updateInput(o, val) {
        let output = Object.assign({}, this.props.inputs);
        output[o] = (val.length == 0) ? "0.0" : parseFloat(val).toFixed(Math.max(1, (val.split('.')[1] || []).length));
        this.props.dispatch(Actions.updateNode(
            this.props.id,
            output,
            output,
            this.props.cons))
    }
    center() {
        return <div>
            <div className="Value"><input type="number" onChange={(e) => {this.updateInput("X", e.target.value)}} step="0.01"/></div>
            <div className="Value"><input type="number" onChange={(e) => {this.updateInput("Y", e.target.value)}} step="0.01"/></div>
            <div className="Value"><input type="number" onChange={(e) => {this.updateInput("Z", e.target.value)}} step="0.01"/></div>
        </div>
        }
    static get input() {return {
        X: '0.0',
        Y: '0.0',
        Z: '0.0'
    }}
    get show() {
        return {
            inputs: {},
            outputs: {
                X: '',
                Y: '',
                Z: ''
            }
        }
    }
    static get output() {return {
        X: '0.0',
        Y: '0.0',
        Z: '0.0'
    }}
}


class PositionNode extends Node {
    get name() { return 'Position'; }
    constructor(props) { super(props); }
    getOutputs(inputs) { return PositionNode.output }
    center() {}
    static get input() {return {
    }}
    get show() {
        return {
            inputs: {},
            outputs: {
                X: '',
                Y: '',
                Z: ''
            }
        }
    }
    static get output() {return {
        X: 'position.x',
        Y: 'position.y',
        Z: 'position.z'
    }}
}

export default {
    Value: connect()(ValueNode),
    Vector: connect()(VectorNode),
    Random: connect()(RandomNode),
    Position: connect()(PositionNode)
}
