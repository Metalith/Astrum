// Generated by CoffeeScript 1.10.0
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(["react"], function(React) {
    var Node, TestNode;
    Node = (function(superClass) {
      extend(Node, superClass);

      Node.prototype.el = '';

      function Node(props) {
        Node.__super__.constructor.call(this, props);
      }

      Node.prototype.render = function() {
        var Center, Input, Output, Title, k, v;
        Title = React.createElement("div", {
          "className": "NodeName"
        }, this.name);
        Input = React.createElement("div", {
          "className": "Input"
        }, (function() {
          var ref, results;
          ref = this.input;
          results = [];
          for (k in ref) {
            v = ref[k];
            results.push(React.createElement("div", {
              "className": "Field"
            }, k, React.createElement("div", {
              "className": "Handle"
            })));
          }
          return results;
        }).call(this));
        Center = React.createElement("div", {
          "className": "Center"
        }, this.center);
        Output = React.createElement("div", {
          "className": "Output"
        }, (function() {
          var ref, results;
          ref = this.output;
          results = [];
          for (k in ref) {
            v = ref[k];
            results.push(React.createElement("div", {
              "className": "Field"
            }, k, React.createElement("div", {
              "className": "Handle"
            })));
          }
          return results;
        }).call(this));
        return React.createElement("div", {
          "className": "Node",
          "style": {
            position: "absolute",
            left: this.props.pos[0],
            top: this.props.pos[1]
          }
        }, Title, Input, Center, Output);
      };

      return Node;

    })(React.Component);
    TestNode = (function(superClass) {
      extend(TestNode, superClass);

      TestNode.prototype.name = 'Test Node';

      function TestNode(props) {
        TestNode.__super__.constructor.call(this, props);
      }

      TestNode.prototype.input = {
        TestInput: "Test"
      };

      TestNode.prototype.center = "Test Center";

      TestNode.prototype.output = {
        TestOutput: "Test"
      };

      return TestNode;

    })(Node);
    return {
      Node: Node,
      TestNode: TestNode
    };
  });

}).call(this);

//# sourceMappingURL=Node.map
