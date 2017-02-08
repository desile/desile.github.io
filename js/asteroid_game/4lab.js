var canvas = document.querySelector("#renderCanvas");
var engine = new BABYLON.Engine(canvas, true);


var stats = document.getElementById("statsText");
var divFps = document.getElementById("fps");

//engine.enableOfflineSupport = false;

var frameBounds = {left: -9, right: 9, up: 19, down: 10.7}

var Keyboard = {
    keys : {},
    keyPress : function (evt) {
        if (this.keys[evt.keyCode] > 0) { return; }
        this.keys[evt.keyCode] = true;
    },
    keyRelease : function (evt) {
        this.keys[evt.keyCode] = false;
    }
};
window.addEventListener("keydown", Keyboard.keyPress.bind(Keyboard));
window.addEventListener("keyup", Keyboard.keyRelease.bind(Keyboard));

document.ontouchmove = function(event){
    event.preventDefault();
}



function AsteroidsGenerator(sceneObj){
    var arr = [];
    var xMin = -11;
    var xMax = 12.4;
    var yMin = 10.7;
    var yMax = 21.2;

    var scene = sceneObj;

    var respawnMs = 100;
    var lastSpawnTime = new Date().getTime();

    var generateAsteroid = function(){
        if((new Date().getTime()) - lastSpawnTime > respawnMs){
            var newAsteroid = BABYLON.Mesh.CreateSphere("sphere", 16, 1, scene);
            newAsteroid.position.z = 100;
            newAsteroid.position.x = Math.random() * (xMax - xMin) + xMin;
            newAsteroid.position.y = Math.random() * (yMax - yMin) + yMin;

            var asteroidMaterial = new BABYLON.StandardMaterial("asteroidMaterial", scene);
            asteroidMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
            newAsteroid.material = asteroidMaterial;

            var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
            particleSystem.particleTexture = new BABYLON.Texture("assets/Flare.png", scene);
            particleSystem.emitter = newAsteroid;

            particleSystem.color1 = new BABYLON.Color4(0.2, 0.2, 0.2, 1.0);
            particleSystem.color2 = new BABYLON.Color4(0.5, 0.5, 0.5, 1.0);
            particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
            
            particleSystem.minSize = 0.1;
            particleSystem.maxSize = 0.5;
            
            particleSystem.minLifeTime = 0.3;
            particleSystem.maxLifeTime = 1.5;
            
            particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
            particleSystem.direction1 = new BABYLON.Vector3(-10, 10, 0);
            particleSystem.direction2 = new BABYLON.Vector3(10, -10, 30);

            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
            
            particleSystem.manualEmitCount = 300;

            particleSystem.disposeOnStop = true;

            newAsteroid.particleSystem = particleSystem;

            arr.push(newAsteroid);
            lastSpawnTime = new Date().getTime();
        }
    }

    var moveAsteroids = function (){
        for(var i = 0; i < arr.length; i++){
            arr[i].position.z -= 1;
            if(arr[i].position.z < -20){
                arr[i].dispose();
                arr.splice(i,1);
            }
        }
    }

    this.update = function(){
        generateAsteroid();
        moveAsteroids();
    }

    this.getAsteroidsCount = function(){
        return arr.length;
    }

    this.checkColiisions = function(mesh){
        for(var i = 0; i < arr.length; i++){
            if (arr[i].position.z < 10 && arr[i].intersectsMesh(mesh, true)) {
                arr[i].particleSystem.start();
                arr[i].material.alpha = 0;
                //arr[i].dispose();
                arr.splice(i,1);
                return true;
            }
        }
        return false;
    }

}

function initializeSpaceShip(newMeshes) {
    newMeshes[0].rotation.y = Math.PI;
    newMeshes[0].rotation.x = 0;
    newMeshes[0].position = new BABYLON.Vector3(0, 15, 3)
    newMeshes[0].scaling = new BABYLON.Vector3(0.002, 0.002, 0.002)
    newMeshes[0].material = new BABYLON.StandardMaterial("Spaceship", scene);
    newMeshes[0].material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    var boundMaterial = new BABYLON.StandardMaterial("boundMaterial", scene);
    boundMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    boundMaterial.wireframe = true;
    boundMaterial.alpha = 0;
    var spaceShipBound = BABYLON.Mesh.CreateBox("spaceShipBound", 3, scene);
    spaceShipBound.material = boundMaterial;
    spaceShipBound.position = new BABYLON.Vector3(0, 15, 3);
    spaceShipBound.scaling = new BABYLON.Vector3(1.2, 0.45, 1.1);

    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("assets/Flare.png", scene);
    particleSystem.emitter = spaceShipBound;

    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

    particleSystem.minEmitBox = new BABYLON.Vector3(-0.2,0.1, -1); // Starting all from
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.2, 0.4, -1); // To...
    
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;

    particleSystem.minLifeTime = 0.05;
    particleSystem.maxLifeTime = 0.05;
    
    particleSystem.gravity = new BABYLON.Vector3(0, 0, -2);
    particleSystem.direction1 = new BABYLON.Vector3(0.1, -0.1, 0);
    particleSystem.direction2 = new BABYLON.Vector3(-0.1, -0.1, -10);

    particleSystem.minEmitPower = 10;
    particleSystem.maxEmitPower = 10;
    particleSystem.updateSpeed = 0.005;
    
    particleSystem.emitRate = 300;
    
    particleSystem.disposeOnStop = true;
    
    spaceShipBound.particleSystem = particleSystem;

    particleSystem.start();

    this.mesh = newMeshes[0];
    this.bound = spaceShipBound;
    this.ready = true;
}

