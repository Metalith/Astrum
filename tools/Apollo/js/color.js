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
    } else {
        $(window).unbind("mousemove", updateSL);
    }
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
