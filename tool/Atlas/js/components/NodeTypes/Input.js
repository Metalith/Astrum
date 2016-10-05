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
                step="any"
                />}
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
    center() { return <input id={"random"+this.props.id} type="number" value={Math.random()} step="any" readOnly /> }
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
        Random: 'rand(vec2(position.x, position.z))',
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
            <div className="Value"><input type="number" onChange={(e) => {this.updateInput("X", e.target.value)}} step="any"/></div>
            <div className="Value"><input type="number" onChange={(e) => {this.updateInput("Y", e.target.value)}} step="any"/></div>
            <div className="Value"><input type="number" onChange={(e) => {this.updateInput("Z", e.target.value)}} step="any"/></div>
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

class ColorNode extends Node {
    get name() { return 'Color'}
    constructor(props) {
        super(props);
        this.state.SLSelector = {
            X: "0",
            Y: "0"
        }
        this.state.HSelector = {
            X: "0",
            Y: "0"
        }
        this.state.Hue = 0;
        this.state.Shade = 100;
        this.state.Level = 100;
        this.moveSelector = this.moveSelector.bind(this)
    }
    getOutputs(inputs) { return PositionNode.output }
    drawSLPicker(canvas, hue) {
        var ctx = canvas.getContext('2d');
        for(let row=0; row<100; row++){
            var grad = ctx.createLinearGradient(0, 0, 100,0);
            grad.addColorStop(0, 'hsl('+hue+', 100%, '+(100-row)+'%)');
            grad.addColorStop(1, 'hsl('+hue+', 0%, '+(100-row)+'%)');
            ctx.fillStyle=grad;
            ctx.fillRect(0, row, 100, 1);
        }
    }
    drawHPicker(canvas) {
        var ctx = canvas.getContext('2d');
        for (let hue=0; hue<360; hue++) {
            ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
            ctx.fillRect(0,hue,100,1);
        }
    }
    moveSelector(e) {
        if (e.target.className == "SLPicker")
            this.setState({
                SLSelector: {
                    X: e.pageX - e.target.getBoundingClientRect().left,
                    Y: e.pageY - e.target.getBoundingClientRect().top
                }
            })
        if (e.target.className == "HPicker") {
            this.drawSLPicker(this.refs.SLPicker, (e.pageY - e.target.getBoundingClientRect().top - 10) * (360 / 255));
            this.setState({
                HSelector: {
                    X: e.pageX - e.target.getBoundingClientRect().left + e.target.offsetLeft - 10,
                    Y: e.pageY - e.target.getBoundingClientRect().top
                },
                Hue: (e.pageY - e.target.getBoundingClientRect().top - 10) * (360 / 255)
            })
        }
    }
    componentDidMount() {
        this.setState({
            SLSelector: {
                X: this.refs.SLPicker.offsetLeft - 10,
                Y: this.refs.SLPicker.offsetTop - 10
            },
            HSelector: {
                X: this.refs.HPicker.offsetLeft - 10,
                Y: this.refs.HPicker.offsetTop - 10
            }
        })
        this.drawSLPicker(this.refs.SLPicker, 0)
        this.drawHPicker(this.refs.HPicker)
    }
    center() {
        return <div className="Color" onMouseLeave={() => this.setState({showColor: false})}>
            <input type="text" placeholder="000000" maxlength="6" size="6" className="ColorInput" onFocus={() => this.setState({showColor: true})} />
            <div id={"CNP" + this.props.id}></div>
            <div className={"ColorPickerBox "}>
                <canvas
                    className="SLPicker"
                    width="100" height="100"
                    ref="SLPicker"
                    // onMouseMove={this.moveSelector}
                />
                <div
                    className="Selector"
                    style={{left:this.state.SLSelector.X+"px", top:this.state.SLSelector.Y+"px"}}>
                </div>
                <canvas
                    className="HPicker"
                    width="100" height="360"
                    ref="HPicker"
                    onMouseDown={this.moveSelector}
                />
                <div
                    className="Selector"
                    style={{left:this.state.HSelector.X+"px", top:this.state.HSelector.Y+"px"}}
                >
                </div>
            </div>
        </div>
    }
    static get input() {return {
        R: '255.0',
        B: '255.0',
        G: '255.0'
    }}
    get show() {
        return {
            inputs: {},
            outputs: {
                R: '',
                G: '',
                B: ''
            }
        }
    }
    static get output() {return {
        R: '1.0',
        G: '1.0',
        B: '1.0'
    }}
}

export default {
    Value: connect()(ValueNode),
    Vector: connect()(VectorNode),
    Random: connect()(RandomNode),
    Position: connect()(PositionNode),
    Color: connect()(ColorNode)
}
