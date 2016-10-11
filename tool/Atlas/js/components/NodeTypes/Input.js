import React from 'react';
import { connect } from 'react-redux';
import Actions from '../../Actions';
import Node from './Node.js';

class ValueNode extends Node {
    get name() { return 'Value'; }
    constructor(props) { super(props); }
    getOutputs(inputs) { return { Value: inputs.Value } }
    getHeight(heights) {
        let value = parseFloat(this.props.inputs.Value)
        return [ value, value ]
    }
    center() {
        return <input
            type="number"
            onChange={(e) => {
                let value = (e.target.value.length == 0) ? 0.0 : parseFloat(e.target.value);
                this.props.dispatch(Actions.updateNode(
                    this.props.id,
                    {Value: e.target.value},
                    {Value: (e.target.value.length == 0) ? "0.0" : parseFloat(e.target.value).toFixed(Math.max(1, (e.target.value.split('.')[1] || []).length))},
                    [value, value],
                    this.props.cons))}}
                placeholder="0.00"
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
    static get height() { return [0, 0] }
}

class RandomNode extends Node {
    get name() { return 'Random'; }
    constructor(props) { super(props); }
    getOutputs(inputs) { return RandomNode.output }
    getHeight(heights) { return RandomNode.height }
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
    static get height() { return [0, 1] }
}

class PositionNode extends Node {
    get name() { return 'Position'; }
    constructor(props) { super(props); }
    getOutputs(inputs) { return PositionNode.output }
    getHeight(heights) { return PositionNode.height }
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
    static get height() { return [ Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY ] }
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
        this.state.showColor = false;
        this.moveSelector = this.moveSelector.bind(this)
        this.handleString = this.handleString.bind(this)
    }
    getOutputs(inputs) {
        return this.convertRGB(inputs);
    }
    getHeight(heights) { return [0, 1 ]}
    convertRGB(HSL) {
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        var H = HSL.H;
        var S = HSL.S;
        var L = HSL.L;
        var R, G, B;
        L /= 100;
        S /= 100;
        if (S == 0) {
            R = L;
            G = L;
            B = L;
        } else {
            var temp1, temp2;
            function Hue2RGB(H) {
                if ( H < 0 ) H += 1;
                if ( H > 1 ) H -= 1;
                if ( H < 1 / 6) return temp2 + (temp1 - temp2) * 6 * H;
                if ( H < 1 / 2 ) return temp1;
                if ( H < 2 / 3 ) return temp2 + (temp1 - temp2) * ( (2 / 3) - H) * 6;
                return temp2;
            }
            temp1 = L < 0.5 ? L * (1 + S) : L + S - L * S;
            temp2 = 2 * L - temp1;
            H = H / 360.0;
            R = Hue2RGB(H + 1/3);
            G = Hue2RGB(H);
            B = Hue2RGB(H - 1/3);
        }
        return {R:R, G:G, B:B}
    }
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
    handleString(e) {
        if (e.target.value.length <= 6) {
            var hex = /([a-f\d]{1,2})($|[a-f\d]{1,2})($|[a-f\d]{1,2})$/i.exec(e.target.value || "0");
            let RGB = {
                R: parseInt(hex[1], 16) || 0,
                G: parseInt(hex[2], 16) || 0,
                B: parseInt(hex[3], 16) || 0
            }
            let newInput = this.updateHSL(RGB);
            this.drawSLPicker(this.refs.SLPicker,  newInput.H);
            newInput.string = e.target.value;
            this.props.dispatch(Actions.updateNode(
                this.props.id,
                newInput,
                this.getOutputs(newInput),
                this.props.cons))
        }
    }
    updateHSL(RGB) {
        var R = RGB.R /255;
        var G = RGB.G /255;
        var B = RGB.B /255;
        var H, S, L;
        var max = Math.max(R, G, B);
        var min = Math.min(R, G, B);
        L = (min + max) / 2.0;
        if (min == max) {
            S = 0;
            H = 0;
        } else {
            if ( L < 0.5 ) S = (max-min)/(max+min);
            else S = (max - min) / (2.0 - max - min);

            if (max == R) H = (G-B)/(max-min);
            if (max == G) H = 2.0 + (B-R)/(max-min);
            if (max == B) H = 4.0 + (R-G)/(max-min);
            H *= 60;
        }
        if (H < 0) H+=360;
        return {H:H, S:S * 100, L:L * 100}
    }
    moveSelector(e) {
        if (e.target.className == "SLPicker") {
            let newInput = Object.assign({}, this.props.inputs, {
                S: 100 - ((e.pageX - e.target.getBoundingClientRect().left) * (100 / 255)),
                L: 100 - ((e.pageY - e.target.getBoundingClientRect().top) * (100 / 255)),
            })
            let RGB = this.convertRGB(newInput);
            newInput.string = (((1 << 24) + (RGB.R * 255 << 16) + (RGB.G * 255 << 8) + RGB.B * 255).toString(16).slice(1,7).toUpperCase());
            this.props.dispatch(Actions.updateNode(
                this.props.id,
                newInput,
                this.getOutputs(newInput),
                this.props.cons))
        }
        else if (e.target.className == "HPicker") {
            this.drawSLPicker(this.refs.SLPicker, (e.pageY - e.target.getBoundingClientRect().top) * (360 / 255));
            let newInput = Object.assign({}, this.props.inputs, {H: (e.pageY - e.target.getBoundingClientRect().top) * (360 / 255)})
            let RGB = this.convertRGB(newInput);
            newInput.string = (((1 << 24) + (RGB.R * 255 << 16) + (RGB.G * 255 << 8) + RGB.B * 255).toString(16).slice(1,7).toUpperCase());
            this.props.dispatch(Actions.updateNode(
                this.props.id,
                newInput,
                this.getOutputs(newInput),
                this.props.cons))
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
        this.drawSLPicker(this.refs.SLPicker, this.props.inputs.H)
        this.drawHPicker(this.refs.HPicker)
    }
    center() {
        return <div className="Color" onMouseLeave={() => this.setState({showColor: false})}>
            <input type="text" placeholder="000000" maxlength="6" size="6" className="ColorInput" onMouseDown={() => this.setState({showColor: true})} onChange={this.handleString} value={this.props.inputs.string}/>
            <div id={"CNP" + this.props.id} style={{backgroundColor: `hsl(${this.props.inputs.H}, ${this.props.inputs.S}%, ${this.props.inputs.L}%)`}}/>
            <div className={"ColorPickerBox " + (this.state.showColor ? "" : "Hidden")}>
                <canvas
                    className="SLPicker"
                    width="100" height="100"
                    ref="SLPicker"
                    onMouseDown={this.moveSelector}
                />
                <div
                    className="Selector"
                    style={{left:this.props.inputs.S*255/-100+255+"px", top:this.props.inputs.L*255/-100+255+"px"}}>
                </div>
                <canvas
                    className="HPicker"
                    width="100" height="360"
                    ref="HPicker"
                    onMouseDown={this.moveSelector}
                />
                <div
                    className="Selector"
                    style={{left:266+16+"px", top:this.props.inputs.H*255/360+"px"}}
                >
                </div>
            </div>
        </div>
    }
    static get input() {return {
        H: '0',
        S: '100',
        L: '100',
        string: 'FFFFFF'
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
    static get height() { return [0, 1] }
}

export default {
    Value: connect()(ValueNode),
    Random: connect()(RandomNode),
    Position: connect()(PositionNode),
    Color: connect()(ColorNode)
}
