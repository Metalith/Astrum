// Generated by CoffeeScript 1.10.0
(function() {
  define('Actions', [''], function() {
    var addNode;
    addNode = function(nodeType, pos) {
      return {
        type: 'ADD_NODE',
        nodeType: nodeType,
        pos: pos
      };
    };
    return {
      addNode: addNode
    };
  });

}).call(this);

//# sourceMappingURL=Actions.map
