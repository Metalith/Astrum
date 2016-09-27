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
                    {Value: (e.target.value.length == 0) ? "0" : e.target.value },
                    {Value: (e.target.value.length == 0) ? "0.0" : parseFloat(e.target.value).toFixed(Math.max(1, (e.target.value.split('.')[1] || []).length))},
                    this.props.cons))}}
                value={parseFloat(this.props.inputs.Value)}
                step="0.01"/>}
    static get input() {return {
        Value: "0.0"
    }}
    get show() {
        return {
            inputs: {Value: ''},
            outputs: {Value: ''}
        }
    }
    static get output() {return {
        Value: "0.0"
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

//VectorNode

export default {
    Value: connect()(ValueNode),
    Position: connect()(PositionNode)
}