function Bullet(scene, x, y, z){
    this.model = (BABYLON.Mesh.CreateSphere("bullet", 4, 0.3, scene));
    this.position = this.model.position = new BABYLON.Vector3(x, y, 3);
    this.dead = 0;

    var magnettoSphereColor = new BABYLON.StandardMaterial("magnettoColor", scene);
    magnettoSphereColor.diffuseColor = new BABYLON.Color3(0, 153/255, 51/255);
    magnettoSphereColor.specularColor = new BABYLON.Color3(1, 1, 1);
    magnettoSphereColor.ambientColor = new BABYLON.Color3(0, 0, 1);
    magnettoSphereColor.emissiveColor  = new BABYLON.Color3(1, 0, 0);
    magnettoSphereColor.specularPower = 32;
    this.model.material = magnettoSphereColor;
    
    var boundMaterial = new BABYLON.StandardMaterial("boundBulletMaterial", scene);
    boundMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    boundMaterial.wireframe = true;
    boundMaterial.alpha = 0;
    this.bound = BABYLON.Mesh.CreateBox("bulletBound", 0.3, scene);
    this.bound.material = boundMaterial;
    this.bound.scaling = new BABYLON.Vector3(1, 1, 10);
    
    

    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("assets/Flare.png", scene);
    particleSystem.emitter = this.model;

    particleSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.8, 0.5, 0.5, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
    
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;
    
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-10, 10, 0);
    particleSystem.direction2 = new BABYLON.Vector3(10, -10, 30);

    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    
    particleSystem.manualEmitCount = 300;

    particleSystem.disposeOnStop = true;

    this.particleSystem = particleSystem;
    this.bound.parent = this.model;
    
    this.speed = 3;
    
    this.update = function(){
        if(!this.dead) this.model.position.z += this.speed;
        if(this.model.position.z >= 120){
            return 0;
        }
        if(this.dead > 0){
            if((new Date().getTime() - this.dead) > 3000){
                return 0;
            } else {
                return -1;
            }
        }
        for(var j = 0; j < scene.meshes.length; j++){
            if(scene.meshes[j].name == "sphere" && this.bound.intersectsMesh(scene.meshes[j], true)){
                this.particleSystem.start();
                scene.meshes[j].dispose();
                this.model.material.alpha = 0;
                this.dead = new Date().getTime();
                return 1;
            }
        }

        return -1;
    }
    
    
}

function SpaceShip(scene){
    var self = this;
    BABYLON.SceneLoader.ImportMesh("", "assets/", "Spaceship.babylon", scene, initializeSpaceShip.bind(self));
    this.lives = 3;
    this.score = 0;

    var speedMax = 0.2;
    var acceleration = 0.02;
    var braking = 0.01;
    var speed = {left: 0, right: 0, up: 0, down: 0};

    var bulletArray = [];
    var reloadMs = 200;
    var lastShotTime = new Date().getTime();

    this.fire = function(fireKey, x, y, isTimeReload){
        if(fireKey && (new Date().getTime()) - lastShotTime > reloadMs){
            var bullet = new Bullet(scene,x,y,3);
            bulletArray.push(bullet);
            if (isTimeReload) lastShotTime = new Date().getTime();
        }
    }

    var updateBullets = function(){
        var disposed = [];
        for(var i = 0; i < bulletArray.length; i++){
            var res = bulletArray[i].update();
            if(res == 0){
                bulletArray[i].model.dispose();
                bulletArray[i].bound.dispose();
                disposed.push(i);
            }
            if(res > 0){
                self.score += res;
            }
        }
        for(var i = 0; i < disposed.length; i++){
            bulletArray.splice(disposed[i]-i,1);
        }
    }

    this.move = function(direction, force){
        if(force){
            if(speed[direction] < speedMax){
                speed[direction] += acceleration;
            }
        } else {
            if(speed[direction] > 0){
                speed[direction] -= braking;
            } else {
                speed[direction] = 0;
            }
        }
        if(direction == 'left'){
            if (this.bound.position.x < frameBounds[direction]){
                speed[direction] = 0;
            }
        }
        if(direction == 'right'){
            if (this.bound.position.x > frameBounds[direction]){
                speed[direction] = 0;
            }
        }
        if(direction == 'up'){
            if (this.bound.position.y > frameBounds[direction]){
                speed[direction] = 0;
            }
        }
        if(direction == 'down'){
            if (this.bound.position.y < frameBounds[direction]){
                speed[direction] = 0;
            }
        }
    }

    this.update = function(){
        this.move('left',Keyboard.keys[65]);
        this.move('right',Keyboard.keys[68]);
        this.move('up',Keyboard.keys[87]);
        this.move('down',Keyboard.keys[83]);

        this.mesh.position.x += (speed.right - speed.left);
        this.mesh.position.y += (speed.up - speed.down);
        this.bound.position.x += (speed.right - speed.left);
        this.bound.position.y += (speed.up - speed.down);

        //this.fire(true, this.bound.position.x-0.5, this.bound.position.y, false);
        this.fire(true, this.bound.position.x, this.bound.position.y, true);
        updateBullets();
    }


}


