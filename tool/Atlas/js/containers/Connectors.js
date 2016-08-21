// Generated by CoffeeScript 1.10.0
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(["react", "TempConnector", "Connector"], function(React, TempConnector, Connector) {
    var Connectors, connect, mapStateToProps;
    connect = require('reactredux').connect;
    Connectors = (function(superClass) {
      extend(Connectors, superClass);

      function Connectors(props) {
        Connectors.__super__.constructor.call(this, props);
      }

      Connectors.prototype.render = function() {
        var temp;
        temp = null;
        if (this.props.Connecting) {
          temp = React.createElement(TempConnector, {
            "Selected": this.props.Selected
          });
        }
        return React.createElement("svg", {
          "className": "Connectors",
          "height": "100%",
          "width": "100%"
        }, temp, this.props.Connections.map((function(_this) {
          return function(Con) {
            return React.createElement(Connector, {
              "key": Con.id,
              "Connection": Con
            });
          };
        })(this)));
      };

      return Connectors;

    })(React.Component);
    mapStateToProps = (function(_this) {
      return function(state) {
        return {
          Selected: state.Selected,
          Connecting: state.Connecting,
          Connections: state.Connections
        };
      };
    })(this);
    return connect(mapStateToProps)(Connectors);
  });

}).call(this);

//# sourceMappingURL=Connectors.map
