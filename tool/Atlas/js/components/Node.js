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
    getOutputs(inputs) { return 'cnoise(vec3(position.x, position.y, 0.0))' }
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
        Value: 'cnoise(vec3(position.x, 0.0, position.z))'
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
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }`
        let Fragment = `
        precision highp float;

        uniform vec2 resolution;
        uniform int view;
        vec3 mod289(vec3 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec2 mod289(vec2 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec3 permute(vec3 x) {
            return mod289(((x*34.0)+1.0)*x);
        }

        float snoise(vec2 v)
        {
            const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                              0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                             -0.577350269189626,  // -1.0 + 2.0 * C.x
                              0.024390243902439); // 1.0 / 41.0
            // First corner
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);

            // Other corners
            vec2 i1;
            //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
            //i1.y = 1.0 - i1.x;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            // x0 = x0 - 0.0 + 0.0 * C.xx ;
            // x1 = x0 - i1 + 1.0 * C.xx ;
            // x2 = x0 - 1.0 + 2.0 * C.xx ;
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;

            // Permutations
            i = mod289(i); // Avoid truncation effects in permutation
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            	+ i.x + vec3(0.0, i1.x, 1.0 ));

            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;

            // Gradients: 41 points uniformly over a line, mapped onto a diamond.
            // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;

            // Normalise gradients implicitly by scaling m
            // Approximation of: m *= inversesqrt( a0*a0 + h*h );
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

            // Compute final noise value at P
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        float scene(vec3 position) {
            return position.y - ${inputs.Height};
        }

        vec3 getNormal(vec3 p) {
            float eps = 0.001;
            return normalize(vec3(
        		scene(vec3(p.x+eps,p.y,p.z))-scene(vec3(p.x-eps,p.y,p.z)),
        		scene(vec3(p.x,p.y+eps,p.z))-scene(vec3(p.x,p.y-eps,p.z)),
        		scene(vec3(p.x,p.y,p.z+eps))-scene(vec3(p.x,p.y,p.z-eps))
        	));
        }

        float raymarch(vec3 ro, vec3 rd) {
            float sceneDist = 1e4;
        	float rayDepth = 0.0; // Ray depth. "start" is usually zero, but for various reasons, you may wish to start the ray further away from the origin.
        	for ( int i = 0; i < 128; i++ ) {

        		sceneDist = scene(ro + rd * rayDepth); // Distance from the point along the ray to the nearest surface point in the scene.
                if (( sceneDist < 0.005 ) || (rayDepth >= 100.0)) {
    		          break;
        		}
        		rayDepth += sceneDist * 0.5;

        	}
            if ( sceneDist >= 0.005 ) rayDepth = 5000.0;
        	else rayDepth += sceneDist;

        	return rayDepth;
        }
        void main(void) {
            vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
        	vec2 screenCoords = (2.0*gl_FragCoord.xy/resolution.xy - 1.0)*aspect;
            if (view == 1) {
            	vec3 lookAt = vec3(0.0, 0.0, 0.0);  // This is the point you look towards, or at.
            	vec3 camPos = vec3(20.0, 10.0, 20.0); // This is the point you look from, or camera you look at the scene through. Whichever way you wish to look at it.

                // Camera setup.
                vec3 forward = normalize(lookAt-camPos); // Forward vector.

                vec3 right = normalize(vec3(forward.z, 0., -forward.x )); // Right vector... or is it left? Either way, so long as the correct-facing up-vector is produced.
                vec3 up = normalize(cross(forward,right)); // Cross product the two vectors above to get the up vector.

                float FOV = 0.5;

                vec3 ro = camPos;
                vec3 rd = normalize(forward + FOV*screenCoords.x*right + FOV*screenCoords.y*up);

                float dist = raymarch(ro, rd);
                if ( dist >= 5000.0 ) {
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

                vec3 ro = vec3(0,10,0)  + screenCoords.x*right + screenCoords.y*up;
                vec3 rd = forward;

                float dist = raymarch(ro, rd);
                vec3 P = ro + rd * dist;
                P.y += 1.0;
                P.y /= 2.0;
                float f  = fract (P.y * 20.0);
                float df = fwidth(P.y * 25.0);

                float g = smoothstep(df * 0.5, df * 1.0, f);

                float c = g;
                gl_FragColor = vec4(vec3(0.4, 0.6, 1.0) * c * floor(P.y * 20.0) / 20.0, 1.0);
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
