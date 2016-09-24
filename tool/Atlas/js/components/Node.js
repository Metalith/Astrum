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

class OutputNode extends Node {
    get name() { return 'Output'; }
    constructor(props) { super(props); }
    getOutputs(inputs) {
        let Vertex = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }`
        let Fragment = `
        uniform vec2 resolution;
        uniform int view;
        //
        // Description : Array and textureless GLSL 2D/3D/4D simplex
        //               noise functions.
        //      Author : Ian McEwan, Ashima Arts.
        //  Maintainer : stegu
        //     Lastmod : 20110822 (ijm)
        //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
        //               Distributed under the MIT License. See LICENSE file.
        //               https://github.com/ashima/webgl-noise
        //               https://github.com/stegu/webgl-noise
        //

        vec3 mod289(vec3 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 mod289(vec4 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 permute(vec4 x) {
            return mod289(((x*34.0)+1.0)*x);
        }

        vec4 taylorInvSqrt(vec4 r)
        {
            return 1.79284291400159 - 0.85373472095314 * r;
        }

        float snoise(vec3 v)
        {
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

            // First corner
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 =   v - i + dot(i, C.xxx) ;

            // Other corners
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );

            //   x0 = x0 - 0.0 + 0.0 * C.xxx;
            //   x1 = x0 - i1  + 1.0 * C.xxx;
            //   x2 = x0 - i2  + 2.0 * C.xxx;
            //   x3 = x0 - 1.0 + 3.0 * C.xxx;
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
            vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

            // Permutations
            i = mod289(i);
            vec4 p = permute( permute( permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

            // Gradients: 7x7 points over a square, mapped onto an octahedron.
            // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
            float n_ = 0.142857142857; // 1.0/7.0
            vec3  ns = n_ * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );

            //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
            //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);

            //Normalise gradients
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            // Mix final noise value
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
            dot(p2,x2), dot(p3,x3) ) );
        }

        float fBM(vec3 p, int octaves, float frequency, float lacunarity, float amplitude, float gain) {
            float total = 0.0;
            for (int i = 0; i < 8; ++i) {
                total += snoise(p * frequency) * amplitude;
                frequency *= lacunarity;
                amplitude *= gain;
            }
            return total;
        }

        float density(vec3 position) {
            return ${inputs.Height};
        }
        float scene(vec3 p) {
            return p.y - density(p);
        }

        vec3 getNormal(vec3 p) {
            float eps = 0.001;
            return normalize(vec3(
        		scene(vec3(p.x+eps,p.y,p.z))-scene(vec3(p.x-eps,p.y,p.z)),
        		scene(vec3(p.x,p.y+eps,p.z))-scene(vec3(p.x,p.y-eps,p.z)),
        		scene(vec3(p.x,p.y,p.z+eps))-scene(vec3(p.x,p.y,p.z-eps))
        	));
        }

        float raymarch(vec3 rayOrigin, vec3 rayDirection) {
            float t = 0.0;
            for(int i = 0; i < 128; ++i) {
                float d = scene(rayOrigin + rayDirection * t);
                if(d < 0.005 * t || t > 100.0) {
                    return t;
                }
                t += d * 0.25;
            }
            return t;
        }
        void main(void) {
            vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
        	vec2 screenCoords = (2.0*gl_FragCoord.xy/resolution.xy - 1.0) * aspect;
            if (view == 1) {
            	vec3 lookAt = vec3(0.0, 0.0, 0.0);  // This is the point you look towards, or at.
            	vec3 camPos = vec3(20.0, 10.0, 20.0); // This is the point you look from, or camera you look at the scene through. Whichever way you wish to look at it.

                // Camera setup.
                vec3 forward = normalize(lookAt-camPos); // Forward vector.

                vec3 right = normalize(vec3(forward.z, 0., -forward.x )); // Right vector... or is it left? Either way, so long as the correct-facing up-vector is produced.
                vec3 up = normalize(cross(forward,right)); // Cross product the two vectors above to get the up vector.

                float FOV = 1.0;

                vec3 ro = camPos;
                vec3 rd = normalize(forward + FOV*screenCoords.x*right + FOV*screenCoords.y*up);

                float dist = raymarch(ro, rd);
                if ( dist >= 100.0 ) {
            	    gl_FragColor = vec4(vec3(0.05, 0.066, 0.07), 1.0);
            	    return;
            	}
                vec3 sp = ro + rd*dist;
                vec3 surfNormal = getNormal(sp);

                vec3 lp = vec3(15, 10, 15);
            	vec3 ld = lp-sp;

            	float len = length( ld ); // Distance from the light to the surface point.
            	ld /= len; // Normalizing the light-to-surface, aka light-direction, vector.
                float diffuse = max( 0.0, dot(surfNormal, ld) ); //The object's diffuse value, which depends on the angle that the light hits the object.
                vec3 Color = vec3(0.4, 0.6, 1.0);
                gl_FragColor = vec4(Color * diffuse, 1.0);
            } else {

            	vec3 forward = vec3(0, -1, 0);
                vec3 up = vec3(0, 0, 1);
                vec3 right = vec3(1, 0, 0);

                vec3 P = vec3(0,10,0)  + screenCoords.x*right + screenCoords.y*up;
                float height = density(P);
                height += 1.0;
                height /= 2.0;
                float f  = fract (height * 20.0);
                float df = fwidth(height * 25.0);

                float g = smoothstep(df * 0.5, df * 1.0, f);

                float c = g;
                gl_FragColor = vec4(vec3(0.4, 0.6, 1.0) * c * floor(height * 20.0) / 20.0, 1.0);
            }
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
