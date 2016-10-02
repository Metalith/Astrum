import React from 'react';
import { connect } from 'react-redux';
import Actions from '../../Actions';
import Fields from '../../containers/Fields'
import Node from './Node.js';

class PerlinNode extends Node {
    get name() { return 'Perlin Noise'; }
    constructor(props) { super(props); }
    getOutputs(inputs) { return { Value: `fBM(vec3(${inputs.X}, ${inputs.Y}, ${inputs.Z}), ${inputs.Octaves}, ${inputs.Frequency}, ${inputs.Lacunarity}, ${inputs.Amplitude}, ${inputs.Gain})` } }
    updateInput(i, val) {
        let inputs = Object.assign({}, this.props.inputs);
        if (i != "Octaves")
            inputs[i] = (val.length == 0) ? "0.0" : parseFloat(val).toFixed(Math.max(1, (val.split('.')[1] || []).length));
        else
            inputs[0] = (val.length == 0) ? "0" : parseInt(val);
        this.props.dispatch(Actions.updateNode(
            this.props.id,
            inputs,
            { Value: `fBM(vec3(${inputs.X}, ${inputs.Y}, ${inputs.Z}), ${inputs.Octaves}, ${inputs.Frequency}, ${inputs.Lacunarity}, ${inputs.Amplitude}, ${inputs.Gain})` },
            this.props.cons))
    }
    center() { return <div>
        <div className="Value">
            Octaves:
            <input type="number"
                onChange={(e) => {this.updateInput("Octaves", e.target.value)}}
                style={{width: "50px"}}/>
        </div>
        <div className="Value">
            Frequency:
            <input type="number"
                onChange={(e) => {this.updateInput("Frequency", e.target.value)}}
                style={{width: "50px"}}/>
        </div>
        <div className="Value">
            Lacunarity:
            <input type="number"
                onChange={(e) => {this.updateInput("Lacunarity", e.target.value)}}
                style={{width: "50px"}}/>
        </div>
        <div className="Value">
            Amplitude:
            <input type="number"
                onChange={(e) => {this.updateInput("Amplitude", e.target.value)}}
                style={{width: "50px"}}/>
        </div>
        <div className="Value">
            Gain:
            <input type="number"
                onChange={(e) => {this.updateInput("Gain", e.target.value)}}
                style={{width: "50px"}}/>
        </div>
    </div> }
    static get input() {return {
        X: '0.0',
        Y: '0.0',
        Z: '0.0',
        Octaves: '0',
        Frequency: '0.0',
        Lacunarity: '0.0',
        Amplitude: '0.0',
        Gain: '0.0'
    }}
    get show() {
        return {
            inputs: {
                X: '',
                Y: '',
                Z: ''
            },
            outputs: {
                Value: ''
            }
        }
    }
    static get output() {return {
        Value: 'fBM(vec3(0.0), 0, 0.0, 0.0, 0.0, 0.0)'
    }}
}


export default {
    Perlin: connect()(PerlinNode)
}
