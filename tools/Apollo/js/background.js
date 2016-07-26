var w = window.innerWidth;
var h = window.innerHeight;
a = h / w;

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, 0.1, 10);
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = 0;
renderer.domElement.style.zIndex = -1;
renderer.setClearColor( 0x0e1112, 1 );
document.getElementById("Editor").appendChild( renderer.domElement );

var geometry = new THREE.PlaneBufferGeometry( w, h );
//Plane material
var uniforms = {
    resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth,window.innerHeight) }
};

var material = new THREE.ShaderMaterial( {
	vertexShader: document.getElementById( 'vertexShader' ).textContent,
	fragmentShader: document.getElementById( 'fragmentShader' ).textContent
} );
var plane = new THREE.Mesh( geometry, material );
plane.rotation.x = -1.57;
plane.position.y = 0;
scene.add( plane );

camera.position.set(0, 5, 0)
camera.lookAt(scene.position)

var render = function () {
    requestAnimationFrame( render );
    renderer.render(scene, camera);
};

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

var line;
function UpdateNodeConnector(e) {
    line.geometry.vertices[1].x = e.pageX - w / 2;
    line.geometry.vertices[1].z = e.pageY - h / 2;
    line.geometry.verticesNeedUpdate = true;
    line.geometry.computeLineDistances();
    line.geometry.lineDistancesNeedUpdate = true;
}

$('.OutputField').mousedown(function(e) {
    var material =  new THREE.LineDashedMaterial( { color: 0xDDDDDD, dashSize: 30, gapSize: 10, linewidth: 3 } );
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(e.pageX - w / 2, 1, e.pageY - h / 2));
    geometry.vertices.push(new THREE.Vector3(e.pageX - w / 2, 1, e.pageY - h / 2));
    geometry.computeLineDistances();
    line = new THREE.Line(geometry, material);
    scene.add(line)
    $(window).bind("mousemove", UpdateNodeConnector);
    renderer.render(scene, camera);
    return false;
});

$(document).mouseup(function(){
    $(window).unbind("mousemove", UpdateNodeConnector);
    scene.remove(line);
    return false;
});
render();
