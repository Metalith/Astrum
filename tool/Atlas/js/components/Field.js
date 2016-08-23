// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(["react", "Actions"], function(React, Actions) {
    var Field, connect, mapStateToProps;
    connect = require('reactredux').connect;
    Field = (function(superClass) {
      extend(Field, superClass);

      function Field(props) {
        this.endConnection = bind(this.endConnection, this);
        this.startConnection = bind(this.startConnection, this);
        Field.__super__.constructor.call(this, props);
      }

      Field.prototype.startConnection = function(e) {
        console.log(this.props.node);
        this.props.dispatch(Actions.startConnecting(this.props.node, this.props.field, e.target.parentElement.className));
        return document.addEventListener('mouseup', this.endConnection);
      };

      Field.prototype.endConnection = function(e) {
        var Selected;
        this.props.dispatch(Actions.stopConnecting());
        if (e.target.classList.contains("Field")) {
          if (e.target.parentElement.className !== this.props.Selected.Type) {
            if (e.target.parentElement.parentElement.id !== "Node" + this.props.Selected.Node) {
              Selected = {
                Node: this.props.Selected.Node,
                Field: this.props.Selected.Field
              };
              if (this.props.Selected.Type === "Input") {
                this.props.dispatch(Actions.addConnection(Selected, {
                  Node: parseInt(e.target.parentElement.parentElement.id.replace(/^\D+/g, '')),
                  Field: e.target.textContent
                }));
              } else {
                this.props.dispatch(Actions.addConnection({
                  Node: parseInt(e.target.parentElement.parentElement.id.replace(/^\D+/g, '')),
                  Field: e.target.textContent
                }, Selected));
              }
            } else {
              alert("Error: Cannot connect a node to itself");
            }
          } else {
            alert("Error: Fields of same type");
          }
        }
        return document.removeEventListener('mouseup', this.endConnection);
      };

      Field.prototype.render = function() {
        return React.createElement("div", {
          "className": "Field",
          "id": this.props.field,
          "ref": ((function(_this) {
            return function(c) {
              return _this.el = c;
            };
          })(this)),
          "onMouseDown": this.startConnection,
          "onMouseEnter": ((function(_this) {
            return function() {
              return _this.el.classList.add('hov');
            };
          })(this)),
          "onMouseLeave": ((function(_this) {
            return function() {
              return _this.el.classList.remove('hov');
            };
          })(this))
        }, this.props.field, React.createElement("div", {
          "className": "Handle"
        }));
      };

      return Field;

    })(React.Component);
    mapStateToProps = function(state) {
      return {
        Selected: state.Selected
      };
    };
    return connect(mapStateToProps)(Field);
  });

}).call(this);

//# sourceMappingURL=Field.map
