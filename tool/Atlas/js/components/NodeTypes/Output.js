import React from 'react';
import { connect } from 'react-redux';
import Actions from '../../Actions';
import Fields from '../../containers/Fields'
import Node from './Node.js';

class OutputNode extends Node {
    get name() { return 'Output'; }
    constructor(props) {
        super(props);
    }
    getOutputs(inputs) {
        this.props.dispatch(Actions.setProgram(inputs.Height, inputs.R, inputs.G, inputs.B))
    }
    getHeight(heights) {
        let height = heights.Height;
        if (!height)
            height = [0,0]
        return height;
    }
    center() {}
    static get input() {return {
        Height: [0.0, 0.0],
        R: "1.0",
        G: "1.0",
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
    static get height() { return [0.0, 0.0] } ;
    static get output() { return {} }
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
            {/* <div className="Values"><div className="Value">[ { this.props.height[0].toFixed(2) } | {this.props.height[1].toFixed(2) } ]</div></div> */}
        </div>
    }
}

export default {
    Output: connect()(OutputNode)
}
