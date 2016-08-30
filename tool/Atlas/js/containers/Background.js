import React from 'react'
import * as THREE from 'three'

class Background extends React.Component {
    constructor(props) {
        super(props);
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 10);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.position = "absolute";
        this.renderer.domElement.style.top = 0;
        this.renderer.domElement.style.zIndex = 0;
        this.renderer.domElement.className = "background";
        this.renderer.setClearColor(0x0e1112, 1);
        let geometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);

        let material = new THREE.ShaderMaterial({
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent
        });
        this.background = new THREE.Mesh(geometry, material);
        this.background.rotation.x = -1.57;
        this.scene.add(this.background);
        this.background.position.y = 0;

        this.camera.position.set(0, 5, 0);
        this.camera.lookAt(this.scene.position);

        this.renderScene = this.renderScene.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);

        window.addEventListener( 'resize', this.onWindowResize, false );
        this.renderScene();


    }

    componentDidMount() {
        document.getElementById("bg-container").appendChild( this.renderer.domElement );
    }

    render() {
        return <div id="bg-container"></div>
    }

    renderScene() {
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

        let p = this.background.geometry.attributes.position.array;

        p[0] = w / -2;
        p[1] = h / 2;
        p[3] = w / 2;
        p[4] = h / 2;

        p[6] = -w / 2;
        p[7] = h / -2;

        p[9] = w / 2;
        p[10] = h / -2;
        this.background.geometry.attributes.position.needsUpdate = true;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export default Background
