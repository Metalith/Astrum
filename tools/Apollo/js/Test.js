var w = window.innerWidth;
var h = window.innerHeight;
a = h / w;

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera( 20 / - 2, 20 / 2, 20 * a / 2, 20 * a / - 2, 0.1, 10 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = 0;
renderer.domElement.style.zIndex = -1;
renderer.setClearColor( 0x0e1112, 1 );
document.getElementById("Editor").appendChild( renderer.domElement );

var helper = new THREE.GridHelper( 10, 10, 0x1a1a1a, 0x1a1a1a);
helper.position.y = 0;
scene.add( helper );

camera.position.set(0, 5, 0)
camera.lookAt(scene.position)

var render = function () {
    requestAnimationFrame( render );

    renderer.render(scene, camera);
};

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.bottom = (window.innerHeight / window.innerWidth) * -10;
    camera.top = (window.innerHeight / window.innerWidth) * 10;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

render();
