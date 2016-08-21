define ["react", "Field"], (React, Field) ->
    class Input extends React.Component
        el: ''
        constructor: (props) ->
            super props

        render: ->
            i = 0
            return <div className="Input"><br />
                        {for k,v of @props.input
                            <Field key={i++} field={k} type={"Input"} node={@props.node}/>}
                    </div>
