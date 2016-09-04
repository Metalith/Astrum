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
        // let geometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);
        //
        // let material = new THREE.ShaderMaterial({
        //     vertexShader: document.getElementById( 'vertexShader' ).textContent,
        //     fragmentShader: document.getElementById( 'fragmentShader' ).textContent
        // });
        // this.background = new THREE.Mesh(geometry, material);
        // this.background.rotation.x = -1.57;
        // this.scene.add(this.background);
        // this.background.position.y = 0;
        //
        // material = new THREE.ShaderMaterial({
        //     vertexShader: props.Program.Vertex,
        //     fragmentShader: props.Program.Fragment
        // });
        // let size = Math.min(window.innerWidth, window.innerHeight);
        // geometry = new THREE.PlaneBufferGeometry(size, size, 256,  256);
        // this.output = new THREE.Mesh(geometry, material);
        // this.output.rotation.x = -1.57;
        // this.scene.add(this.output);
        // this.output.position.y = 0.1;
        var aspect = window.innerWidth / window.innerHeight;
        var d = window.innerHeight;
        this.camera = new THREE.OrthographicCamera(d * aspect / - 2, d * aspect / 2, d / 2, d / - 2, 1, 4000);
        this.camera.position.set(0, d, 0);
        this.camera.lookAt(this.scene.position);
        this.camera.rotation.order = 'YXZ';


        let size = Math.max(d * aspect, d);
        let geometry = new THREE.PlaneBufferGeometry(size * 2, size * 2);

        let material = new THREE.ShaderMaterial({
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent
        });
        this.background = new THREE.Mesh(geometry, material);
        this.background.rotation.x = -1.57;
        this.scene.add(this.background);
        this.background.position.y = 0;

        material = new THREE.ShaderMaterial({
            vertexShader: props.Program.Vertex,
            fragmentShader: props.Program.Fragment
        });
        size = Math.min(d * aspect, d);
        material.extensions.derivatives = true;
        geometry = new THREE.BoxBufferGeometry( size, size, size/5, 64, 64, 1 );
        this.output = new THREE.Mesh(geometry, material);
        this.output.rotation.x = -1.57;
        this.scene.add(this.output);
        this.output.position.y = 0.1;

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
            let d = window.innerHeight;
            if (this.props.View == "3D") {
                this.camera.position.x += d / 75.0;
                this.camera.position.z += d / 75.0;
                this.camera.rotation.y +=  Math.PI / 300;
                this.camera.rotation.x += ( Math.atan( - 1 / Math.sqrt( 2 ) ) - (- Math.PI / 2)) / 75;
                if (this.camera.position.x >= window.innerHeight)
                    this.transition = false;

            }
            else if (this.props.View == "2D") {
                this.camera.position.x -= d / 75.0;
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
        let w = window.innerWidth;
        let h = window.innerHeight;
        this.camera.left = w / -2;
        this.camera.right = w / 2;
        this.camera.top = h / 2;
        this.camera.bottom = h / -2;
        this.camera.updateProjectionMatrix();

        let size = Math.max(w, h);
        this.background.geometry = new THREE.PlaneBufferGeometry(size * 2.5, size * 2.5);
        size = Math.min(window.innerWidth, window.innerHeight);
        this.output.geometry = new THREE.PlaneBufferGeometry(size, size, 256,  256);
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
