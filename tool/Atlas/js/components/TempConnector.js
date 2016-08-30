import React from 'react'

class TempConnector extends React.Component {
    constructor(props) {
        super(props)
        let Field = document.querySelector('#Node'+this.props.Selected.Node+'>.'+this.props.Selected.Type+'>#'+this.props.Selected.Field)
        Field.classList.add('sel')
        let Handle = Field.querySelector('.Handle')
        let HandleRect = Handle.getBoundingClientRect()
        this.HandlePos = {
            x: HandleRect.left + HandleRect.width / 2,
            y: HandleRect.top + HandleRect.height / 2
        }
        this.state = { MousePos: this.HandlePos }
        this.onMove = this.onMove.bind(this);
    }
    componentWillMount() {
        document.addEventListener('mousemove', this.onMove)
    }
    componentWillUnmount() {
        document.querySelector('#Node'+this.props.Selected.Node+'>.'+this.props.Selected.Type+'>#'+this.props.Selected.Field).classList.remove('sel')
        document.removeEventListener('mousemove', this.onMove)
    }
    onMove(e) {
        this.setState({MousePos: { x: e.pageX, y: e.pageY}})
    }
    render() {
        return <path d={'M'+this.HandlePos.x+' '+this.HandlePos.y+' L'+this.state.MousePos.x + ' ' + this.state.MousePos.y}  stroke="white" strokeWidth="3" fill="none" strokeDasharray="15,5"/>
    }
}

export default TempConnector
