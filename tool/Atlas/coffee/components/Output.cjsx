define ["react", "Field"], (React, Field) ->
    class Output extends React.Component
        el: ''
        constructor: (props) ->
            super props

        render: ->
            i = 0
            return <div className="Output"><br />
                        {for k,v of @props.output
                            <Field key={i++} field={k} type={"Output"} node={@props.node}/>}
                    </div>
