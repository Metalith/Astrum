$.contextMenu({
    selector: '#Editor',
    className: 'contextmenu-custom data-title',
    items: {
        "sep1": "",
        color: {
            name: "Color",
            className: 'contextmenu-item-custom',
            callback: function(key, opt){
                NodeManager.create({
                    name: "Color Node",
                    field: "color_input",
                    input: {
                            R: 255,
                            G: 255,
                            B: 255
                        },
                    output: {
                            RGB: "FFFFFF",
                            R: 255,
                            G: 255,
                            B: 255
                        }
                    },
                    opt.$menu.offset().left,
                    opt.$menu.offset().top
                );
            }
        },
        output: {
            name: "Output",
            className: 'contextmenu-item-custom',
            callback: function(key, opt){
                NodeManager.create({
                    name: "Output",
                    field: "display",
                    input: {
                            RGB: "0",
                        },
                    output: ""
                    },
                    opt.$menu.offset().left,
                    opt.$menu.offset().top
                );
            }
        }
    }
});

// set a title
$('.data-title').attr('data-menutitle', "Add Node");

var NodeManager = {
    nodeArray: [],
    CurrentNode: "",
    CurrentField: "",
    selectedNode: "",
    selectedField: "",
    connections: [],
    // ---------------
    // WebGL
    renderer: new THREE.WebGLRenderer({ antialias: true }),
    scene: new THREE.Scene(),
    camera: new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 10),
    displayNode: "",
    display: "",
    tempConnector: "",
    background: "",
    // ---------------
    create: function(nodeType, x, y) {
        var id = NodeManager.nodeArray.length;
        nodeType.id = id;
        var Header  = '<div class="Node" id="Node'+id+'" style="left:'+x+'px; top:'+y+'px">'
        var Title   = '<div class="NodeName">'+nodeType.name+'</div>'
        var Input   = "";
        for (var i in nodeType.input)
            if (nodeType.input.hasOwnProperty(i))
                Input += '<div class="Field">'+i+'<div class="Handle"></div></div><br>';
        Input = '<div class="Input">'+Input+'</div>'
        var Fields = "";
        switch (nodeType.field) {
            case "color_input":
                Fields = '<div class="Color">' +
                            '<div class="Preview"></div>' +
                            '<input type="text" placeholder="000000" value="FFFFFF" maxlength="6" size="6" class="color_input">' +
                            '<div class="ColorPickerBox" id="picker1" hidden>' +
                                '<canvas class="SLPicker" width="100" height="100"></canvas>' +
                                '<div class="Selector" hidden></div>' +
                                '<canvas class="HPicker" width="100" height="360"></canvas>' +
                                '<div class="Selector" hidden></div>' +
                                '<div class="Values">' +
                                    '<div class="Preview"></div>' +
                                    '<div class="Value" id="R">R<input type="text" maxlength="3" value="255"></div>' +
                                    '<div class="Value" id="G">G<input type="text" maxlength="3" value="255"></div>' +
                                    '<div class="Value" id="B">B<input type="text" maxlength="3" value="255"></div>' +
                                    '<div class="Value" id="H">H<input type="text" maxlength="3" value="000"></div>' +
                                    '<div class="Value" id="S">S<input type="text" maxlength="3" value="100"></div>' +
                                    '<div class="Value" id="L">L<input type="text" maxlength="3" value="100"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
                break;
            case "display":
                if (!this.displayNode) {
                    this.displayNode = nodeType;
                    var geometry = new THREE.PlaneBufferGeometry( Math.min(window.innerWidth, window.innerHeight), Math.min(window.innerWidth, window.innerHeight));
                    //Plane material
                    var material = new THREE.ShaderMaterial( {
                    	vertexShader:  document.getElementById( 'vertexShader' ).textContent,
                    	fragmentShader: document.getElementById( 'displayFragmentShader' ).textContent
                    } );

                    this.display = new THREE.Mesh( geometry, material);
                    this.display.rotation.x = -1.57;
                    this.display.position.y = -0.5;
                    NodeManager.scene.add( this.display );
                } else {
                    alert("Output already exists");
                    return;
                }
                break;
            default:
                break;
        }
        Fields = '<div class="Center">'+Fields+'</div>';
        var Output = "";
        for (var o in nodeType.output)
            if (nodeType.output.hasOwnProperty(o))
                Output += '<div class="Field">'+o+'<div class="Handle"></div></div><br>';
        Output = '<div class="Output">'+Output+'</div>'
        var Closing = '</div>'
        $("body").append(Header+Title+Input+Fields+Output+Closing);
        $('.Node').draggable({containment: "window", cancel: ".Handle, .Center, .Field" });
        switch (nodeType.field) {
            case "color_input":
                drawSVPicker($('#Node'+id).find('.SLPicker')[0], 0);
                drawHPicker($('#Node'+id).find('.HPicker')[0]);
                break;
            default:
        }
        NodeManager.CurrentNode = null;
        NodeManager.nodeArray[id] = nodeType;
    },
    connect: function(connection) {
        if ($(connection.inField).parent().attr("class") != $(connection.outField).parent().attr("class")) {
            var inNode = NodeManager.nodeArray[$(connection.inNode).attr("id").match(/\d+/)];
            var outNode = NodeManager.nodeArray[$(connection.outNode).attr("id").match(/\d+/)];
            inNode.input[$(connection.outField).text()] = outNode.output[$(connection.outField).text()]();
            inNode.update();
        } else {
            alert("Cannot connect NodeManager.");
        }
    },
    updateTempConnector: function(e) {
        NodeManager.tempConnector.geometry.vertices[1].x = e.pageX - window.innerWidth / 2;
        NodeManager.tempConnector.geometry.vertices[1].z = e.pageY - window.innerHeight / 2;
        NodeManager.tempConnector.geometry.verticesNeedUpdate = true;
        NodeManager.tempConnector.geometry.computeLineDistances();
        NodeManager.tempConnector.geometry.lineDistancesNeedUpdate = true;
    },
    renderConnections: function() {

    },
    updateDisplay: function() {

    }
};

