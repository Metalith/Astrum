import React from 'react';
import { connect } from 'react-redux';
import Actions from '../../Actions';
import Fields from '../../containers/Fields'
import Node from './Node.js';

class PerlinNode extends Node {
    get name() { return 'Perlin Noise'; }
    constructor(props) { super(props); }
    getOutputs(inputs) { return { Value: `fBM(vec3(${inputs.X}, ${inputs.Y}, ${inputs.Z}), octaves, frequency, lacunarity, amplitude, gain)` } }
    center() { return <div>
        <div className="Value">Octaves:<input type="number" style={{width: "50px"}}/></div>
        <div className="Value">Frequency:<input type="number" style={{width: "50px"}}/></div>
        <div className="Value">Lacunarity:<input type="number" style={{width: "50px"}}/></div>
        <div className="Value">Amplitude:<input type="number"style={{width: "50px"}}/></div>
        <div className="Value">Gain:<input type="number"style={{width: "50px"}}/></div>
    </div> }
    static get input() {return {
        X: '0.0',
        Y: '0.0',
        Z: '0.0'
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
        Value: 'snoise(vec3(0.0, 0.0, 0.0))'
    }}
}


export default {
    Perlin: connect()(PerlinNode)
}
