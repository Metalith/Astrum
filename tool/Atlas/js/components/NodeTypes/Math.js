import React from 'react';
import { connect } from 'react-redux';
import Actions from '../../Actions';
import Node from './Node.js';

class OperatorNode extends Node {
    get name() {return 'Operator'}
    constructor(props) {
        super(props)
    }
    getFunction (fun) {
        switch (fun) {
            case 'Add':
                return '+';
            case 'Subtract':
                return '-';
            case 'Multiply':
                return '*';
            case 'Divide':
                return '/';
        }
        return 'Error';
    }
    getOutputs(inputs) {
        return {
            Result: `${inputs.Value1}${this.getFunction(inputs.Function)}${inputs.Value2}`
        }
    }
    getHeight(heights, fun = this.props.inputs.Function) {
        if (!heights.Value1)
            heights.Value1 = [0, 0]
        if (!heights.Value2)
            heights.Value2 = [0, 0]
        switch (fun) {
            case 'Add':
                return [heights.Value1[0]+heights.Value2[0],heights.Value1[1]+heights.Value2[1]];
            case 'Subtract':
                return [heights.Value1[0]-heights.Value2[0],heights.Value1[1]-heights.Value2[1]];
            case 'Multiply':
                return [heights.Value1[0]*heights.Value2[0],heights.Value1[1]*heights.Value2[1]];
            case 'Divide':
                return [heights.Value1[0]/heights.Value2[0],heights.Value1[1]/heights.Value2[1]];;
        }
        return [null, null]
    }
    center() {
        return <select onChange={(e) => {
            this.props.dispatch(Actions.updateNode(
                this.props.id,
                {Function: e.target.value },
                {Result:`${this.props.inputs.Value1}${this.getFunction(e.target.value)}${this.props.inputs.Value2}` },
                this.getHeight(this.props.heights, e.target.value),
                this.props.cons))}}
            value={this.props.inputs.Function}
        >
            <option>Add</option>
            <option>Subtract</option>
            <option>Multiply</option>
            <option>Divide</option>
        </select>
    }

    static get input() {return {
        Function: 'Add',
        Value1: '0.0',
        Value2: '0.0'
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
        Result: '0.0'
    }}
    static get height() { return [0, 0]}
}

class TrigNode extends Node {
    get name() {return 'Trig'}
    constructor(props) { super(props) }
    getFunction (fun) {
        switch (fun) {
            case 'Sine':
                return 'sin';
            case 'Cosine':
                return 'cos';
            case 'Tangent':
                return 'tan';
        }
        return 'Error';
    }
    getOutputs(inputs) { return { Function: `${this.getFunction(inputs.Function)}(${inputs.Value})` } }
    getHeight(heights) { return [-1, 1]}
    center() {
        return <select onChange={(e) => {
            this.props.dispatch(Actions.updateNode(
                this.props.id,
                {Function: e.target.value },
                {Function:`${this.getFunction(e.target.value)}(${this.props.inputs.Value})` },
                this.props.cons))}}
            value={this.props.inputs.Function}
        >
            <option>Sine</option>
            <option>Cosine</option>
            <option>Tangent</option>
        </select>
    }
    static get input() {return {
        Function: 'Sine',
        Value: '0.0'
    }}

    get show() {
        return {
            inputs: {
                Value: ''
            },
            outputs: {
                Function: ''
            }
        }
    }
    static get output() {return {
        Function: 'sin(0.0)'
    }}
    static get height() { return [-1, 1]}
}

class MinMaxNode extends Node {
    get name() {return 'MinMax'}
    constructor(props) {
        super(props)
    }
    getFunction (fun) {
        switch (fun) {
            case 'Min':
                return 'min';
            case 'Max':
                return 'max';
        }
        return 'Error';
    }
    getOutputs(inputs) {null
        return {
            Result: `${this.getFunction(inputs.Function)}(${inputs.Value1},${inputs.Value2})`
        }
    }
    getHeight(heights, fun = this.props.inputs.Function) {
        if (!heights.Value1)
            heights.Value1 = [0, 0]
        if (!heights.Value2)
            heights.Value2 = [0, 0]
        return [Math[this.getFunction(fun)](heights.Value1[0], heights.Value2[0]), Math[this.getFunction(fun)](heights.Value1[1], heights.Value2[1])]
    }
    center() {
        return <select onChange={(e) => {
            this.props.dispatch(Actions.updateNode(
                this.props.id,
                {Function: e.target.value },
                {Result:`${this.getFunction(e.target.value)}(${this.props.inputs.Value1},${this.props.inputs.Value2})` },
                this.getHeight(this.props.heights, e.target.value),
                this.props.cons))}}
            value={this.props.inputs.Function}
        >
            <option>Min</option>
            <option>Max</option>
        </select>
    }

