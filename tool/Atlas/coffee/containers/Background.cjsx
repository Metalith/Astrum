define ['three', 'react'], (THREE, React) ->
    connect = require('reactredux').connect

    class Background extends React.Component
        renderer: new THREE.WebGLRenderer
            antialias: true
        scene: new THREE.Scene()
        camera: new THREE.OrthographicCamera window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 10
        background: ''
        constructor: (props) ->
            super props

            @renderer.setSize window.innerWidth, window.innerHeight
            @renderer.domElement.style.position = "absolute"
            @renderer.domElement.style.top = 0
            @renderer.domElement.style.zIndex = 0
            @renderer.domElement.className = "background"
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
            document.getElementById("bg-container").appendChild( @renderer.domElement )

        render: =>
            <div id="bg-container"></div>

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
