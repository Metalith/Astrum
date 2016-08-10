# ###############################
# ### Require.js config
# ###############################
require.config

    # 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.7.2.min")
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
