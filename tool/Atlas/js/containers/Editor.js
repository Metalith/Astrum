import React from 'react'
import Menu from '../components/Menu'
import Nodes from './Nodes'
import Background from './Background'
import Connectors from './Connectors'
class Editor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showContextMenu: false,
            menuPos: [-999, -999]
        };
        this.hideContextMenu = this.hideContextMenu.bind(this);
    };

    hideContextMenu() { this.setState({showContextMenu: false}) }

    render() {
        return <div id="Editor"
            onContextMenu={(e) => {
                if (e.target.className == "background")
                    this.setState({showContextMenu: true, menuPos: [e.pageX - 5, e.pageY - 5]});
                e.preventDefault()
                }}>
            <Background />
            <Nodes />
            <Connectors />
            <Menu
                hide={this.hideContextMenu}
                show={this.state.showContextMenu}
                pos={this.state.menuPos}
            />
        </div>
    }
}

export default Editor