var createScene = function () {

    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(1, 1, 1);
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 15, -10), scene);
    camera.setTarget(new BABYLON.Vector3(0, 15, 3));
    //camera.attachControl(canvas, false);
    // This creates a light, aiming 0,1,0 - to the sky.
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    // Dim the light a small amount
    light.intensity = .5;

    var skybox = BABYLON.Mesh.CreateBox("skybox", 500.0, scene);
    skybox.rotation.z = 0.6;
    skybox.rotation.y = Math.PI/2+0.1;
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.renderingGroupId = 0;

    // Ground
    var ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 1, scene, false);
    ground.position = new BABYLON.Vector3(0, 15, 3);
    ground.rotation.x = -Math.PI/2;
    var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    groundMaterial.specularColor = BABYLON.Color3.Black();
    ground.material = groundMaterial;
    ground.material.alpha = 0;

    var aGen = new AsteroidsGenerator(scene); 
    var spaceShip = new SpaceShip(scene);
    var startingPoint;


    var getGroundPosition = function (evt) {
        // Use a predicate to get position on the ground
        var pointerX, pointerY;
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
        if (pickinfo.hit) {
            var pick = pickinfo.pickedPoint;
            if(pick.x <= frameBounds.left){
                pick.x = frameBounds.left;
            }
            if(pick.x >= frameBounds.right){
                pick.x = frameBounds.right;
            }
            if(pick.y >= frameBounds.up){
                pick.y = frameBounds.up;
            }
            if(pick.y <= frameBounds.down){
                pick.y = frameBounds.down;
            }
            return pickinfo.pickedPoint;
        }

        return null;
    }

    var onPointerDown = function (evt) {
        if (evt.button !== 0) {
            return;
        }

        // check if we are under a mesh
        var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== ground; });
        if (pickInfo.hit && pickInfo.pickedMesh.name == "spaceShipBound") {
            startingPoint = getGroundPosition(evt);
        }
    }

    var onPointerMove = function (evt) {
        if (!startingPoint) {
            return;
        }

        var current = getGroundPosition(evt);

        var diff = current.subtract(startingPoint);
        spaceShip.bound.position.addInPlace(diff);
        spaceShip.mesh.position.addInPlace(diff);

        startingPoint = current;
    }

    var onPointerUp = function (evt) {
        startingPoint = null;
    }

    canvas.addEventListener("pointerdown", onPointerDown, false);
    canvas.addEventListener("pointerup", onPointerUp, false);
    canvas.addEventListener("pointermove", onPointerMove, false);

    /*
    var sphereArray = [];
    for(var j = 0; j < 7; j++){
        for(var i = 0; i < 18; i++){
            sphereArray.push(BABYLON.Mesh.CreateSphere("sphere" + i + "|" + j, 16, 1, scene));
            sphereArray[18*j + i].position.x = -11 + i*1.3;
            sphereArray[18*j + i].position.y = 10.7 + 1.5*j;
            sphereArray[18*j + i].position.z = 3;//350;
            //X_MIN = -11, X_MAX = 12.4
            //Y_MIN = 10.7, Y_MAX = 21.2
        }
    }
    */

    scene.registerBeforeRender(function () { 
        if(spaceShip.ready){    
            if(spaceShip.lives > 0){
                spaceShip.update();
                aGen.update();
                aGen.checkColiisions(spaceShip);
                if(aGen.checkColiisions(spaceShip.bound)){
                    spaceShip.lives--;
                }
            }
            stats.innerHTML = "Lives: " + spaceShip.lives + "<br>";
            stats.innerHTML += "Score: " + spaceShip.score + "<br>";
            if(spaceShip.lives == 0){ 
                //document.querySelector("#gameOver").style.visibility = 'visible';
                stats.innerHTML += "<br>GAMEOVER";
                spaceShip.mesh.dispose();
                spaceShip.bound.particleSystem.stop();
            }
        }
    });

    this.reload = function(){

    }

    return scene;
}; 

var scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
});

/*
window.addEventListener("resize", function () {
    if(canvas.height <= window.innerHeight){
        canvas.height = canvas.width/2.031;
        engine.resize();
    } else {
        canvas.height = window.innerHeight;
        engine.resize();
    }
});
*/

window.addEventListener("resize", function () {
        engine.resize();
});