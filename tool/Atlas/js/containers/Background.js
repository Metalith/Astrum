
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


        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        window.addEventListener( 'resize', this.onWindowResize, false );
        this.renderScene();


    }
    componentWillReceiveProps(nextProps) {
        if (this.props.View != nextProps.View) {
            this.transition = true;
        }
        else {
            this.screenRTT.material.vertexShader = nextProps.Program.Vertex;
            this.screenRTT.material.fragmentShader = nextProps.Program.Fragment;
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
        this.stats.begin();
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
            console.log("draw");
            this.screenRTT.material.uniforms.view.value = this.view;
            this.renderer.render(this.sceneRTT, this.camera, this.rtTexture, true );
            this.drawScene = false;
        }
        this.stats.end();
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
