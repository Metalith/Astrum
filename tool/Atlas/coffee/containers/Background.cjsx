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
                handle = document.querySelector("#Node" + nextProps.Selected.Node+">."+ nextProps.Selected.Type+">#" + nextProps.Selected.Field+">.Handle")
                handlePos = handle.getBoundingClientRect()
                material = new THREE.LineDashedMaterial({ color: 0xDDDDDD, dashSize: 30, gapSize: 10, linewidth: 3 })
                geometry = new THREE.Geometry()
                geometry.vertices.push new THREE.Vector3 handlePos.left + handlePos.width / 2 - window.innerWidth / 2, 1, handlePos.top  + handlePos.width / 2 - window.innerHeight / 2
                geometry.vertices.push new THREE.Vector3 handlePos.left + handlePos.width / 2 - window.innerWidth / 2, 1, handlePos.top  + handlePos.width / 2 - window.innerHeight / 2
                geometry.computeLineDistances()
                @tempConnector = new THREE.Line(geometry, material)
                @scene.add(@tempConnector)
                document.addEventListener('mousemove', @updateTempConnector)
                document.addEventListener('mouseup', @removeTempConnector)

        updateTempConnector: (e) =>
            @tempConnector.geometry.vertices[1].x = e.pageX - window.innerWidth / 2;
            @tempConnector.geometry.vertices[1].z = e.pageY - window.innerHeight / 2;
            @tempConnector.geometry.verticesNeedUpdate = true;
            @tempConnector.geometry.computeLineDistances();
            @tempConnector.geometry.lineDistancesNeedUpdate = true;

        removeTempConnector:() =>
            document.querySelector("#Node" + @props.Selected.Node+">."+ @props.Selected.Type+">#" + @props.Selected.Field).classList.toggle('sel')
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
            Connecting: state.Connecting
            Selected: state.Selected
        }

    return Background = connect(mapStateToProps)(Background)
