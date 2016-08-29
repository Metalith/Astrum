# ###############################
# ### Require.js config
# ###############################
# require.config
#     paths:
#         # Core Libraries
#         react: "lib/react-with-addons"
#         ReactDOM: "lib/react-dom"
#         redux: "lib/redux"
#         reactredux: "lib/react-redux"
#         three: "lib/three.min"
#         jquery: "lib/jquery-3.1.0.min"
#         'kute.js': "lib/kute.js"
#         'kute-svg.js': "lib/kute-svg.js"
#
#         #
#         UI: "UI"
#         Node: "components/Node"
#         TestNode: "NodeTypes/TestNode"
#         Editor: "containers/Editor"
#         Reducer: "reducers/Reducer"
#         Actions: "Actions"
#         Menu: "components/Menu"
#         MenuItem: "components/MenuItem"
#         Background: "containers/Background"
#         Nodes: "containers/Nodes"
#
#         Connectors: "containers/Connectors"
#         TempConnector: "components/TempConnector"
#         Connector: "components/Connector"
#         Input: "components/Input"
#         Output: "components/Output"
#         Field: "components/Field"
#
# define ['kute.js', 'kute.js/kute-svg.js'], (KUTE) ->
#     KUTE.to()
`import React from 'react'`
# require ['Reducer', 'Editor', 'react', 'ReactDOM', 'reactredux', 'kute', 'kute.js/kute-svg'], (Reducer, Editor, React, ReactDOM) =>
#     createStore = require('redux').createStore
#     Provider = require('reactredux').Provider
#     store = createStore(Reducer, window.devToolsExtension && window.devToolsExtension())
#     ReactDOM.render(
#         <Provider store={store}>
#             <Editor />
#         </Provider>,
#         document.getElementById("container")
#     )