NodeManager.renderer.setSize( window.innerWidth, window.innerHeight );
NodeManager.renderer.domElement.style.position = "absolute";
NodeManager.renderer.domElement.style.top = 0;
NodeManager.renderer.domElement.style.zIndex = 0;
NodeManager.renderer.setClearColor( 0x0e1112, 1 );
document.getElementById("Editor").appendChild( NodeManager.renderer.domElement );

var geometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
//Plane material
var material = new THREE.ShaderMaterial( {
	vertexShader: document.getElementById( 'vertexShader' ).textContent,
	fragmentShader: document.getElementById( 'fragmentShader' ).textContent
} );
NodeManager.background = new THREE.Mesh( geometry, material );
NodeManager.background.rotation.x = -1.57;
NodeManager.background.position.y = -1;
NodeManager.scene.add( NodeManager.background );

NodeManager.camera.position.set(0, 5, 0)
NodeManager.camera.lookAt(NodeManager.scene.position)

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
	w = window.innerWidth;
	h = window.innerHeight;
	NodeManager.camera.left = w / -2;
	NodeManager.camera.right = w / 2;
	NodeManager.camera.top = h / 2;
	NodeManager.camera.bottom = h / -2;
	NodeManager.camera.updateProjectionMatrix();

	var p = NodeManager.background.geometry.attributes.position.array;

	p[0] = w / -2;
	p[1] = h / 2;
	p[3] = w / 2;
	p[4] = h / 2;

	p[6] = -w / 2;
	p[7] = h / -2;

	p[9] = w / 2;
	p[10] = h / -2;
    NodeManager.background.geometry.attributes.position.needsUpdate = true;
    if(NodeManager.display) {
        p = NodeManager.display.geometry.attributes.position.array;
        var m = Math.min(window.innerWidth, window.innerHeight);

    	p[0] = m / -2;
    	p[1] = m / 2;
    	p[3] = m / 2;
    	p[4] = m / 2;

    	p[6] = -m / 2;
    	p[7] = m / -2;

    	p[9] = m / 2;
    	p[10] = m / -2;

        // p[1]
    	NodeManager.display.geometry.attributes.position.needsUpdate = true;
        //---------------
        //  Important
        //---------------
    }
    NodeManager.renderer.setSize( window.innerWidth, window.innerHeight );
}

