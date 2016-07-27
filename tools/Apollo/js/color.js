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

$('.SVPicker').click(function() {
  alert( "Handler for .click() called." );
})
