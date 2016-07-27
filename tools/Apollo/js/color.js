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

$('.SVPicker').click(function(e) {
})

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

drawSVPicker($('.SVPicker')[0], 0);
drawHPicker($('.HPicker')[0]);
