$.contextMenu({
    selector: '#Editor',
    className: 'contextmenu-custom data-title',
    items: {
        "sep1": "",
        color: {
            name: "Color",
            className: 'contextmenu-item-custom',
            callback: function(key, opt){
                Nodes.create({
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
                Nodes.create({
                    name: "Output",
                    field: "",
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

var nodeArray = [];
/*------------------
 * Node Creation
 * Variables:
 *  nodeType - Object containing node information
 *  x        - position X
 *  y        - position Y
 *------------------*/
var Nodes = {
    nodeArray: [],
    CurrentNode: "",
    create: function(nodeType, x, y) {
        var id = Nodes.nodeArray.length;
        nodeType.id = id;
        Nodes.nodeArray[id] = nodeType;
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
        Nodes.CurrentNode = null;
    },
    connect: function(connection) {
        alert("this");
    }
};

$('body').on("mouseover", '.Node', function() {
    Nodes.CurrentNode = this;
});

Nodes.create({
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
    0,
    0
);

Nodes.create({
    name: "Output",
    field: "",
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
    $(Nodes.CurrentNode).find(".ColorPickerBox").toggle(true);
});

$('body').on('mouseleave', '.Color', function() {
    $(Nodes.CurrentNode).find(".ColorPickerBox").toggle(false);
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
            $(Nodes.CurrentNode).find('.Preview').css(
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
            $(Nodes.CurrentNode).find('.Preview').css(
                'background-color',
                'hsl('
                + (e.pageY - $(this).offset().top) * (360 / 256) + ','
                + $(Nodes.CurrentNode).find('#S > input').val() +'%,'
                + $(Nodes.CurrentNode).find('#L > input').val() +'%)'
            );
            $(Nodes.CurrentNode).find('#H > input').val(
                ("00" + Math.round((e.pageY - $(this).offset().top) * (360 / 256))).slice(-3)
            );
            drawSVPicker($(Nodes.CurrentNode).find('.SLPicker')[0], (e.pageY - $(this).offset().top) * (360 / 256));
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
            $(Nodes.CurrentNode).find('.Preview').css(
                'background-color',
                'hsl('
                + $(Nodes.CurrentNode).find('#H > input').val() +','
                + $(Nodes.CurrentNode).find('#S > input').val() +'%,'
                + $(Nodes.CurrentNode).find('#L > input').val() +'%)'
            );
            $(Nodes.CurrentNode).find('.HPicker').next().offset({
                top: $(Nodes.CurrentNode).find('.HPicker').offset().top + (parseInt($(Nodes.CurrentNode).find('#H > input').val()) * 256 / 360) - 9,
                left: 7 + $(Nodes.CurrentNode).find('.HPicker').offset().left
            });
            drawSVPicker($(Nodes.CurrentNode).find('.SLPicker')[0],  parseFloat($(Nodes.CurrentNode).find('#H > input').val()));
            updateRGB();
            break;
        case "S":
        case "L":
            $(Nodes.CurrentNode).find('.Preview').css(
                'background-color',
                'hsl('
                + $(Nodes.CurrentNode).find('#H > input').val() +','
                + $(Nodes.CurrentNode).find('#S > input').val() +'%,'
                + $(Nodes.CurrentNode).find('#L > input').val() +'%)'
            );
            $(Nodes.CurrentNode).find('.SLPicker').next().offset({
                top: $(Nodes.CurrentNode).find('.SLPicker').offset().top + (256 - parseInt($(Nodes.CurrentNode).find('#L > input').val()) * 256 / 100) - 9,
                left: $(Nodes.CurrentNode).find('.SLPicker').offset().left + (256 - parseInt($(Nodes.CurrentNode).find('#S > input').val()) * 256 / 100) - 9
            });
            updateRGB();
            break;
        case "R":
        case "G":
        case "B":
            $(Nodes.CurrentNode).find('.Preview').css(
                'background-color',
                'rgb('
                + $(Nodes.CurrentNode).find('#R > input').val() +','
                + $(Nodes.CurrentNode).find('#G > input').val() +','
                + $(Nodes.CurrentNode).find('#B > input').val() +')'
            );
            updateHSL();
            break;
    }
    if ($(this).attr("class") == "color_input") {
        var hex = /([a-f\d]{1,2})($|[a-f\d]{1,2})($|[a-f\d]{1,2})$/i.exec($(this).val());
        $(Nodes.CurrentNode).find('.Preview').css(
            'background-color',
            'rgb('
            + (parseInt(hex[1], 16) || 0) +','
            + (parseInt(hex[2], 16) || 0) +','
            + (parseInt(hex[3], 16) || 0) +')'
        );
        $(Nodes.CurrentNode).find(' #R > input').val(
            ("00" + (parseInt(hex[1], 16) || 0)).slice(-3)
        );
        $(Nodes.CurrentNode).find(' #G > input').val(
            ("00" + (parseInt(hex[2], 16) || 0)).slice(-3)
        );
        $(Nodes.CurrentNode).find(' #B > input').val(
            ("00" + (parseInt(hex[3], 16) || 0)).slice(-3)
        );
        updateHSL();
    }
});

function updateHSL() {
    var R = parseFloat($(Nodes.CurrentNode).find(' #R > input').val()) /255;
    var G = parseFloat($(Nodes.CurrentNode).find(' #G > input').val()) /255;
    var B = parseFloat($(Nodes.CurrentNode).find(' #B > input').val()) /255;
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
    $(Nodes.CurrentNode).find(' #L > input').val(
        ("00" + Math.round(L * 100)).slice(-3)
    );
    $(Nodes.CurrentNode).find(' #H > input').val(
        ("00" + Math.round(H)).slice(-3)
    );
    $(Nodes.CurrentNode).find(' #S > input').val(
        ("00" + Math.round(S * 100)).slice(-3)
    );
    $(Nodes.CurrentNode).find('.HPicker').next().offset({
        top: $(Nodes.CurrentNode).find('.HPicker').offset().top + (H * 256 / 360) - 9,
        left: 7 + $(Nodes.CurrentNode).find('.HPicker').offset().left
    });
    $(Nodes.CurrentNode).find('.SLPicker').next().offset({
        top: $(Nodes.CurrentNode).find('.SLPicker').offset().top + (256 - L * 256) - 9,
        left: $(Nodes.CurrentNode).find('.SLPicker').offset().left + (256 - S * 256) - 9
    });
    drawSVPicker($(Nodes.CurrentNode).find('.SLPicker')[0],  H);
}

function updateRGB() {
    function componentToHex(c) {
        var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
    }
    var H = parseFloat($(Nodes.CurrentNode).find('#H > input').val());
    var S = parseFloat($(Nodes.CurrentNode).find('#S > input').val());
    var L = parseFloat($(Nodes.CurrentNode).find('#L > input').val());
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
    $(Nodes.CurrentNode).find('#R > input').val(
        ("00" + Math.round(R * 255)).slice(-3)
    );
    $(Nodes.CurrentNode).find('#G > input').val(
        ("00" + Math.round(G * 255)).slice(-3)
    );
    $(Nodes.CurrentNode).find('#B > input').val(
        ("00" + Math.round(B * 255)).slice(-3)
    );
    $(Nodes.CurrentNode).find('#color_text').val(
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
