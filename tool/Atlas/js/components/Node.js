import React from 'react';
import { connect } from 'react-redux';
import Actions from '../Actions';
import Input from './Input'
import Output from './Output'
class Node extends React.Component {
    el: ''
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            pos: {
                x: this.props.pos.x,
                y: this.props.pos.y
            },
            rel: null,
            showRemove: false
        };
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.removeNode = this.removeNode.bind(this);
    }

    componentWillUpdate(props, state) {
        if (!this.state.dragging && state.dragging) {
            document.addEventListener('mousemove', this.onDrag)
            document.addEventListener('mouseup', this.onMouseUp)
        }
        else if (this.state.dragging && !state.dragging) {
            document.removeEventListener('mousemove', this.onDrag)
            document.removeEventListener('mouseup', this.onMouseUp)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dirty)
            this.props.dispatch(Actions.updateNode(this.props.id,
                nextProps.inputs,
                this.getOutputs(nextProps.inputs),
            this.props.cons))
    }
    onMouseDown(e) {
        if (e.target.tagName != "INPUT" && !e.target.classList.contains("Field") && !e.target.parentElement.classList.contains("Handle")) {
            this.setState({
                dragging: true,
                rel: {
                    x: e.pageX - this.state.pos.x,
                    y: e.pageY - this.state.pos.y
                }
            })
            this.props.dispatch(Actions.startDragging(this.props.id))
        }
    }

    onDrag(e) {
        this.setState({
            pos: {
                x: e.pageX - this.state.rel.x,
                y: e.pageY - this.state.rel.y
            }
        })
    }

    onMouseUp(e) {
        this.setState({dragging: false})
        this.props.dispatch(Actions.setPos(this.props.id, this.state.pos))
    }

    removeNode(e) {
        this.props.dispatch(Actions.removeNode(this.props.id, this.props.cons));
    }
    render() {
        return <div
            className="Node"
            id={"Node" + this.props.id}
            style={{position: "absolute", left: this.props.globalOffset.x + this.state.pos.x, top: this.props.globalOffset.y + this.state.pos.y}}
            onMouseDown={this.onMouseDown}
        >

            <svg onMouseDown={this.removeNode} className="removeNodeButton" width="24" height="24" viewBox="0 0 300 300">
                <path d="   M150, 150 L0, 300Z
                            M150, 150 L300, 0Z
                            M150, 150 L0, 0Z
                            M150, 150 L300, 300Z"/>
            </svg>
            <Input
                input={this.show.inputs}
                node={this.props.id}
                cons={this.props.cons.filter(con => {return (con.Input.Node == this.props.id) ? true : false })}
            />
            <div className="Center">
                <div className="NodeName">
                    {this.name}
                </div>
                <div className="Values">
                    {this.center()}
                </div>
            </div>
            <Output
                output={this.show.outputs}
                node={this.props.id}
                cons={this.props.cons.filter(con => {return (con.Output.Node == this.props.id) ? true : false })}
            />
        </div>
    }
}

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
        Value: "10.0"
    }}
    get show() {
        return {
            inputs: {},
            outputs: {Value: ''}
        }
    }
    static get output() {return {
        Value: "10.0"
    }}
}

