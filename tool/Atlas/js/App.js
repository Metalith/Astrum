import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import Reducer from './reducers/Reducer'
import Editor from './containers/Editor'
let store = createStore(Reducer, window.devToolsExtension && window.devToolsExtension())

ReactDOM.render(
    <Provider store={store}>
        <Editor />
    </Provider>,
    document.getElementById("container")
);
