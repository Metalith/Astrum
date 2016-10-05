import React from 'react';
import { connect } from 'react-redux';
import Actions from '../../Actions';
import Fields from '../../containers/Fields'
import Node from './Node.js';

class OutputNode extends Node {
    get name() { return 'Output'; }
    constructor(props) { super(props); }
    getOutputs(inputs) {
        this.props.dispatch(Actions.setProgram(inputs.Height, inputs.R, inputs.G, inputs.B))
    }
    center() {}
    static get input() {return {
        Height: "0.0",
        R: "0.4",
        G: "0.6",
        B: "1.0"
    }}
    get show() {
        return {
            inputs: {
                 Height: '',
                 R: '',
                 G: '',
                 B: ''
             },
            outputs: {}
        }
    }
    static get output() {return {
    }}
    render() {
        return <div
            className="Node OutputNode"
            id={"Node" + this.props.id}
            style={{position: "absolute", right:0.0, top:0.0}}
        >
            <div className="NodeName">
                {this.name}
            </div>
            <Fields
                fields={this.show.inputs}
                node={this.props.id}
                type={"Input"}
                cons={this.props.cons.filter(con => {return (con.Input.Node == this.props.id) ? true : false })}
            />
            <div className="Seperator"></div>
            <select>
                <option>Topographic</option>
                <option>Shaded</option>
                <option>Combined</option>
            </select>
        </div>
    }
}

export default {
    Output: connect()(OutputNode)
}