class MathNode extends Node {
    get name() {return 'Math'}
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
    center() {
        return <select onChange={(e) => {
            this.props.dispatch(Actions.updateNode(
                this.props.id,
                {Function: e.target.value },
                {Result:`${this.props.inputs.Value1}${this.getFunction(e.target.value)}${this.props.inputs.Value2}` },
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
}

class PerlinNode extends Node {
    get name() { return 'Perlin'; }
    constructor(props) { super(props); }
    getOutputs(inputs) { return 'perlin(vec3(position.x, position.y, 0.0))' }
    center() {}
    static get input() {return {
    }}
    get show() {
        return {
            inputs: {},
            outputs: {
                Value: ''
            }
        }
    }
    static get output() {return {
        Value: 'perlin(position.x, position.y, 0.0)'
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
                Y: ''
            }
        }
    }
    static get output() {return {
        X: 'position.x',
        Y: 'position.y'
    }}
}

class OutputNode extends Node {
    get name() { return 'Output'; }
    constructor(props) { super(props); }
    getOutputs(inputs) {
        let Vertex = `
        varying vec3 pos;
        varying vec3 newPosition;
        uniform int p[512];
        float grad(int hash, float x, float y, float z) {
            int h = int(mod(float(hash), 16.0));
            float u = h < 8 ? x : y;
            float v;
            if(h < 4 /* 0b0100 */)
                v = y;
            else if(h == 12 /* 0b1100 */ || h == 14 /* 0b1110*/)
                v = x;
            else
                v = z;
            return (floor(mod(float(hash), 2.0)) == 0.0 ? u : -u)+(floor(mod(float(hash / 2), 2.0)) == 0.0 ? v : -v);
        }
        float fade(float t) {
                                                        // Fade function as defined by Ken Perlin.  This eases coordinate values
                                                        // so that they will ease towards integral values.  This ends up smoothing
                                                        // the final output.
            return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); // 6t^5 - 15t^4 + 10t^3
        }
        int inc(int num) {
            num++;

            return num;
        }
        float perlin(float x, float y, float z) {
            float repeat = 0.0;
            if(repeat > 0.0) {
                x = mod(x,repeat);
                y = mod(y,repeat);
                z = mod(z,repeat);
            }

            int xi = int(mod(x, 256.0));                              // Calculate the "unit cube" that the point asked will be located in
            int yi = int(mod(y, 256.0));                              // The left bound is ( |_x_|,|_y_|,|_z_| ) and the right bound is that
            int zi = int(mod(z, 256.0));                              // plus 1.  Next we calculate the location (from 0.0 to 1.0) in that cube.
            float xf = fract(x);
            float yf = fract(y);
            float zf = fract(z);

            float u = fade(xf);
            float v = fade(yf);
            float w = fade(zf);

            int aaa, aba, aab, abb, baa, bba, bab, bbb;
            aaa = p[p[p[    xi ]+    yi ]+    zi ];
            aba = p[p[p[    xi ]+inc(yi)]+    zi ];
            aab = p[p[p[    xi ]+    yi ]+inc(zi)];
            abb = p[p[p[    xi ]+inc(yi)]+inc(zi)];
            baa = p[p[p[inc(xi)]+    yi ]+    zi ];
            bba = p[p[p[inc(xi)]+inc(yi)]+    zi ];
            bab = p[p[p[inc(xi)]+    yi ]+inc(zi)];
            bbb = p[p[p[inc(xi)]+inc(yi)]+inc(zi)];

            float x1, x2, y1, y2;
            x1 = mix(  grad (aaa, xf    , yf    , zf),           // The gradient function calculates the dot product between a pseudorandom
                        grad (baa, xf-1.0, yf    , zf),             // gradient vector and the vector from the input coordinate to the 8
                        u);                                     // surrounding points in its unit cube.
            x2 = mix(  grad (aba, xf    , yf-1.0, zf),           // This is all then mixed together as a sort of weighted average based on the faded (u,v,w)
                        grad (bba, xf-1.0, yf-1.0, zf),             // values we made earlier.
                        u);
            y1 = mix(x1, x2, v);
            x1 = mix(  grad (aab, xf    , yf    , zf-1.0),
                        grad (bab, xf-1.0, yf    , zf-1.0),
                        u);
            x2 = mix(  grad (abb, xf    , yf-1.0, zf-1.0),
                        grad (bbb, xf-1.0, yf-1.0, zf-1.0),
                        u);
            y2 = mix (x1, x2, v);

            return mix (y1, y2, w);                      // For convenience we bind the result to 0 - 1 (theoretical min/max before is [-1, 1])
        }
        void main() {
            float offset = 0.0;
            if (position.z > 0.1)
                offset = min(${inputs.Height}, 10.0);
            newPosition = vec3(position.xy,position.z + offset);
            pos = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition,1.0);
        }`
        let Fragment = `
        varying vec3 pos;
        varying vec3 newPosition;
        void main(void) {
            // vec3 N = normalize(cross(dFdx(pos), dFdy(pos)));
            // vec3 L = normalize(vec3(5, 5, 5));
            // vec4 diffuse = vec4(0.4, 0.4, 1.0, 1.0) * max(dot(L, N), 0.0);
            // gl_FragColor = diffuse;
            // float h = mod(newPosition.z, 1.0);
            // vec3 color = (h >= 0.1) ? vec3(1.0) : vec3 (0.0);
            // gl_FragColor = vec4(color, 1.0);
            // vec3 f  = fract (newPosition * 3.0);
            // vec3 df = fwidth(newPosition * 3.0);
            //
            // vec3 g = smoothstep(df * 1.0, df * 2.0, f);
            //
            // float c = g.z;
            //
            // gl_FragColor = vec4(c, c, c, 1.0);
            vec3 P = newPosition;
            float gsize = 10.0;
            float gwidth = 1.0;
            vec3 f  = abs(fract (P * gsize)-0.5);
        	vec3 df = fwidth(P * gsize);
        	float mi=max(0.0,gwidth-1.0), ma=max(1.0,gwidth);//should be uniforms
        	vec3 g=clamp((f-df*mi)/(df*(ma-mi)),max(0.0,1.0-gwidth),1.0);//max(0.0,1.0-gwidth) should also be sent as uniform
        	float c = g.z;
            // vec3 N = normalize(cross(dFdx(pos), dFdy(pos)));
            // vec3 L = normalize(vec3(5, 5, 5));
            // vec4 diffuse = vec4(0.4, 0.4, 1.0, 1.0) * max(dot(L, N), 0.0);
            // gl_FragColor = diffuse * c;
        	gl_FragColor = vec4(vec3(newPosition.z / 2.0), 1.0);
        }`
        this.props.dispatch(Actions.setProgram(Vertex, Fragment))
    }
    center() {}
    static get input() {return {
        Height: 0.0,
        Color: 0.0
    }}
    get show() {
        return {
            inputs: {
                 Height: '',
                 Color: ''
             },
            outputs: {}
        }
    }
    static get output() {return {
    }}
}

export default {
    Value: connect()(ValueNode),
    Math: connect()(MathNode),
    Trig: connect()(TrigNode),
    Position: connect()(PositionNode),
    Perlin: connect()(PerlinNode),
    Output: connect()(OutputNode)
}