var updatingLine;
$('body').on('mousedown mouseenter mouseleave mouseup', '.Field', function(e) {
	switch (e.type) {
		case "mouseenter":
			$(this).css('color', 'orange');
			$(this).find('.Handle').css('background-color', 'orange');
			NodeManager.CurrentField = this;
			break;
		case "mouseleave":
			if (NodeManager.selectedField != this) {
				$(this).removeAttr('style');
				$(this).find('.Handle').removeAttr('style');
				NodeManager.CurrentField = "";
			}
			break;
		case "mouseup":
			if (NodeManager.selectedField != NodeManager.CurrentField && NodeManager.CurrentField != "") {
				if ($(this).parent().attr("class") == "Input") { // Input -> Output
					NodeManager.connect({			//TODO: Refactor this into being the actual NodeManager and field string
						outNode: NodeManager.selectedNode,
						inNode: NodeManager.CurrentNode,
						outField: NodeManager.selectedOutput,
						inField: NodeManager.CurrentField
					});
				} else {										// Output <- Input
					NodeManager.connect({			//TODO: Refactor this into being the actual NodeManager and field string
						outNode: NodeManager.CurrentNode,
						inNode: NodeManager.selectedNode,
						outField: NodeManager.CurrentField,
						inField: NodeManager.selectedOutput
					});
				}
			}
			break;
		default:
			NodeManager.selectedOutput = this;
			NodeManager.selectedNode = NodeManager.CurrentNode;
		    $(this).css("color", "#AAA");
		    var handle = $(this).find(".Handle");
		    handle.css("background-color", "#AAA");
		    var material =  new THREE.LineDashedMaterial( { color: 0xDDDDDD, dashSize: 30, gapSize: 10, linewidth: 3 } );
		    var geometry = new THREE.Geometry();
		    geometry.vertices.push(new THREE.Vector3(handle.offset().left + handle.width() / 2 - window.innerWidth / 2, 1, handle.offset().top  + handle.width() / 2 - window.innerHeight / 2));
		    geometry.vertices.push(new THREE.Vector3(e.pageX - window.innerWidth / 2, 1, e.pageY - window.innerHeight / 2));
		    geometry.computeLineDistances();
		    NodeManager.tempConnector = new THREE.Line(geometry, material);
		    NodeManager.scene.add(NodeManager.tempConnector);
			updatingLine = true;
		    $(window).bind("mousemove", NodeManager.updateTempConnector);
	}
    // return false;
});

$(document).mouseup(function(event){
	if(updatingLine) {
	    $(window).unbind("mousemove", NodeManager.updateTempConnector);
	    $(NodeManager.selectedField).removeAttr('style');
	    $(NodeManager.selectedField).find(".Handle").removeAttr('style');
	    NodeManager.scene.remove(NodeManager.tempConnector);
		updatingLine = false;
	}
});

var render = function () {
    requestAnimationFrame( render );
    NodeManager.renderer.render(NodeManager.scene, NodeManager.camera);
};

render();

$('body').on("mouseover", '.Node', function() {
    NodeManager.CurrentNode = this;
});

NodeManager.create({
    name: "Color Node",
    field: "color_input",
    input: {
            R: 255,
            G: 255,
            B: 255
        },
    output: {
            RGB: function() {
                return $(document).find('.color_input').val();
            },
            R: 255,
            G: 255,
            B: function() {
                return "Blue";
            }
        }
    },
    0,
    0
);

NodeManager.create({
    name: "Output",
    field: "display",
    update: function() {
        var hex = /([a-f\d]{1,2})($|[a-f\d]{1,2})($|[a-f\d]{1,2})$/i.exec(this.input.RGB);
        NodeManager.display.material.fragmentShader = "void main(void) {gl_FragColor = vec4(vec3("
            + (parseInt(hex[1], 16) || 0) / 255.0 +","
            + (parseInt(hex[2], 16) || 0) / 255.0 +","
            + (parseInt(hex[3], 16) || 0) / 255.0 +"), 1.0);}";
        NodeManager.display.material.needsUpdate = true;
    },
    input: {
            RGB: "0",
        },
    output: ""
    },
    200,
    200
);

//---------------------
// Color Input Events
//---------------------
$('body').on("mouseover focus click", ".color_input", function() {
    $(NodeManager.CurrentNode).find(".ColorPickerBox").toggle(true);
});

$('body').on('mouseleave', '.Color', function() {
    $(NodeManager.CurrentNode).find(".ColorPickerBox").toggle(false);
})

