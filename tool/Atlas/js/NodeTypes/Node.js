// Generated by CoffeeScript 1.10.0
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

define(["jquery", "react"], function($, React) {
  var Node, TestNode;
  Node = (function(superClass) {
    extend(Node, superClass);

    Node.name = "blue";

    function Node(props) {
      Node.__super__.constructor.call(this, props);
      this.state = {
        test: 123
      };
    }

    Node.defaultProps = function() {
      return {
        bar: 'baz'
      };
    };

    Node.prototype.render = function() {
      return React.createElement("div", {
        "className": "Node"
      });
    };

    return Node;

  })(React.Component);
  TestNode = (function(superClass) {
    extend(TestNode, superClass);

    TestNode.name = 'Test Node';

    function TestNode(x, y) {
      TestNode.__super__.constructor.call(this, x, y);
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

//# sourceMappingURL=Node.map
