define ['three', 'react'], (THREE, React) ->
    connect = require('reactredux').connect

    class Background extends React.Component
        renderer: new THREE.WebGLRenderer
            antialias: true
        scene: new THREE.Scene()
        camera: new THREE.OrthographicCamera window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 10
        background: ''
        tempConnector: ''
        constructor: (props) ->
            super props

            @renderer.setSize window.innerWidth, window.innerHeight
            @renderer.domElement.style.position = "absolute"
            @renderer.domElement.style.top = 0
            @renderer.domElement.style.zIndex = 0
            @renderer.setClearColor 0x0e1112, 1
            geometry = new THREE.PlaneBufferGeometry window.innerWidth, window.innerHeight

            material = new THREE.ShaderMaterial
                vertexShader: document.getElementById( 'vertexShader' ).textContent,
                fragmentShader: document.getElementById( 'fragmentShader' ).textContent

            @background = new THREE.Mesh geometry, material
            @background.rotation.x = -1.57
            @scene.add @background
            @background.position.y = 0

            @camera.position.set 0, 5, 0
            @camera.lookAt @scene.position

            window.addEventListener( 'resize', @onWindowResize, false );

            @renderScene()

        componentDidMount: ->
            document.getElementById("background").appendChild( @renderer.domElement )

        componentWillUpdate: (nextProps, nextState) =>
            if !@props.Connecting && nextProps.Connecting
                material = new THREE.LineDashedMaterial({ color: 0xDDDDDD, dashSize: 30, gapSize: 10, linewidth: 3 })
                geometry = new THREE.Geometry()
                handlePos =
                    x: nextProps.Nodes[nextProps.Selected.Node].pos.x + nextProps.Selected.HandlePos.x
                    y: nextProps.Nodes[nextProps.Selected.Node].pos.y + nextProps.Selected.HandlePos.y
                geometry.vertices.push new THREE.Vector3 handlePos.x - window.innerWidth / 2, 1, handlePos.y - window.innerHeight / 2
                geometry.vertices.push new THREE.Vector3 handlePos.x - window.innerWidth / 2, 1, handlePos.y - window.innerHeight / 2
                geometry.computeLineDistances()
                @tempConnector = new THREE.Line(geometry, material)
                @scene.add(@tempConnector)
                document.addEventListener('mousemove', @updateTempConnector)
                document.addEventListener('mouseup', @removeTempConnector)
            else if nextProps.Connections.length > @props.Connections.length
                Connectors = document.querySelector(".Connectors")
                newConnection = nextProps.Connections[@props.Connections.length]
                Node1 = nextProps.Nodes[newConnection.Node1.Node]
                Node2 = nextProps.Nodes[newConnection.Node2.Node]
                Handle1 =
                    x: Node1.pos.x + newConnection.Node1.HandlePos.x
                    y: Node1.pos.y + newConnection.Node1.HandlePos.y
                Handle2 =
                    x: Node2.pos.x + newConnection.Node2.HandlePos.x
                    y: Node2.pos.y + newConnection.Node2.HandlePos.y
                if (newConnection.Node1.Type != "Input")
                    a = Handle1
                    Handle1 = Handle2
                    Handle2 = a

                xmlns = "http://www.w3.org/2000/svg";
                newpath = document.createElementNS(xmlns, "path");

                d = "M" + Handle1.x + " " + Handle1.y
                d += "h-50"
                if (Handle1.x < Handle2.x + 100)
                    half = (Handle2.y - Handle1.y) / 2
                    h1 = document.querySelector("#Node" + Node1.id).getBoundingClientRect()
                    h2 = document.querySelector("#Node" + Node2.id).getBoundingClientRect()
                    height = 0
                    if (half >= 0)
                        height = h1.bottom - h2.top
                    else
                        height = h2.bottom - h1.top
                    if  height + 25 >= 0
                        h = h1.height+h2.height+25
                        t = 1
                        if (half < 0)
                            t = -1
                        d += "v"+(t * h)
                        d += "H"+(Handle2.x+50)
                        d += "v"+(t*(-h+(t*half)*2))
                        d += "h-50"
                    else
                        d += "v"+half
                        d += "H"+(Handle2.x+50)
                        d += "v"+half
                        d += "h-50"
                else
                    half = (Handle2.x - Handle1.x) / 2 + 50
                    d += "h"+half
                    d += "V"+(Handle2.y)
                    d += "h"+half
                    d += "h-50"

                newpath.setAttributeNS(null, "id", "Connector" + newConnection.id);
                newpath.setAttributeNS(null, "d", d);
                newpath.setAttributeNS(null, "stroke", "white");
                newpath.setAttributeNS(null, "stroke-width", "2");
                newpath.setAttributeNS(null, "fill", "none");
                Connectors.appendChild(newpath)

        updateTempConnector: (e) =>
            @tempConnector.geometry.vertices[1].x = e.pageX - window.innerWidth / 2;
            @tempConnector.geometry.vertices[1].z = e.pageY - window.innerHeight / 2;
            @tempConnector.geometry.verticesNeedUpdate = true;
            @tempConnector.geometry.computeLineDistances();
            @tempConnector.geometry.lineDistancesNeedUpdate = true;

        removeTempConnector:() =>
            document.querySelector('.Field.sel').classList.remove('sel')
            document.removeEventListener('mousemove', @updateTempConnector)
            document.removeEventListener('mouseup', @removeTempConnector)
            @scene.remove(@tempConnector)

        render: =>
            <div id="background"></div>

        renderScene: =>
            requestAnimationFrame @renderScene # See http://stackoverflow.com/questions/6065169/requestanimationframe-with-this-keyword // Swithed to fat arrow
            @renderer.render @scene, @camera

        onWindowResize: =>
            w = window.innerWidth
            h = window.innerHeight
            @camera.left = w / -2
            @camera.right = w / 2
            @camera.top = h / 2
            @camera.bottom = h / -2
            @camera.updateProjectionMatrix()

            p = @background.geometry.attributes.position.array

            p[0] = w / -2
            p[1] = h / 2
            p[3] = w / 2
            p[4] = h / 2

            p[6] = -w / 2
            p[7] = h / -2

            p[9] = w / 2
            p[10] = h / -2
            @background.geometry.attributes.position.needsUpdate = true
            @renderer.setSize window.innerWidth, window.innerHeight

    mapStateToProps = (state) ->
        return {
            Nodes: state.Nodes
            Connections: state.Connections
            Connecting: state.Connecting
            Selected: state.Selected
        }

    return Background = connect(mapStateToProps)(Background)
