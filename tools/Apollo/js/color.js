$( "#color_text" ).focus(function() {
    $(".ColorPickerBox").toggle(true);
}).hover(function() {
    $(".ColorPickerBox").toggle(true);
}).click(function() {
    $(".ColorPickerBox").toggle(true);
});

$(".Color").mouseleave(function() {
    $(".ColorPickerBox").toggle(false);
})

$('.SLPicker').mousedown(function(e) {
    var selector = $(this).next();
    selector.toggle(true);
    selector.offset({ top: e.pageY - 10, left: e.pageX - 10 })
    $('.Preview').css(
        'background-color',
        'hsl('
        + $('.Node #H > input').val() + ','
        + (100 - (e.pageX - $(this).offset().left) * (100 / 256)) +'%,'
        + (100 - (e.pageY - $(this).offset().top) * (100 / 256)) +'%)'
    );
    $('.Node #S > input').val(
        ("00" + Math.floor(100 - (e.pageX - $(this).offset().left) * (100 / 256))).slice(-3)
    );
    $('.Node #L > input').val(
        ("00" + Math.floor(100 - (e.pageY - $(this).offset().top) * (100 / 256))).slice(-3)
    );
    updateRGB();
    $(window).bind("mousemove", updateSL);
}).mouseup(function() {
    $(window).unbind("mousemove", updateSL);
});

$('.HPicker').mousedown(function(e) {
    var selector = $(this).next();
    selector.toggle(true);
    selector.offset({ top: e.pageY - 10, left: e.pageX - 10 })
    // alert((e.pageY - $(this).offset().top) * (360 / 256));
    $('.Preview').css(
        'background-color',
        'hsl('
        + (e.pageY - $(this).offset().top) * (360 / 256) + ','
        + $('.Node #S > input').val() +'%,'
        + $('.Node #L > input').val() +'%)'
    );
    $('.Node #H > input').val(
        ("00" + Math.floor((e.pageY - $(this).offset().top) * (360 / 256))).slice(-3)
    );
    drawSVPicker($('.SLPicker')[0], (e.pageY - $(this).offset().top) * (360 / 256));
    updateRGB();
    $(window).bind("mousemove", updateHue);
}).mouseup(function() {
    $(window).unbind("mousemove", updateHue);
});

function updateHue(e) {
    if (e.pageY - $('.HPicker').offset().top <= 256.0 &&
    e.pageY - $('.HPicker').offset().top >= 0 &&
    e.pageX - $('.HPicker').offset().left >= 0 &&
    e.pageX - $('.HPicker').offset().left <= 32) {
        selector = $('.HPicker').next();
        selector.offset({ top: e.pageY - 10, left: e.pageX - 10 });
        $('.Preview').css(
            'background-color',
            'hsl('
            + (e.pageY - $('.HPicker').offset().top) * (360 / 256) + ','
            + $('.Node #S > input').val() +'%,'
            + $('.Node #L > input').val() +'%)'
        );
        $('.Node #H > input').val(
            ("00" + Math.floor((e.pageY - $('.HPicker').offset().top) * (360 / 256))).slice(-3)
        );
        drawSVPicker($('.SLPicker')[0], (e.pageY - $('.HPicker').offset().top) * (360 / 256));
        updateRGB();
    } else {
        $(window).unbind("mousemove", updateHue);
    }
}

function updateSL(e) {
    if (e.pageY - $('.SLPicker').offset().top <= 256.0 &&
    e.pageY - $('.SLPicker').offset().top >= 0 &&
    e.pageX - $('.SLPicker').offset().left >= 0 &&
    e.pageX - $('.SLPicker').offset().left <= 256) {
        selector = $('.SLPicker').next();
        selector.offset({ top: e.pageY - 10, left: e.pageX - 10 })
        $('.Preview').css(
            'background-color',
            'hsl('
            + $('.Node #H > input').val() + ','
            + (100 - (e.pageX - $('.SLPicker').offset().left) * (100 / 256)) +'%,'
            + (100 - (e.pageY - $('.SLPicker').offset().top) * (100 / 256)) +'%)'
        );
        $('.Node #S > input').val(
            ("00" + Math.floor(100 - (e.pageX - $('.SLPicker').offset().left) * (100 / 256))).slice(-3)
        );
        $('.Node #L > input').val(
            ("00" + Math.floor(100 - (e.pageY -$('.SLPicker').offset().top) * (100 / 256))).slice(-3)
        );
        updateRGB();
    } else {
        $(window).unbind("mousemove", updateSL);
    }
}

function updateRGB() {
    var h = parseFloat($('.Node #H > input').val());
    var s = parseFloat($('.Node #S > input').val());
    var l = parseFloat($('.Node #L > input').val());

    h /= 360;
    s /= 100;
    l /=100;
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    $('.Node #R > input').val(
        ("00" + Math.floor(r * 255)).slice(-3)
    );
    $('.Node #G > input').val(
        ("00" + Math.floor(g * 255)).slice(-3)
    );
    $('.Node #B > input').val(
        ("00" + Math.floor(b * 255)).slice(-3)
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

drawSVPicker($('.SLPicker')[0], 0);
drawHPicker($('.HPicker')[0]);
