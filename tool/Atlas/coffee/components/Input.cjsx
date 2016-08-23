define ["react", "Field"], (React, Field) ->
    connect = require('reactredux').connect

    class Input extends React.Component
        el: ''
        constructor: (props) ->
            super props

        componentWillUpdate: (props, state) =>
            # console.log "t"

        render: ->
            i = 0
            return <div className="Input"><br />
                        {for field of @props.input
                            <Field key={i++} field={field} type={"Input"} node={@props.node}/>}
                    </div>

    return Input = connect()(Input)
