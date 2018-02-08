var canvas = document.getElementById("renderCanvas"); // Get the canvas element 

var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const Cannon = new BABYLON.CannonJSPlugin;

const translatePositions = (positions) => {
  console.log(positions.length);
  let yIdx = 1;
  let zIdx = 2;

  const length = positions.length - 1;
  for (let i = 0; i <= length; i++) {
    if (i === zIdx) {
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

var subdivisions = 20;
var groundWidth = 8;

var distanceBetweenPoints = groundWidth / subdivisions;	

var clothMat = new BABYLON.StandardMaterial("texture3", scene);
  clothMat.diffuseTexture = new BABYLON.Texture("http://i.imgur.com/2HklR1L.jpg", scene);
clothMat.zOffset = -20;
clothMat.backFaceCulling = false;

  // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
  var ground = BABYLON.Mesh.CreateGround("ground1", groundWidth, groundWidth, subdivisions - 1, scene, true);
  ground.material = clothMat;
  // realGround.material = clothMat;

  var realGround = BABYLON.MeshBuilder.CreateBox("realGround", {height: 2, width: 400, depth: 400}, scene);
  realGround.physicsImpostor = new BABYLON.PhysicsImpostor(realGround, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1 }, scene);

  realGround.position.y = -30;
  

var positions = translatePositions(ground.getVerticesData(BABYLON.VertexBuffer.PositionKind));
ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);


var spheres = [];
for (var i = 0; i < positions.length; i = i + 3) {
  var v = BABYLON.Vector3.FromArray(positions, i);
  
  var s = BABYLON.MeshBuilder.CreateSphere("s" + i, { diameter: 0.1 }, scene);
  s.position.copyFrom(v);
  spheres.push(s);
}

function createJoint(imp1, imp2) {
  var joint = new BABYLON.DistanceJoint({
    maxDistance: distanceBetweenPoints
  });
  imp1.addJoint(imp2, joint);
}

//create the impostors
spheres.forEach(function (point, idx) {
  var mass = 15;
  point.physicsImpostor = new BABYLON.PhysicsImpostor(point, BABYLON.PhysicsImpostor.SphereImpostor, { mass: mass, restitution: 0, radius: .1 }, scene);
  point.physicsImpostor.setLinearVelocity( new BABYLON.Vector3(0,0,50));
      if (idx >= subdivisions) {
    createJoint(point.physicsImpostor, spheres[idx - subdivisions].physicsImpostor);
    if (idx % subdivisions) {
      createJoint(point.physicsImpostor, spheres[idx - 1].physicsImpostor);
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

var bigSphere = BABYLON.MeshBuilder.CreateSphere("bigSphere", { diameter: 1, segments: 16 }, scene);
bigSphere.position.y = 1;
bigSphere.position.x = 0;
bigSphere.position.z = 8;
bigSphere.physicsImpostor = new BABYLON.PhysicsImpostor(bigSphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 50, restitution: 0, friction: 10 }, scene);

bigSphere.registerBeforeRender ( () => {
  // bigSphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(0,0,0), bigSphere.getAbsolutePosition());
});


  return scene;

};

var scene = createScene();

// scene.debugLayer.show();

engine.runRenderLoop(function () { // Register a render loop to repeatedly render the scene
        scene.render();
});


window.addEventListener("resize", function () { // Watch for browser/canvas resize events
        engine.resize();
});