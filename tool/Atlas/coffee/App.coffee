# ###############################
# ### Require.js config
# ###############################
require.config

    # 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.7.2.min")
    paths:
        # Core Libraries
        jquery: "lib/jquery-3.1.0.min"
        react: "lib/react"
        ReactDOM: "lib/react-dom"
        three: "lib/three.min"
        #
        UI: "UI"
        Node: "NodeTypes/Node"
        TestNode: "NodeTypes/TestNode"
#
# ###############################
# ### Instantiate your app
# ###############################
# define (require) ->
#     Node = require 'Node'
#     # # Basic stuff required everywhere
#     # $                   = require 'jquery'
#     # _                   = require 'lodash'
#     # Backbone            = require 'backbone'
#     # backbone_extensions = require 'backbone_extensions'
#     # async               = require 'async'
#     # async_extensions    = require 'async_extensions'
#     #
#     # # controllers
#     # GenericController   = require 'controllers/generic'
#     ->
#         testNode = new Node(300, 300)

require ['Node', 'UI', 'react', 'ReactDOM'], (Node, UI, React, ReactDOM) ->
    root = React.createElement(Node, {name: "test"});
    ReactDOM.render(root, document.getElementById('Editor'));
