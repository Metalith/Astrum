
import React from 'react'
import { connect } from 'react-redux';
import * as THREE from 'three'

class Background extends React.Component {
    constructor(props) {
        super(props);
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.scene = new THREE.Scene();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.position = "absolute";
        this.renderer.domElement.style.top = 0;
        this.renderer.domElement.style.zIndex = 0;
        this.renderer.domElement.className = "background";
        this.renderer.setClearColor(0x0e1112, 1);
        var aspect = window.innerWidth / window.innerHeight;
        var d = 20.0;
        this.camera = new THREE.OrthographicCamera(d * aspect / - 2, d * aspect / 2, d / 2, d / - 2, 0.1, 100);
        this.camera.position.set(0, d, 0);
        this.camera.lookAt(this.scene.position);
        this.camera.rotation.order = 'YXZ';


        let size = Math.max(d * aspect, d);
        let geometry = new THREE.PlaneBufferGeometry(size * 4, size * 4);

        let material = new THREE.ShaderMaterial({
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent
        });
        let permutation = [ 151,160,137,91,90,15,                 // Hash lookup table as defined by Ken Perlin.  This is a randomly
            131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,    // arranged array of all numbers from 0-255 inclusive.
            190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
            88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
            77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
            102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
            135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
            5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
            223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
            129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
            251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
            49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
            138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
        ];
        let p = [];
        for(let x=0;x<512;x++) {
            p[x] = permutation[x%256];
        }
        this.background = new THREE.Mesh(geometry, material);
        this.background.rotation.x = -1.57;
        this.scene.add(this.background);
        this.background.position.y = -0.2;

        material = new THREE.ShaderMaterial({
            uniforms: {
                p: { type: "iv", value: p }
            },
            vertexShader: props.Program.Vertex,
            fragmentShader: props.Program.Fragment
        });
        console.log(material);
        size = Math.min(d * aspect, d);
        material.extensions.derivatives = true;
        geometry = new THREE.BoxBufferGeometry( size / 1.25, size / 1.25, 1.0, 64, 64, 1 );
        this.output = new THREE.Mesh(geometry, material);
        this.output.rotation.x = -1.57;
        this.scene.add(this.output);
        this.output.position.y = 0.5;

        this.renderScene = this.renderScene.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);

        window.addEventListener( 'resize', this.onWindowResize, false );
        this.renderScene();


    }
    componentWillReceiveProps(nextProps) {
        if (this.props.View != nextProps.View) {
            this.transition = true;
        }
        else {
            this.output.material.vertexShader = nextProps.Program.Vertex;
            this.output.material.fragmentShader = nextProps.Program.Fragment;
            this.output.material.needsUpdate = true;
        }
    }
    componentDidMount() {
        document.getElementById("bg-container").appendChild( this.renderer.domElement );
    }

    render() {
        return <div id="bg-container"></div>
    }

    renderScene() {
        if (this.transition) {
            let d = 20.0;
            if (this.props.View == "3D") {
                this.camera.position.x += d / 75.0;
                this.camera.position.y += d / 300.0;
                this.camera.position.z += d / 75.0;
                this.camera.rotation.y +=  Math.PI / 300;
                this.camera.rotation.x += ( Math.atan( - 1 / Math.sqrt( 2 ) ) - (- Math.PI / 2)) / 75;
                if (this.camera.position.x >= d)
                    this.transition = false;

            }
            else if (this.props.View == "2D") {
                this.camera.position.x -= d / 75.0;
                this.camera.position.y -= d / 300.0;
                this.camera.position.z -= d / 75.0;
                this.camera.rotation.y -=  Math.PI / 300;
                this.camera.rotation.x -= ( Math.atan( - 1 / Math.sqrt( 2 ) ) - (- Math.PI / 2)) / 75;
                if (this.camera.position.x <= 0.0)
                    this.transition = false;
            }
        }
        requestAnimationFrame(this.renderScene); // See http://stackoverflow.com/questions/6065169/requestanimationframe-with-this-keyword // Swithed to fat arrow
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        var aspect = window.innerWidth / window.innerHeight;
        var d = 20.0;
        let w = d*aspect;
        let h = d;
        this.camera.left = w / -2;
        this.camera.right = w / 2;
        this.camera.top = h / 2;
        this.camera.bottom = h / -2;
        this.camera.updateProjectionMatrix();

        let size = Math.max(w, h);
        this.background.geometry = new THREE.PlaneBufferGeometry(size * 4, size * 4);
        size = Math.min(w, h);
        this.output.geometry = new THREE.BoxBufferGeometry( size / 1.25, size / 1.25, 1.0, 64, 64, 1 );
        this.background.geometry.needsUpdate = true;
        this.background.geometry.attributes.position.needsUpdate = true;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

var mapStateToProps = (state) =>
    ({
        Program: state.Program,
        View: state.View
    })

export default connect(mapStateToProps)(Background)
