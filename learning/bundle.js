/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Player_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Player_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__Player_js__);


var canvas = document.getElementById("renderCanvas"); // Get the canvas element 

var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const Cannon = new BABYLON.CannonJSPlugin;

const translatePositions = (positions, offsets) => {
  console.log("offsets: ", offsets);
  let xIdx = 0;
  let yIdx = 1;
  let zIdx = 2;

  const length = positions.length - 1;
  for (let i = 0; i <= length; i++) {
    if (i === xIdx) {
      positions[xIdx] += offsets[0];
      xIdx += 3;
    } else if (i === zIdx) {
      positions[yIdx] += offsets[2];
      positions[zIdx] += offsets[1];
      let z = positions[zIdx];
      let y = positions[yIdx];

      positions[zIdx] = y;
      positions[yIdx] = z;

      zIdx += 3;
      yIdx += 3;
    }


  }

  return positions;
};

function shootNet(offsets) {

  if (!offsets) {
    offsets = [0,0,0];
  }

  var subdivisions = 20;
  var groundWidth = 8;
  
  var distanceBetweenPoints = groundWidth / subdivisions;	

  const diagonalDistance = Math.sqrt(2 * Math.pow(distanceBetweenPoints, 2));
  
  var clothMat = new BABYLON.StandardMaterial("texture3", scene);
    clothMat.diffuseTexture = new BABYLON.Texture("http://i.imgur.com/2HklR1L.jpg", scene);
  clothMat.zOffset = -20;
  clothMat.backFaceCulling = false;
  
  
    // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
    var ground = BABYLON.Mesh.CreateGround("ground1", groundWidth, groundWidth, subdivisions - 1, scene, true);
    ground.material = clothMat;
    // realGround.material = clothMat;
  
  
  var positions = translatePositions(ground.getVerticesData(BABYLON.VertexBuffer.PositionKind), offsets);
  ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
  
  
  var spheres = [];
  for (var i = 0; i < positions.length; i = i + 3) {
    var v = BABYLON.Vector3.FromArray(positions, i);
    
    var s = BABYLON.MeshBuilder.CreateSphere("s" + i, { diameter: 0.1 }, scene);

    s.material =  new BABYLON.StandardMaterial('texture1', scene);
    s.material.diffuseColor = new BABYLON.Color3(3, 2, 0);

    s.position.copyFrom(v);
    spheres.push(s);
  }
  
  function createJoint(imp1, imp2, diagonal) {
    let maxDistance;

    if (diagonal) {
      maxDistance = diagonalDistance;
    } else {
      maxDistance = distanceBetweenPoints;
    }

    var joint = new BABYLON.DistanceJoint({
      maxDistance,
      maxForce: 10000000000000000000000000
    });
    imp1.addJoint(imp2, joint);
  }

  
  //create the impostors
  console.log("spheres: ", spheres);
  spheres.forEach(function (point, idx) {
    var mass = 10;
    point.physicsImpostor = new BABYLON.PhysicsImpostor(point, BABYLON.PhysicsImpostor.SphereImpostor, { mass: mass, restitution: 0, radius: .1, friction: 1 }, scene);
    point.physicsImpostor.setLinearVelocity( new BABYLON.Vector3(0,0,20));
      if (idx >= subdivisions) {
        createJoint(point.physicsImpostor, spheres[idx - subdivisions].physicsImpostor, false);
      if (idx % subdivisions) {
        point.material.diffuseColor = new BABYLON.Color3(0, 2, 1);
        createJoint(point.physicsImpostor, spheres[idx - 1].physicsImpostor, false);
        // createJoint(point.physicsImpostor, spheres[idx - subdivisions - 1].physicsImpostor, true);
      }
      
    }
  });
  
  ground.registerBeforeRender(function () {
    var positions = [];
    spheres.forEach(function (s) {
      positions.push(s.position.x, s.position.y, s.position.z);
  
    });
    ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    ground.refreshBoundingInfo();
  });
}

var createScene = function () {

  // This creates a basic Babylon Scene object (non-mesh)
  var scene = new BABYLON.Scene(engine);
scene.enablePhysics(new BABYLON.Vector3(0,-9.81,0), Cannon);

  var camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 2, 30, BABYLON.Vector3.Zero(), scene);

camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  var realGround = BABYLON.MeshBuilder.CreateBox("realGround", {height: .5, width: 400, depth: 400}, scene);
  realGround.physicsImpostor = new BABYLON.PhysicsImpostor(realGround, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1 }, scene);
  
  realGround.position.y = -30;


  shootNet();

var bigSphere = BABYLON.MeshBuilder.CreateSphere("bigSphere", { diameter: 1, segments: 16 }, scene);
bigSphere.position.y = 1;
bigSphere.position.x = 0;
bigSphere.position.z = 8;
bigSphere.physicsImpostor = new BABYLON.PhysicsImpostor(bigSphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 50, restitution: 0, friction: 1 }, scene);


const newSphere = BABYLON.MeshBuilder.CreateBox("newSphere", {height: 2, width: 2, depth: 2}, scene);
newSphere.position.y = 0;
newSphere.position.x = -10;
newSphere.physicsImpostor = new BABYLON.PhysicsImpostor(newSphere, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1 }, scene);

