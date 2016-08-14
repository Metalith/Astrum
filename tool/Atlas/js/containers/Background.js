// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(['three', 'react'], function(THREE, React) {
    var Background, connect, mapStateToProps;
    connect = require('reactredux').connect;
    Background = (function(superClass) {
      extend(Background, superClass);

      Background.prototype.renderer = new THREE.WebGLRenderer({
        antialias: true
      });

      Background.prototype.scene = new THREE.Scene();

      Background.prototype.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 10);

      Background.prototype.background = '';

      Background.prototype.tempConnector = '';

      Background.prototype.Connectors = [];

      function Background(props) {
        this.onWindowResize = bind(this.onWindowResize, this);
        this.renderScene = bind(this.renderScene, this);
        this.render = bind(this.render, this);
        this.removeTempConnector = bind(this.removeTempConnector, this);
        this.updateTempConnector = bind(this.updateTempConnector, this);
        this.componentWillUpdate = bind(this.componentWillUpdate, this);
        var geometry, material;
        Background.__super__.constructor.call(this, props);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.position = "absolute";
        this.renderer.domElement.style.top = 0;
        this.renderer.domElement.style.zIndex = 0;
        this.renderer.setClearColor(0x0e1112, 1);
        geometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);
        material = new THREE.ShaderMaterial({
          vertexShader: document.getElementById('vertexShader').textContent,
          fragmentShader: document.getElementById('fragmentShader').textContent
        });
        this.background = new THREE.Mesh(geometry, material);
        this.background.rotation.x = -1.57;
        this.scene.add(this.background);
        this.background.position.y = 0;
        this.camera.position.set(0, 5, 0);
        this.camera.lookAt(this.scene.position);
        window.addEventListener('resize', this.onWindowResize, false);
        this.renderScene();
      }

      Background.prototype.componentDidMount = function() {
        return document.getElementById("background").appendChild(this.renderer.domElement);
      };

      Background.prototype.componentWillUpdate = function(nextProps, nextState) {
        var Connectors, Handle1, Handle2, Node1, Node2, d, geometry, handlePos, material, newConnection, newpath, xmlns;
        if (!this.props.Connecting && nextProps.Connecting) {
          material = new THREE.LineDashedMaterial({
            color: 0xDDDDDD,
            dashSize: 30,
            gapSize: 10,
            linewidth: 3
          });
          geometry = new THREE.Geometry();
          handlePos = {
            x: nextProps.Nodes[nextProps.Selected.Node].pos.x + nextProps.Selected.HandlePos.x,
            y: nextProps.Nodes[nextProps.Selected.Node].pos.y + nextProps.Selected.HandlePos.y
          };
          geometry.vertices.push(new THREE.Vector3(handlePos.x - window.innerWidth / 2, 1, handlePos.y - window.innerHeight / 2));
          geometry.vertices.push(new THREE.Vector3(handlePos.x - window.innerWidth / 2, 1, handlePos.y - window.innerHeight / 2));
          geometry.computeLineDistances();
          this.tempConnector = new THREE.Line(geometry, material);
          this.scene.add(this.tempConnector);
          document.addEventListener('mousemove', this.updateTempConnector);
          return document.addEventListener('mouseup', this.removeTempConnector);
        } else if (nextProps.Connections.length > this.props.Connections.length) {
          Connectors = document.querySelector(".Connectors");
          newConnection = nextProps.Connections[this.Connectors.length];
          Node1 = nextProps.Nodes[newConnection.Node1.Node];
          Node2 = nextProps.Nodes[newConnection.Node2.Node];
          Handle1 = {
            x: Node1.pos.x + newConnection.Node1.HandlePos.x,
            y: Node1.pos.y + newConnection.Node1.HandlePos.y
          };
          Handle2 = {
            x: Node2.pos.x + newConnection.Node2.HandlePos.x,
            y: Node2.pos.y + newConnection.Node2.HandlePos.y
          };
          xmlns = "http://www.w3.org/2000/svg";
          newpath = document.createElementNS(xmlns, "path");
          d = "M" + Handle1.x + " " + Handle1.y + " L" + Handle2.x + " " + Handle2.y;
          newpath.setAttributeNS(null, "id", "Connector" + newConnection.id);
          newpath.setAttributeNS(null, "d", d);
          newpath.setAttributeNS(null, "stroke", "white");
          newpath.setAttributeNS(null, "stroke-width", "2");
          newpath.setAttributeNS(null, "fill", "none");
          Connectors.appendChild(newpath);
          return this.Connectors.push(newConnection.id);
        }
      };

      Background.prototype.updateTempConnector = function(e) {
        this.tempConnector.geometry.vertices[1].x = e.pageX - window.innerWidth / 2;
        this.tempConnector.geometry.vertices[1].z = e.pageY - window.innerHeight / 2;
        this.tempConnector.geometry.verticesNeedUpdate = true;
        this.tempConnector.geometry.computeLineDistances();
        return this.tempConnector.geometry.lineDistancesNeedUpdate = true;
      };

      Background.prototype.removeTempConnector = function() {
        document.querySelector("#Node" + this.props.Selected.Node + ">." + this.props.Selected.Type + ">#" + this.props.Selected.Field).classList.remove('sel');
        document.removeEventListener('mousemove', this.updateTempConnector);
        document.removeEventListener('mouseup', this.removeTempConnector);
        return this.scene.remove(this.tempConnector);
      };

      Background.prototype.render = function() {
        return React.createElement("div", {
          "id": "background"
        });
      };

      Background.prototype.renderScene = function() {
        requestAnimationFrame(this.renderScene);
        return this.renderer.render(this.scene, this.camera);
      };

      Background.prototype.onWindowResize = function() {
        var h, p, w;
        w = window.innerWidth;
        h = window.innerHeight;
        this.camera.left = w / -2;
        this.camera.right = w / 2;
        this.camera.top = h / 2;
        this.camera.bottom = h / -2;
        this.camera.updateProjectionMatrix();
        p = this.background.geometry.attributes.position.array;
        p[0] = w / -2;
        p[1] = h / 2;
        p[3] = w / 2;
        p[4] = h / 2;
        p[6] = -w / 2;
        p[7] = h / -2;
        p[9] = w / 2;
        p[10] = h / -2;
        this.background.geometry.attributes.position.needsUpdate = true;
        return this.renderer.setSize(window.innerWidth, window.innerHeight);
      };

      return Background;

    })(React.Component);
    mapStateToProps = function(state) {
      return {
        Nodes: state.Nodes,
        Connections: state.Connections,
        Connecting: state.Connecting,
        Selected: state.Selected
      };
    };
    return Background = connect(mapStateToProps)(Background);
  });

}).call(this);

//# sourceMappingURL=Background.map
