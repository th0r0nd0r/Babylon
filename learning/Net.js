class Net {
  constructor(cameraPos, direction) {
    if (!cameraPos) {
      this.cameraPos = {x: 0, y: 0, z: 0};
    } else {
      this.cameraPos = cameraPos;
    }

    if (!direction) {
      this.direction = {x: 0, y: 0, z: .5};
    } else {
      this.direction = direction;
    }
  }

  shootNet() {
    const direction = this.direction;
    const cameraPos = this.cameraPos;

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
    
    
    var positions = translatePositions(ground.getVerticesData(BABYLON.VertexBuffer.PositionKind), cameraPos);
    ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    
    
    var spheres = [];
    for (var i = 0; i < positions.length; i = i + 3) {
      var v = BABYLON.Vector3.FromArray(positions, i);
      
      var s = BABYLON.MeshBuilder.CreateSphere("s" + i, { diameter: 0.1 }, scene);
  
      s.material =  new BABYLON.StandardMaterial('texture1', scene);
      s.material.diffuseColor = new BABYLON.Color3(3, 2, 0);
  
      s.position.copyFrom(v);
      // let pivotAt = new BABYLON.Vector3(cameraPos.x, cameraPos.y, cameraPos.z);
      // let pilotStart = s.position;
  
      // let pivotTranslate = pilotStart.subtract(pivotAt);
      // s.setPivotMatrix(BABYLON.Matrix.Translation(pivotTranslate.x, pivotTranslate.y, pivotTranslate.z));
      
      // s.rotation.x = direction.x;
      // s.rotation.y = direction.y;
      // s.rotation.z = direction.z;
  
  
  
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
    console.log("DIRECTION: ", direction);
    spheres.forEach(function (point, idx) {
      var mass = 10;
      point.physicsImpostor = new BABYLON.PhysicsImpostor(point, BABYLON.PhysicsImpostor.SphereImpostor, { mass: mass, restitution: 0, radius: .1, friction: 1 }, scene);
      point.physicsImpostor.setLinearVelocity( new BABYLON.Vector3(direction.x * 40,direction.y * 40, direction.z * 40));
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
}