var canvasClicked;
$('body').on('mousedown mousemove mouseup mouseleave', '.SLPicker,.HPicker', function(e) {
    if (e.type == "mousedown") {
        canvasClicked = true;
    } else if (e.type == "mouseup" || e.type == "mouseleave") {
        canvasClicked = false;
    }
    if (canvasClicked) {
        var selector = $(this).next();
        selector.toggle(true);
        selector.offset({ top: e.pageY - 10, left: e.pageX - 10 })
        if ($(this).attr("class") == "SLPicker") {
            $(NodeManager.CurrentNode).find('.Preview').css(
                'background-color',
                'hsl('
                + $('.Node #H > input').val() + ','
                + (100 - (e.pageX - $(this).offset().left) * (100 / 256)) +'%,'
                + (100 - (e.pageY - $(this).offset().top) * (100 / 256)) +'%)'
            );
            $('.Node #S > input').val(
                ("00" + Math.round(100 - (e.pageX - $(this).offset().left) * (100 / 256))).slice(-3)
            );
            $('.Node #L > input').val(
                ("00" + Math.round(100 - (e.pageY - $(this).offset().top) * (100 / 256))).slice(-3)
            );
        } else if ($(this).attr("class") == "HPicker") {
            $(NodeManager.CurrentNode).find('.Preview').css(
                'background-color',
                'hsl('
                + (e.pageY - $(this).offset().top) * (360 / 256) + ','
                + $(NodeManager.CurrentNode).find('#S > input').val() +'%,'
                + $(NodeManager.CurrentNode).find('#L > input').val() +'%)'
            );
            $(NodeManager.CurrentNode).find('#H > input').val(
                ("00" + Math.round((e.pageY - $(this).offset().top) * (360 / 256))).slice(-3)
            );
            drawSVPicker($(NodeManager.CurrentNode).find('.SLPicker')[0], (e.pageY - $(this).offset().top) * (360 / 256));
        }
        updateRGB();
    }
});

//---------------
// Input Events
//---------------
$(document.body).on('input', '.Color input', function(e) {
    // alert($(this).parent().attr("id"));
    switch($(this).parent().attr("id")) {
        case "H":
            $(NodeManager.CurrentNode).find('.Preview').css(
                'background-color',
                'hsl('
                + $(NodeManager.CurrentNode).find('#H > input').val() +','
                + $(NodeManager.CurrentNode).find('#S > input').val() +'%,'
                + $(NodeManager.CurrentNode).find('#L > input').val() +'%)'
            );
            $(NodeManager.CurrentNode).find('.HPicker').next().offset({
                top: $(NodeManager.CurrentNode).find('.HPicker').offset().top + (parseInt($(NodeManager.CurrentNode).find('#H > input').val()) * 256 / 360) - 9,
                left: 7 + $(NodeManager.CurrentNode).find('.HPicker').offset().left
            });
            drawSVPicker($(NodeManager.CurrentNode).find('.SLPicker')[0],  parseFloat($(NodeManager.CurrentNode).find('#H > input').val()));
            updateRGB();
            break;
        case "S":
        case "L":
            $(NodeManager.CurrentNode).find('.Preview').css(
                'background-color',
                'hsl('
                + $(NodeManager.CurrentNode).find('#H > input').val() +','
                + $(NodeManager.CurrentNode).find('#S > input').val() +'%,'
                + $(NodeManager.CurrentNode).find('#L > input').val() +'%)'
            );
            $(NodeManager.CurrentNode).find('.SLPicker').next().offset({
                top: $(NodeManager.CurrentNode).find('.SLPicker').offset().top + (256 - parseInt($(NodeManager.CurrentNode).find('#L > input').val()) * 256 / 100) - 9,
                left: $(NodeManager.CurrentNode).find('.SLPicker').offset().left + (256 - parseInt($(NodeManager.CurrentNode).find('#S > input').val()) * 256 / 100) - 9
            });
            updateRGB();
            break;
        case "R":
        case "G":
        case "B":
            $(NodeManager.CurrentNode).find('.Preview').css(
                'background-color',
                'rgb('
                + $(NodeManager.CurrentNode).find('#R > input').val() +','
                + $(NodeManager.CurrentNode).find('#G > input').val() +','
                + $(NodeManager.CurrentNode).find('#B > input').val() +')'
            );
            updateHSL();
            break;
    }
    if ($(this).attr("class") == "color_input") {
        var hex = /([a-f\d]{1,2})($|[a-f\d]{1,2})($|[a-f\d]{1,2})$/i.exec($(this).val());
        $(NodeManager.CurrentNode).find('.Preview').css(
            'background-color',
            'rgb('
            + (parseInt(hex[1], 16) || 0) +','
            + (parseInt(hex[2], 16) || 0) +','
            + (parseInt(hex[3], 16) || 0) +')'
        );
        $(NodeManager.CurrentNode).find(' #R > input').val(
            ("00" + (parseInt(hex[1], 16) || 0)).slice(-3)
        );
        $(NodeManager.CurrentNode).find(' #G > input').val(
            ("00" + (parseInt(hex[2], 16) || 0)).slice(-3)
        );
        $(NodeManager.CurrentNode).find(' #B > input').val(
            ("00" + (parseInt(hex[3], 16) || 0)).slice(-3)
        );
        updateHSL();
    }
});

