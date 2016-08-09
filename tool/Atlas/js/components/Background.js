// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(['three', 'react'], function(THREE, React) {
    var Background;
    return Background = (function(superClass) {
      var background, camera, renderer, scene;

      extend(Background, superClass);

      renderer = new THREE.WebGLRenderer({
        antialias: true
      });

      scene = new THREE.Scene();

      camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 10);

      background = '';

      function Background() {
        this.renderScene = bind(this.renderScene, this);
        this.render = bind(this.render, this);
        var geometry, material;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = 0;
        renderer.domElement.style.zIndex = 0;
        renderer.setClearColor(0x0e1112, 1);
        geometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);
        material = new THREE.ShaderMaterial({
          vertexShader: document.getElementById('vertexShader').textContent,
          fragmentShader: document.getElementById('fragmentShader').textContent
        });
        background = new THREE.Mesh(geometry, material);
        background.rotation.x = -1.57;
        scene.add(background);
        background.position.y = 0;
        camera.position.set(0, 5, 0);
        camera.lookAt(scene.position);
        window.addEventListener('resize', this.onWindowResize, false);
        this.renderScene();
      }

      Background.prototype.componentDidMount = function() {
        return document.getElementById("background").appendChild(renderer.domElement);
      };

      Background.prototype.render = function() {
        return React.createElement("div", {
          "id": "background"
        });
      };

      Background.prototype.renderScene = function() {
        requestAnimationFrame(this.renderScene);
        return renderer.render(scene, camera);
      };

      Background.prototype.onWindowResize = function() {
        var h, p, w;
        w = window.innerWidth;
        h = window.innerHeight;
        camera.left = w / -2;
        camera.right = w / 2;
        camera.top = h / 2;
        camera.bottom = h / -2;
        camera.updateProjectionMatrix();
        p = background.geometry.attributes.position.array;
        p[0] = w / -2;
        p[1] = h / 2;
        p[3] = w / 2;
        p[4] = h / 2;
        p[6] = -w / 2;
        p[7] = h / -2;
        p[9] = w / 2;
        p[10] = h / -2;
        background.geometry.attributes.position.needsUpdate = true;
        return renderer.setSize(window.innerWidth, window.innerHeight);
      };

      return Background;

    })(React.Component);
  });

}).call(this);

//# sourceMappingURL=Background.map