newSphere.registerBeforeRender ( () => {
  newSphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(0,10,0), newSphere.getAbsolutePosition());
});

return scene;

};

var scene = createScene();

console.log("cloth method: ", shootNet);

const player = new Player(scene, shootNet);

// scene.debugLayer.show();

engine.runRenderLoop(function () { // Register a render loop to repeatedly render the scene
        scene.render();
});


window.addEventListener("resize", function () { // Watch for browser/canvas resize events
        engine.resize();
});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

/**
 * A player is represented by a box and a free camera.
 * @param scene
 * @param game
 * @param spawnPoint The spawning point of the player
 * @constructor
 */
Player = function(scene, shoot, spawnPoint) {

  if (!spawnPoint) {
      spawnPoint = new BABYLON.Vector3(0,0,0);
  }

  // The player spawnPoint
  this.spawnPoint = spawnPoint;
  // The game scene
  this.scene = scene;

  this.shoot = shoot;
  // The game
  // this.game = game;
  // The player eyes height
  this.height = 2;
  // The player speed
  this.speed = 10;
  // The player inertia
  this.inertia = 0.2;
  // The player angular inertia
  this.angularInertia = 0;
  // The mouse sensibility (lower the better sensible)
  this.angularSensibility = 1000;
  // The player camera
  this.camera = this._initCamera();
  // The player must click on the canvas to activate control
  this.controlEnabled = false;
  // The player weapon
  // this.weapon = new Weapon(game, this);
  var _this = this;

  var canvas = this.scene.getEngine().getRenderingCanvas();
  // Event listener on click on the canvas
  canvas.addEventListener("click", function(evt) {
      var width = _this.scene.getEngine().getRenderWidth();
      var height = _this.scene.getEngine().getRenderHeight();

      if (_this.controlEnabled) {
          var pickInfo = _this.scene.pick(width/2, height/2, null, false, _this.camera);
          _this.handleUserMouse(evt, pickInfo);
      }
  }, false);

  // Event listener to go pointer lock
  this._initPointerLock();

  // The representation of player in the minimap
  var s = BABYLON.Mesh.CreateSphere("player2", 16, 4, this.scene);
  s.position.y = 10;
  s.registerBeforeRender(function() {
      s.position.x = _this.camera.position.x;
      s.position.z = _this.camera.position.z;
  });

  var red = new BABYLON.StandardMaterial("red", this.scene);
  red.diffuseColor = BABYLON.Color3.Red();
  red.specularColor = BABYLON.Color3.Black();
  s.material = red;
  s.layerMask = 1;

  // Set the active camera for the minimap
  this.scene.activeCameras.push(this.camera);
  this.scene.activeCamera = this.camera;


};

Player.prototype = {

  _initPointerLock : function() {
      var _this = this;
      // Request pointer lock
      var canvas = this.scene.getEngine().getRenderingCanvas();
      canvas.addEventListener("click", function(evt) {
          canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
          if (canvas.requestPointerLock) {
              canvas.requestPointerLock();
          }
      }, false);

      // Event listener when the pointerlock is updated.
      var pointerlockchange = function (event) {
          _this.controlEnabled = (document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas || document.msPointerLockElement === canvas || document.pointerLockElement === canvas);
          if (!_this.controlEnabled) {
              _this.camera.detachControl(canvas);
          } else {
              _this.camera.attachControl(canvas);
          }
      };
      document.addEventListener("pointerlockchange", pointerlockchange, false);
      document.addEventListener("mspointerlockchange", pointerlockchange, false);
      document.addEventListener("mozpointerlockchange", pointerlockchange, false);
      document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
  },

  /**
   * Init the player camera
   * @returns {BABYLON.FreeCamera}
   * @private
   */
  _initCamera : function() {

      var cam = new BABYLON.FreeCamera("camera", this.spawnPoint, this.scene);
      cam.attachControl(this.scene.getEngine().getRenderingCanvas());
      cam.ellipsoid = new BABYLON.Vector3(2, this.height, 2);
      cam.checkCollisions = false;
      cam.applyGravity = true;
      // ZQSD
      cam.keysUp.push(87); // W
      cam.keysDown = [83]; // S
      cam.keysLeft = [65]; // A
      cam.keysRight = [68]; // D
      cam.speed = this.speed;
      cam.inertia = this.inertia;
      cam.angularInertia = this.angularInertia;
      cam.angularSensibility = this.angularSensibility;
      cam.layerMask = 2;

      return cam;
  },

  /**
   * Handle the user input on keyboard
   * @param keycode
   */
  handleUserKeyboard : function(keycode) {
      switch (keycode) {

      }
  },

  /**
   * Handle the user input on mouse.
   * click = shoot
   * @param evt
   * @param pickInfo The pick data retrieved when the click has been done
   */
  handleUserMouse : function(evt, pickInfo) {
    // console.log("pickInfo: ", pickInfo);
    console.log("cameraPos: ", this.camera.position);
    console.log("view matrix:", this.camera.getViewMatrix());

    // use offsets in translatePositions function to create net on camera location
    const offsets = [this.camera.position.x, this.camera.position.y, this.camera.position.z];

      this.shoot(offsets);
  }

};


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map