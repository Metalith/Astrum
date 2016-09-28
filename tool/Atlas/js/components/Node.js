import React from 'react';
import { connect } from 'react-redux';
import Actions from '../Actions';
import Input from './Input'
import Output from './Output'


class PerlinNode extends Node {
    get name() { return 'Perlin Noise'; }
    constructor(props) { super(props); }
    getOutputs(inputs) { return { Value: `snoise(vec3(${inputs.X}, ${inputs.Y}, ${inputs.Z}))` } }
    center() {}
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
