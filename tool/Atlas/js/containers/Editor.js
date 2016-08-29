import React from 'react'
import Menu from '../components/Menu'

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
                this.setState({showContextMenu: true, menuPos: [e.pageX - 5, e.pageY - 5]});
                e.preventDefault()}}>
            <Menu
                hide={this.hideContextMenu}
                show={this.state.showContextMenu}
                pos={this.state.menuPos}
            />
        </div>
    }
}

export default Editor
