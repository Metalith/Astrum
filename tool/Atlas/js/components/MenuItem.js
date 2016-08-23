// Generated by CoffeeScript 1.10.0
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(["react", 'Actions', "reactredux"], function(React, Actions) {
    var MenuItem, connect;
    connect = require('reactredux').connect;
    MenuItem = (function(superClass) {
      extend(MenuItem, superClass);

      function MenuItem(props) {
        MenuItem.__super__.constructor.call(this, props);
      }

      MenuItem.prototype.render = function() {
        return React.createElement("div", {
          "className": "context-menu-item",
          "onClick": ((function(_this) {
            return function(e) {
              return _this.props.dispatch(Actions.addNode(_this.props.name, {
                x: e.pageX,
                y: e.pageY
              }, _this.props.defaultInput), _this.props.hide());
            };
          })(this))
        }, "                  ", this.props.name);
      };

      return MenuItem;

    })(React.Component);
    return MenuItem = connect()(MenuItem);
  });

}).call(this);

//# sourceMappingURL=MenuItem.map
