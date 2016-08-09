// Generated by CoffeeScript 1.10.0
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(["react", "reactredux", "Actions", "Node", 'MenuItem'], function(React, t, Actions, Node, MenuItem) {
  var Menu, connect;
  connect = require('reactredux').connect;
  Menu = (function(superClass) {
    extend(Menu, superClass);

    function Menu(props) {
      Menu.__super__.constructor.call(this, props);
    }

    Menu.prototype.render = function() {
      var NodeTypes, i, show;
      i = 0;
      NodeTypes = Object.keys(Node);
      show = this.props.show ? "show" : 'hide';
      return React.createElement("div", {
        "className": 'context-menu ' + show,
        "onMouseLeave": this.props.hide,
        "style": {
          left: this.props.pos[0],
          top: this.props.pos[1]
        }
      }, "  Create Node", NodeTypes.map((function(_this) {
        return function(type) {
          return React.createElement(MenuItem, {
            "key": i++,
            "name": type,
            "hide": _this.props.hide
          });
        };
      })(this)), " ");
    };

    return Menu;

  })(React.Component);
  return Menu;
});

//# sourceMappingURL=Menu.map
