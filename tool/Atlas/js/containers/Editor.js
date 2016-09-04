import React from 'react'
import { connect } from 'react-redux';
import Actions from '../Actions';
import Menu from '../components/Menu'
import ViewToggle from '../components/ViewToggle'
import Nodes from './Nodes'
import Background from './Background'
import Connectors from './Connectors'
class Editor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showContextMenu: false,
            menuPos: [-999, -999],
            dragging: false,
            pos: {
                x: 0,
                y: 0
            },
            rel: {
                x: 0,
                y: 0
            }
        };
        this.hideContextMenu = this.hideContextMenu.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    };

    hideContextMenu() { this.setState({showContextMenu: false}) }

    componentWillUpdate(props, state) {
        if (!this.state.dragging && state.dragging) {
            document.addEventListener('mousemove', this.onDrag)
            document.addEventListener('mouseup', this.onMouseUp)
        }
        else if (this.state.dragging && !state.dragging) {
            document.removeEventListener('mousemove', this.onDrag)
            document.removeEventListener('mouseup', this.onMouseUp)
        }
    }

    onDrag(e) {
        this.setState({
            pos: {
                x: e.pageX - this.state.rel.x,
                y: e.pageY - this.state.rel.y
            }
        })
    }

    onMouseUp(e) {
        this.setState({dragging: false})
        this.props.dispatch(Actions.toggleDragEditor())
    }

    render() {
        return <div id="Editor"
            onContextMenu={(e) => e.preventDefault(e)}
            onMouseDown={(e) => {
                switch (e.button) {
                    case 1:
                        this.setState({
                            dragging: true,
                            rel: {
                                x: e.pageX - this.state.pos.x,
                                y: e.pageY - this.state.pos.y
                            }
                        });
                        this.props.dispatch(Actions.toggleDragEditor())
                        break;
                    case 2:
                        if (e.target.className == "background")
                            this.setState({showContextMenu: true, menuPos: [e.pageX - 5, e.pageY - 5]});
                        break;
                }}
            }>
            <Background />
            <Nodes globalOffset={this.state.pos}/>
            <Connectors />
            <ViewToggle />
            <Menu
                hide={this.hideContextMenu}
                show={this.state.showContextMenu}
                pos={this.state.menuPos}
                globalOffset={this.state.pos}
            />
        </div>
    }
}

export default connect()(Editor)
