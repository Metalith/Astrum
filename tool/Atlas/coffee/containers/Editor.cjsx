define ["react", "Menu", "Background", "Nodes"], (React, Menu, Background, Nodes) ->
    class Editor extends React.Component
        constructor: (props) ->
            super props
            this.state =
                showContextMenu: false,
                menuPos: [-999, -999]

        hideContextMenu: =>
            @setState(
                showContextMenu: false
            )

        render: ->
            <div id="Editor" onContextMenu={(e) => @setState(showContextMenu: true, menuPos: [e.pageX - 5, e.pageY - 5]); e.preventDefault()}>
                <Background />
                <Nodes />
                <Menu hide={@hideContextMenu} show={@state.showContextMenu} pos={@state.menuPos}/>
            </div>