    static get input() {return {
        Function: 'Min',
        Value1: '0.0',
        Value2: '0.0'
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
        Result: '0.0'
    }}
    static get height() { return [0, 0]}
}

class RoundNode extends Node {
    get name() {return 'Round'}
    constructor(props) {
        super(props)
    }
    getFunction (fun) {
        switch (fun) {
            case 'Round':
            case 'Floor':
                return 'floor';
            case 'Ceiling':
                return 'ceil';
        }
        return 'Error';
    }
    getOutputs(inputs) {
        let round = '';
        if (inputs.Function == 'Round') round = '+ 0.5'
        return {
            Result: `${this.getFunction(inputs.Function)}(${inputs.Value}${round})`
        }
    }
    getHeight(heights, fun = this.props.inputs.Function) {
        if (!heights.Value)
            heights.Value = [0, 0]
        let round = 0.0;
        if (fun == 'Round') round = 0.5
        return [Math[this.getFunction(fun)](heights.Value[0] + round), Math[this.getFunction(fun)](heights.Value[1] + round)]
    }
    center() {
        return <select onChange={(e) => {
            let round = '';
            if (e.target.value == 'Round') round = '+ 0.5'
            this.props.dispatch(Actions.updateNode(
                this.props.id,
                {Function: e.target.value },
                {Result:`${this.getFunction(e.target.value)}(${this.props.inputs.Value}${round})` },
                this.getHeight(this.props.heights, e.target.value),
                this.props.cons))}}
            value={this.props.inputs.Function}
        >
            <option>Round</option>
            <option>Floor</option>
            <option>Ceiling</option>
        </select>
    }

    static get input() {return {
        Function: 'Round',
        Value: '0.0'
    }}

    get show() {
        return {
            inputs: {
                Value: 0,
            },
            outputs: {Result: ''}
        }
    }
    static get output() {return {
        Result: '0.0'
    }}
    static get height() { return [0, 0]}
}

class AbsNode extends Node {
    get name() {return 'Abs'}
    constructor(props) {
        super(props)
    }
    getOutputs(inputs) {
        return {
            Result: `abs(${inputs.Value})`
        }
    }
    getHeight(heights) {
        if (!heights.Value)
            heights.Value = [0, 0]
        return [Math.abs(heights.Value[0]), Math.abs(heights.Value[1])]
    }
    center() {}

    static get input() {return {
        Value: '0.0'
    }}

    get show() {
        return {
            inputs: {
                Value: 0,
            },
            outputs: {
                Result: ''
            }
        }
    }
    static get output() {return {
        Result: '0.0'
    }}
    static get height() {
        return [0,0]
    }
}

class ModNode extends Node {
    get name() {return 'Mod'}
    constructor(props) {
        super(props)
    }
    getOutputs(inputs) {
        return {
            Result: `mod(${inputs.Value1}, ${inputs.Value2})`
        }
    }
    getHeight(heights) {
        if (!heights.Value1)
            heights.Value1 = [0, 0]
        if (!heights.Value2)
            heights.Value2 = [0, 0]
        return [0.0, Math.min(heights.Value1[1], heights.Value2[1])]
    }
    center() {}

    static get input() {return {
        Value1: '0.0',
        Value2: '1.0'
    }}

    get show() {
        return {
            inputs: {
                Value1: 0,
                Value2: 0
            },
            outputs: {
                Result: ''
            }
        }
    }
    static get output() {return {
        Result: '0.0'
    }}
    static get height() { return [0,0] }
}

class PowNode extends Node {
    get name() {return 'Pow'}
    constructor(props) {
        super(props)
    }
    getOutputs(inputs) {
        return {
            Result: `pow(${inputs.Value1}, ${inputs.Value2})`
        }
    }
    getHeight(heights) {
        if (!heights.Value1)
            heights.Value1 = [0, 0]
        if (!heights.Value2)
            heights.Value2 = [0, 0]
        return [Math.pow(heights.Value1[0], heights.Value2[1]), Math.pow(heights.Value1[1], heights.Value2[1])]
    }
    center() {}

    static get input() {return {
        Value1: '0.0',
        Value2: '1.0'
    }}

    get show() {
        return {
            inputs: {
                Value1: 0,
                Value2: 0
            },
            outputs: {
                Result: ''
            }
        }
    }
    static get output() {return {
        Result: '0.0'
    }}
    static get height() {
        return [0,0]
    }
}

export default {
    Operator: connect()(OperatorNode),
    Trig: connect()(TrigNode),
    MinMax: connect()(MinMaxNode),
    Round: connect()(RoundNode),
    Abs: connect()(AbsNode),
    Mod: connect()(ModNode),
    Pow: connect()(PowNode)
}
