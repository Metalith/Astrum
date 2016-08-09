// Generated by CoffeeScript 1.10.0
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(["jquery", "react", "Menu"], function($, React, Menu) {
  var Editor;
  return Editor = (function(superClass) {
    extend(Editor, superClass);

    function Editor(props) {
      this.hideContextMenu = bind(this.hideContextMenu, this);
      Editor.__super__.constructor.call(this, props);
      this.state = {
        showContextMenu: false,
        menuPos: [-999, -999]
      };
    }

    Editor.prototype.hideContextMenu = function() {
      return this.setState({
        showContextMenu: false
      });
    };

    Editor.prototype.render = function() {
      return React.createElement("div", {
        "id": "Editor",
        "onContextMenu": ((function(_this) {
          return function(e) {
            _this.setState({
              showContextMenu: true,
              menuPos: [e.pageX - 5, e.pageY - 5]
            });
            return e.preventDefault();
          };
        })(this))
      }, React.createElement(Menu, {
        "hide": this.hideContextMenu,
        "show": this.state.showContextMenu,
        "pos": this.state.menuPos
      }));
    };

    return Editor;

  })(React.Component);
});

//# sourceMappingURL=Editor.map
