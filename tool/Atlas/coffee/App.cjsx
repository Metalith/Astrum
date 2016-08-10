# ###############################
# ### Require.js config
# ###############################
require.config
    paths:
        # Core Libraries
        react: "lib/react-with-addons"
        ReactDOM: "lib/react-dom"
        redux: "lib/redux"
        reactredux: "lib/react-redux"
        three: "lib/three.min"
        #
        UI: "UI"
        Node: "NodeTypes/Node"
        TestNode: "NodeTypes/TestNode"
        Editor: "containers/Editor"
        Reducer: "reducers/Reducer"
        Actions: "Actions"
        Menu: "components/Menu"
        MenuItem: "components/MenuItem"
        Background: "containers/Background"
        Nodes: "containers/Nodes"

require ['redux', 'Reducer', 'Editor', 'react', 'ReactDOM', 'reactredux'], (T, Reducer, Editor, React, ReactDOM, A) =>
    createStore = require('redux').createStore
    Provider = require('reactredux').Provider
    store = createStore(Reducer, window.devToolsExtension && window.devToolsExtension())
    ReactDOM.render(
        <Provider store={store}>
            <Editor />
        </Provider>,
        document.getElementById("container")
    )
