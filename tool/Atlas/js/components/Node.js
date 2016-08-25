// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(["react", "Actions", "Input", "Output"], function(React, Actions, Input, Output) {
    var MathNode, Node, OutputNode, TestNode, ValueNode, connect;
    connect = require('reactredux').connect;
    Node = (function(superClass) {
      extend(Node, superClass);

      Node.prototype.el = '';

      function Node(props) {
        this.onMouseUp = bind(this.onMouseUp, this);
        this.onDrag = bind(this.onDrag, this);
        this.onMouseDown = bind(this.onMouseDown, this);
        this.componentWillUpdate = bind(this.componentWillUpdate, this);
        Node.__super__.constructor.call(this, props);
        this.state = {
          dragging: false,
          pos: {
            x: this.props.pos.x,
            y: this.props.pos.y
          },
          rel: null
        };
      }

      Node.prototype.componentWillUpdate = function(props, state) {
        if (!this.state.dragging && state.dragging) {
          document.addEventListener('mousemove', this.onDrag);
          return document.addEventListener('mouseup', this.onMouseUp);
        } else if (this.state.dragging && !state.dragging) {
          document.removeEventListener('mousemove', this.onDrag);
          return document.removeEventListener('mouseup', this.onMouseUp);
        }
      };

      Node.prototype.onMouseDown = function(e) {
        if (e.target.tagName !== "INPUT" && !e.target.classList.contains("Field") && e.target.className !== "Handle") {
          this.setState({
            dragging: true,
            rel: {
              x: e.pageX - this.state.pos.x,
              y: e.pageY - this.state.pos.y
            }
          });
          this.props.dispatch(Actions.startDragging(this.props.id));
          return false;
        }
      };

      Node.prototype.onDrag = function(e) {
        return this.setState({
          pos: {
            x: e.pageX - this.state.rel.x,
            y: e.pageY - this.state.rel.y
          }
        });
      };

      Node.prototype.onMouseUp = function(e) {
        this.setState({
          dragging: false
        });
        return this.props.dispatch(Actions.setPos(this.props.id, this.state.pos));
      };

      Node.prototype.render = function() {
        return React.createElement("div", {
          "className": "Node",
          "id": "Node" + this.props.id,
          "style": {
            position: "absolute",
            left: this.state.pos.x,
            top: this.state.pos.y
          },
          "onMouseDown": this.onMouseDown
        }, React.createElement(Input, {
          "input": this.props.inputs,
          "node": this.props.id,
          "cons": this.props.cons
        }), React.createElement("div", {
          "className": "Center"
        }, React.createElement("div", {
          "className": "NodeName"
        }, this.name), React.createElement("div", {
          "className": "Values"
        }, this.center())), React.createElement(Output, {
          "output": this.props.outputs,
          "node": this.props.id
        }));
      };

      return Node;

    })(React.Component);
    TestNode = (function(superClass) {
      extend(TestNode, superClass);

      TestNode.prototype.name = 'Test Node';

      function TestNode(props) {
        TestNode.__super__.constructor.call(this, props);
      }

      TestNode.inputs = {
        TestInput: ''
      };

      TestNode.prototype.center = function() {
        return React.createElement("input", {
          "type": "number",
          "name": "fname",
          "onChange": this.update
        });
      };

      return TestNode;

    })(Node);
    ValueNode = (function(superClass) {
      extend(ValueNode, superClass);

      ValueNode.prototype.name = 'Value';

      function ValueNode(props) {
        this.center = bind(this.center, this);
        ValueNode.__super__.constructor.call(this, props);
      }

      ValueNode.prototype.center = function() {
        return React.createElement("input", {
          "type": "number",
          "onChange": ((function(_this) {
            return function(e) {
              return _this.props.dispatch(Actions.updateNode(_this.props.id, {
                Value: parseInt(e.target.value)
              }, {
                Value: parseInt(e.target.value)
              }, _this.props.cons));
            };
          })(this)),
          "value": this.props.inputs.Value
        });
      };

      ValueNode.input = {
        Value: 10
      };

      ValueNode.output = {
        Value: 10
      };

      return ValueNode;

    })(Node);
    OutputNode = (function(superClass) {
      extend(OutputNode, superClass);

      OutputNode.prototype.name = 'Output';

      function OutputNode(props) {
        OutputNode.__super__.constructor.call(this, props);
      }

      OutputNode.prototype.center = function() {
        return "";
      };

      OutputNode.input = {
        Program: ""
      };

      return OutputNode;

    })(Node);
    MathNode = (function(superClass) {
      extend(MathNode, superClass);

      MathNode.prototype.name = 'Math';

      function MathNode(props) {
        this.center = bind(this.center, this);
        MathNode.__super__.constructor.call(this, props);
      }

      MathNode.prototype.center = function() {
        return React.createElement("input", {
          "type": "number",
          "value": this.props.inputs.Value1 + this.props.inputs.Value2
        });
      };

      MathNode.input = {
        Value1: 0,
        Value2: 0
      };

      MathNode.output = {
        Result: 0
      };

      return MathNode;

    })(Node);
    return {
      TestNode: connect()(TestNode),
      Value: connect()(ValueNode),
      Output: connect()(OutputNode),
      MathNode: connect()(MathNode)
    };
  });

}).call(this);

//# sourceMappingURL=Node.map
