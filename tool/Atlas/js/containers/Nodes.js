// Generated by CoffeeScript 1.10.0
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(["react", "reactredux", "Actions", "Node", 'MenuItem'], function(React, t, Actions, Node, MenuItem) {
    var Nodes, connect, mapStateToProps;
    connect = require('reactredux').connect;
    Nodes = (function(superClass) {
      extend(Nodes, superClass);

      function Nodes(props) {
        Nodes.__super__.constructor.call(this, props);
      }

      Nodes.prototype.render = function() {
        var i;
        i = 0;
        return React.createElement("div", null, this.props.nodes.map((function(_this) {
          return function(node) {
            var GenNode;
            GenNode = connect()(Node[node.nodeType]);
            return React.createElement(GenNode, {
              "key": node.id,
              "pos": node.initPos,
              "id": node.id
            });
          };
        })(this)));
      };

      return Nodes;

    })(React.Component);
    mapStateToProps = (function(_this) {
      return function(state) {
        return {
          nodes: state.Nodes
        };
      };
    })(this);
    return Nodes = connect(mapStateToProps)(Nodes);
  });

}).call(this);

//# sourceMappingURL=Nodes.map