function updateHSL() {
    var R = parseFloat($(NodeManager.CurrentNode).find(' #R > input').val()) /255;
    var G = parseFloat($(NodeManager.CurrentNode).find(' #G > input').val()) /255;
    var B = parseFloat($(NodeManager.CurrentNode).find(' #B > input').val()) /255;
    var H, S, L;
    var max = Math.max(R, G, B);
    var min = Math.min(R, G, B);
    L = (min + max) / 2.0;
    if (min == max) {
        S = 0;
        H = 0;
    } else {
        if ( L < 0.5 ) S = (max-min)/(max+min);
        else S = (max - min) / (2.0 - max - min);

        if (max == R) H = (G-B)/(max-min);
        if (max == G) H = 2.0 + (B-R)/(max-min);
        if (max == B) H = 4.0 + (R-G)/(max-min);
        H *= 60;
    }
    if (H < 0) H+=360;
    $(NodeManager.CurrentNode).find(' #L > input').val(
        ("00" + Math.round(L * 100)).slice(-3)
    );
    $(NodeManager.CurrentNode).find(' #H > input').val(
        ("00" + Math.round(H)).slice(-3)
    );
    $(NodeManager.CurrentNode).find(' #S > input').val(
        ("00" + Math.round(S * 100)).slice(-3)
    );
    $(NodeManager.CurrentNode).find('.HPicker').next().offset({
        top: $(NodeManager.CurrentNode).find('.HPicker').offset().top + (H * 256 / 360) - 9,
        left: 7 + $(NodeManager.CurrentNode).find('.HPicker').offset().left
    });
    $(NodeManager.CurrentNode).find('.SLPicker').next().offset({
        top: $(NodeManager.CurrentNode).find('.SLPicker').offset().top + (256 - L * 256) - 9,
        left: $(NodeManager.CurrentNode).find('.SLPicker').offset().left + (256 - S * 256) - 9
    });
    drawSVPicker($(NodeManager.CurrentNode).find('.SLPicker')[0],  H);
}

function updateRGB() {
    function componentToHex(c) {
        var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
    }
    var H = parseFloat($(NodeManager.CurrentNode).find('#H > input').val());
    var S = parseFloat($(NodeManager.CurrentNode).find('#S > input').val());
    var L = parseFloat($(NodeManager.CurrentNode).find('#L > input').val());
    var R, G, B;
    L /= 100;
    S /= 100;
    if (S == 0) {
        R = L;
        G = L;
        B = L;
    } else {
        var temp1, temp2;
        function Hue2RGB(H) {
            if ( H < 0 ) H += 1;
            if ( H > 1 ) H -= 1;
            if ( H < 1 / 6) return temp2 + (temp1 - temp2) * 6 * H;
            if ( H < 1 / 2 ) return temp1;
            if ( H < 2 / 3 ) return temp2 + (temp1 - temp2) * ( (2 / 3) - H) * 6;
            return temp2;
        }
        temp1 = L < 0.5 ? L * (1 + S) : L + S - L * S;
        temp2 = 2 * L - temp1;
        H = H / 360.0;
        R = Hue2RGB(H + 1/3);
        G = Hue2RGB(H);
        B = Hue2RGB(H - 1/3);
    }
    $(NodeManager.CurrentNode).find('#R > input').val(
        ("00" + Math.round(R * 255)).slice(-3)
    );
    $(NodeManager.CurrentNode).find('#G > input').val(
        ("00" + Math.round(G * 255)).slice(-3)
    );
    $(NodeManager.CurrentNode).find('#B > input').val(
        ("00" + Math.round(B * 255)).slice(-3)
    );
    $(NodeManager.CurrentNode).find('.color_input').val(
        (((1 << 24) + (R * 255 << 16) + (G * 255 << 8) + B * 255).toString(16).slice(1,7).toUpperCase())
    );
}

function drawSVPicker(canvas, hue) {
    var ctx = canvas.getContext('2d');
    for(row=0; row<100; row++){
        var grad = ctx.createLinearGradient(0, 0, 100,0);
        grad.addColorStop(0, 'hsl('+hue+', 100%, '+(100-row)+'%)');
        grad.addColorStop(1, 'hsl('+hue+', 0%, '+(100-row)+'%)');
        ctx.fillStyle=grad;
        ctx.fillRect(0, row, 100, 1);
    }
}

function drawHPicker(canvas) {
    var ctx = canvas.getContext('2d');
    for (hue=0; hue<360; hue++) {
        ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
        ctx.fillRect(0,hue,100,1);
    }
}