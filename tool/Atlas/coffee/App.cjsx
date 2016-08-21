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
        Node: "components/Node"
        TestNode: "NodeTypes/TestNode"
        Editor: "containers/Editor"
        Reducer: "reducers/Reducer"
        Actions: "Actions"
        Menu: "components/Menu"
        MenuItem: "components/MenuItem"
        Background: "containers/Background"
        Nodes: "containers/Nodes"

        Connectors: "containers/Connectors"
        TempConnector: "components/TempConnector"
        Connector: "components/Connector"
        Input: "components/Input"
        Output: "components/Output"
        Field: "components/Field"


require ['Reducer', 'Editor', 'react', 'ReactDOM', 'reactredux'], (Reducer, Editor, React, ReactDOM, A) =>
    createStore = require('redux').createStore
    Provider = require('reactredux').Provider
    store = createStore(Reducer, window.devToolsExtension && window.devToolsExtension())
    ReactDOM.render(
        <Provider store={store}>
            <Editor />
        </Provider>,
        document.getElementById("container")
    )
