$('.Node').draggable({containment: "window", cancel: ".Handle, .Center, .Field" });
$.contextMenu({
    selector: '.context-menu-one',
    items: {
        copy: {
            name: "Copy",
            callback: function(key, opt){
                alert("Clicked on " + key);
            }
        }
    }
});
