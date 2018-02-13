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

    var invView = new BABYLON.Matrix();
		this.camera.getViewMatrix().invertToRef(invView);
		var direction = BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(0, 0, 1), invView);
		
    direction.normalize();
    
    console.log("direction: ", direction);

    // use offsets in translatePositions function to create net on camera location
    const offsets = [this.camera.position.x, this.camera.position.y, this.camera.position.z];

      this.shoot(offsets, direction);
  }

};
