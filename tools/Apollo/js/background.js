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
	w = window.innerWidth;
	h = window.innerHeight;
	camera.left = w / -2;
	camera.right = w / 2;
	camera.top = h / 2;
	camera.bottom = h / -2;
	camera.updateProjectionMatrix();

	var p = plane.geometry.attributes.position.array;

	p[0] = w / -2;
	p[1] = h / 2;
	p[3] = w / 2;
	p[4] = h / 2;

	p[6] = -w / 2;
	p[7] = h / -2;

	p[9] = w / 2;
	p[10] = h / -2;
	// p[1]
	plane.geometry.attributes.position.needsUpdate = true;
    renderer.setSize( window.innerWidth, window.innerHeight );
}

var line, selectedOutput, updatingLine = false;

function UpdateNodeConnector(e) {
    line.geometry.vertices[1].x = e.pageX - w / 2;
    line.geometry.vertices[1].z = e.pageY - h / 2;
    line.geometry.verticesNeedUpdate = true;
    line.geometry.computeLineDistances();
    line.geometry.lineDistancesNeedUpdate = true;
}

$('.Field').mousedown(function(e) {
    selectedOutput = $(this);
    $(this).css("color", "#AAA");
    var handle = $(this).find(".Handle");
    handle.css("background-color", "#AAA");
    var material =  new THREE.LineDashedMaterial( { color: 0xDDDDDD, dashSize: 30, gapSize: 10, linewidth: 3 } );
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(handle.offset().left + handle.width() / 2 - w / 2, 1, handle.offset().top  + handle.width() / 2 - h / 2));
    geometry.vertices.push(new THREE.Vector3(e.pageX - w / 2, 1, e.pageY - h / 2));
    geometry.computeLineDistances();
    line = new THREE.Line(geometry, material);
    scene.add(line)
	updatingLine = true;
    $(window).bind("mousemove", UpdateNodeConnector);
    renderer.render(scene, camera);

    return false;
});

$(document).mouseup(function(){
	if(updatingLine) {
	    $(window).unbind("mousemove", UpdateNodeConnector);
	    selectedOutput.removeAttr('style');
	    selectedOutput.find(".Handle").removeAttr('style');
	    scene.remove(line);
		updatingLine = false;
	}
	return false;
});
render();
