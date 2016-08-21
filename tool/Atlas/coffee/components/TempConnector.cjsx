define ["react"], (React) ->
    connect = require('reactredux').connect

    class TempConnector extends React.Component
        HandlePos:
            x: -1
            y: -1
        constructor: (props) ->
            super props
            Field = document.querySelector('#Node'+@props.Selected.Node+'>.'+@props.Selected.Type+'>#'+@props.Selected.Field)
            Field.classList.add('sel')
            Handle = Field.querySelector('.Handle')
            HandleRect = Handle.getBoundingClientRect()
            @HandlePos =
                x: HandleRect.left + HandleRect.width / 2
                y: HandleRect.top + HandleRect.height / 2
            @state =
                MousePos: @HandlePos
        componentWillMount: ->
            document.addEventListener 'mousemove', @onMove
        componentWillUnmount: ->
            document.querySelector('#Node'+@props.Selected.Node+'>.'+@props.Selected.Type+'>#'+@props.Selected.Field).classList.remove('sel')
            document.removeEventListener 'mousemove', @onMove
        onMove: (e) =>
            @setState({MousePos: { x: e.pageX, y: e.pageY}})
        render: ->
            <path d={'M'+@HandlePos.x+' '+@HandlePos.y+' L'+@state.MousePos.x + ' ' + @state.MousePos.y}  stroke="white" strokeWidth="3" fill="none" strokeDasharray="15,5"/>
