
import React from 'react'
import { connect } from 'react-redux';
import * as THREE from 'three'

class Background extends React.Component {
    constructor(props) {
        super(props);

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.position = "absolute";
        this.renderer.domElement.style.top = 0;
        this.renderer.domElement.style.zIndex = 0;
        this.renderer.domElement.className = "background";
        this.renderer.setClearColor(0x0e1112, 1);

        this.sceneRTT = new THREE.Scene();
        this.scene = new THREE.Scene();

        var aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.OrthographicCamera(aspect / - 2, aspect / 2, 1.0 / 2.0, 1.0 / - 2.0, 0.1, 100);
        this.camera.position.set(0, 0, 20);
        this.camera.lookAt(this.sceneRTT.position);

        //------Render to Texture------
        let geometry = new THREE.PlaneBufferGeometry(aspect, 1.0);
        let materialRTT = new THREE.ShaderMaterial({
            uniforms: {
                "view": { value: 0 },
                "resolution" : { type: "v2", value: new THREE.Vector2( window.innerWidth, window.innerHeight ) }
            },
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader_RTT' ).textContent
        });
        this.view = 0;
        materialRTT.extensions.derivatives = true;
        this.screenRTT = new THREE.Mesh(geometry, materialRTT);
        this.sceneRTT.add(this.screenRTT);
        this.rtTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
        this.drawScene = true;
        //------Normal Scene------
        let material = new THREE.ShaderMaterial({
            uniforms: {
                "screen": {type: "t", value: this.rtTexture.texture }
            },
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent
        });
        material.extensions.derivatives = true;
        this.screen = new THREE.Mesh(geometry, material);
        this.scene.add(this.screen);

        this.renderScene = this.renderScene.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);


        // this.stats = new Stats();
        // document.body.appendChild(this.stats.dom);

        window.addEventListener( 'resize', this.onWindowResize, false );
        this.renderScene();


    }
    componentWillReceiveProps(nextProps) {
        if (this.props.View != nextProps.View) {
            this.transition = true;
        }
        else {
            this.screenRTT.material.fragmentShader = `
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
                float rand(vec2 co) {
                    float a = 12.9898;
                    float b = 78.233;
                    float c = 43758.5453;
                    float dt= dot(co.xy ,vec2(a,b));
                    float sn= mod(dt,3.14);
                    return fract(sin(sn) * c);
                }
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
                    for (int i = 0; i < 8; i++) {
                        if (i == octaves) return total;
                        total += snoise(p * frequency) * amplitude;
                        frequency *= lacunarity;
                        amplitude *= gain;
                    }
                    return total;
                }

                float rfBM(vec3 p, int octaves, float frequency, float lacunarity, float amplitude, float gain) {
                    float total = 0.0;
                    for (int i = 0; i < 8; i++) {
                        if (i == octaves) return total;
                        total += abs(snoise(p * frequency)) * amplitude;
                        frequency *= lacunarity;
                        amplitude *= gain;
                    }
                    return total;
                }

                float density(vec3 position) {
                    return ${nextProps.Program.Height};
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
                    for(int i = 0; i < 1000; ++i) {
                        float d = scene(rayOrigin + rayDirection * t);
                        if(d < 0.005 * t || t > 100.0) {
                            return t;
                        }
                        t += d * 0.1;
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
                        vec3 position = ro + rd*dist;
                        vec3 surfNormal = getNormal(position);
                        vec3 lp = vec3(15, 10, 15);
                    	vec3 ld = lp-position;
                    	float len = length( ld ); // Distance from the light to the surface point.
                    	ld /= len; // Normalizing the light-to-surface, aka light-direction, vector.
                        float diffuse = max( 0.0, dot(surfNormal, ld) ); //The object's diffuse value, which depends on the angle that the light hits the object.
                        vec3 Color = vec3(${nextProps.Program.R}, ${nextProps.Program.G}, ${nextProps.Program.B});
                        gl_FragColor = vec4(Color * diffuse, 1.0);
                    } else {
                    	vec3 forward = vec3(0, -1, 0);
                        vec3 up = vec3(0, 0, 1);
                        vec3 right = vec3(1, 0, 0);
                        vec3 position = vec3(0,10,0)  + screenCoords.x*right + screenCoords.y*up;
                        float height = density(position);
                        float f  = fract (height * 20.0);
                        float df = fwidth(height * 25.0);
                        float g = smoothstep(df * 0.5, df * 1.0, f);
                        float c = g;
                        vec3 Color = vec3(${nextProps.Program.R}, ${nextProps.Program.G}, ${nextProps.Program.B});
                        gl_FragColor = vec4(Color * c, 1.0);
                    }
                }`;
            this.screenRTT.material.needsUpdate = true;
            this.drawScene = true;
        }
    }
    componentDidMount() {
        document.getElementById("bg-container").appendChild( this.renderer.domElement );
    }

    render() {
        return <div id="bg-container"></div>
    }

    renderScene() {
        // this.stats.begin();
        if (this.transition) {
            if (this.props.View == "3D") {
                this.view = 1;
            }
            else if (this.props.View == "2D") {
                this.view = 0;
            }
            this.transition = false;
            this.drawScene =  true;
        }
        requestAnimationFrame(this.renderScene); // See http://stackoverflow.com/questions/6065169/requestanimationframe-with-this-keyword // Swithed to fat arrow
        this.renderer.clear();
        if (this.drawScene) {
            this.screenRTT.material.uniforms.view.value = this.view;
            this.renderer.render(this.sceneRTT, this.camera, this.rtTexture, true );
            this.drawScene = false;
        }
        // this.stats.end();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        var aspect = window.innerWidth / window.innerHeight;
        let w = aspect;
        let h = 1.0;
        this.camera.left = aspect / -2;
        this.camera.right = aspect / 2;
        this.camera.top = 1.0 / 2;
        this.camera.bottom = 1.0 / -2;
        this.camera.updateProjectionMatrix();

        this.screenRTT.geometry = new THREE.PlaneBufferGeometry(aspect, 1.0);
        this.screen.geometry = new THREE.PlaneBufferGeometry(aspect, 1.0);
        this.rtTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );

        this.screen.material.uniforms.screen.value = this.rtTexture.texture;
        this.screenRTT.material.uniforms.resolution.value = new THREE.Vector2( window.innerWidth, window.innerHeight);

        this.drawScene = true;
    }
}

var mapStateToProps = (state) =>
    ({
        Program: state.Program,
        View: state.View
    })

export default connect(mapStateToProps)(Background)
