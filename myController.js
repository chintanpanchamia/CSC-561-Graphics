/**
 * Created by chintanpanchamia on 12/7/16.
 */


//Configure//
sceneWidth = window.innerWidth/16;
sceneHeight = window.innerHeight/16;
var gameScreen = document.querySelector("#game");
var myScene = new THREE.Scene();
var myCamera = new THREE.OrthographicCamera(-sceneWidth,sceneWidth,sceneHeight,-sceneHeight, -30, 30);
var myRenderer = new THREE.WebGLRenderer(
    {
    alpha: true, antialias: true
});
myRenderer.setSize(window.innerWidth, window.innerHeight);
gameScreen.appendChild(myRenderer.domElement);
myCamera.position.set(5, 6, -2.9); // Change -1 to 0
myCamera.zoom = 8;                    // for birds eye view
myCamera.updateProjectionMatrix();

window.addEventListener('resize', onWindowResize, false );
function onWindowResize(){
    sceneWidth = window.innerWidth/16;
    sceneHeight = window.innerHeight/16;
    myRenderer.setSize(sceneWidth*16, sceneHeight*16);
    myCamera.left    = -sceneWidth;
    myCamera.right   = sceneWidth;
    myCamera.top     = sceneHeight;
    myCamera.bottom  = -sceneHeight;
    myCamera.updateProjectionMatrix();
}

var myOrbitalControls = new THREE.OrbitControls(myCamera, myRenderer.domElement);
myOrbitalControls.enabled = false;

var light = new THREE.PointLight( 0xFFFFFF, 2);
light.position.set( 0, 7, -5 );
myScene.add( light );

myRenderer.shadowMapEnabled = true;
myRenderer.shadowMapType = THREE.PCFSoftShadowMap;
light.castShadow = true;
light.shadowDarkness = 0.5;
light.shadowCameraVisible = true;


//Keybindings//

document.addEventListener("keyup", keyBinder);
left = 37;
up = 38;         // Key   //
right = 39;     // Codes //
down = 40;
restart = 13;



//globals

var playerWidth = .7, carWidth = 2;
var cCollide = playerWidth/2 + carWidth/2 - .1;

var carLanes1 = [];
var carLanes2 = [];
var carLanes3 = [];
var carLanes4 = [];

var allLogs = [];

var logLaneFlag = false;
var logCollisionFlag = false;

var logSpeeds = [];
var currentLogIndex = 0;
var score = 0;
var zmax = 0;

var jumpSound = document.createElement("audio");
var jumpSrc = document.createElement("source");
jumpSrc.src = 'audio/blipJump.wav';
jumpSound.appendChild(jumpSrc);

var killSound = document.createElement("audio");
var killSrc = document.createElement("source");
killSrc.src = 'audio/hit.wav';
killSound.appendChild(killSrc);

var victorySound = document.createElement("audio");
var victorySrc = document.createElement("source");
victorySrc.src = 'audio/win.wav';
victorySound.appendChild(victorySrc);


playerGeometry = new THREE.SphereGeometry(0.25, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
playerMaterial = new THREE.MeshLambertMaterial({color: 0xC00000});

var grassTexture = new THREE.ImageUtils.loadTexture('images/grass.png');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set( 4, 1 );
grassMaterial = new THREE.MeshLambertMaterial( { map:  grassTexture} );


var waterTexture = THREE.ImageUtils.loadTexture('images/water.jpg');
waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.RepeatWrapping;
waterTexture.repeat.set( 3, 1 );
waterMaterial = new THREE.MeshLambertMaterial( { map: waterTexture} );


var roadTexture = THREE.ImageUtils.loadTexture('images/road.jpg');
roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;
roadTexture.repeat.set( 4, 2 );
roadMaterial = new THREE.MeshLambertMaterial( { map: roadTexture } );

logTexture =  THREE.ImageUtils.loadTexture('images/log.jpg');
logMaterial = new THREE.MeshLambertMaterial( { map: logTexture } );





//Mesh setup
player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.25;
player.position.z = -8.5;
player.castShadow = true;
player.receiveShadow = true;

myScene.add(player);

//patch1
terrainGeometry = new THREE.PlaneGeometry(40,2);
grasses = new THREE.Mesh(terrainGeometry,grassMaterial);
grasses.rotation.x = 270 * Math.PI/180;
grasses.position.z = -8;
grasses.receiveShadow = true;
myScene.add(grasses);


//patch2
terrainGeometry = new THREE.PlaneGeometry(40,6);
roads = new THREE.Mesh(terrainGeometry,roadMaterial);
roads.rotation.x = 270 * Math.PI/180;
roads.position.z = -4;
roads.receiveShadow = true;
myScene.add(roads);



//patch3
terrainGeometry = new THREE.PlaneGeometry(40,4);
waters = new THREE.Mesh(terrainGeometry,waterMaterial);
waters.rotation.x = 270 * Math.PI/180;
waters.position.z = 1;
waters.receiveShadow = true;
myScene.add(waters);

//patch4
terrainGeometry = new THREE.PlaneGeometry(40, 1);
finishLine = new THREE.Mesh(terrainGeometry, grassMaterial);
finishLine.rotation.x = 270 * Math.PI/180;
finishLine.position.z = 3.5;
finishLine.receiveShadow = true;
myScene.add(finishLine);



function keyBinder(e)
{
    logCollisionFlag = false;
    player.position.y = 0.25;
    e.preventDefault();

    switch (e.keyCode)
    {
        case up:
            player.position.z = Math.round(player.position.z * 100) /100;
            if(player.position.z <= finishLine.position.z - 0.8)
            {
                if(player.position.z >= -0.5)
                {
                    player.position.z += 1;
                    player.position.z = Math.round(player.position.z * 100) /100;
                    jumpSound.play();
                }
                else
                {
                    player.position.z += 0.8;
                    player.position.z = Math.round(player.position.z * 100) /100;
                    jumpSound.play();
                }

                if(player.position.z == 3.5)
                {
                    victorySound.play();
                }


                score += 1;
                if(score > zmax)
                {
                    zmax = score;
                }

            }
            break;

        case down:
            player.position.z = Math.round(player.position.z * 100) /100;
            if(player.position.z >= -7.7)
            {

                if(player.position.z > -0.5)
                {
                    jumpSound.play();
                    player.position.z -= 1;
                    player.position.z = Math.round(player.position.z * 100) /100;
                }
                else {
                    jumpSound.play();
                    player.position.z -= 0.8;
                    player.position.z = Math.round(player.position.z * 100) /100;
                }
                score -= 1;
            }
            break;

        case left:
            player.position.z = Math.round(player.position.z * 100) /100;
            if (player.position.x !== 14)
            {
                jumpSound.play();
                player.position.x++;
            }
            break;

        case right:
            player.position.z = Math.round(player.position.z * 100) /100;
            if (player.position.x !== -14)
            {
                jumpSound.play();
                player.position.x--;
            }
            break;

        case restart:
            newGame();
    }

}

function newGame()
{
    var bestScore = document.getElementById('innerBestScoreField');
    if(Number(bestScore.innerHTML) < zmax)
    {
        bestScore.innerHTML = zmax
    }

    player.position.x = 0;
    player.position.y = 0.25;
    player.position.z = -8.5;
    score = 0;
    zmax = 0;
}

function drive()
{

    //Cars
    for (d = 0; d < carLanes1.length; d++)
    {
        carLanes1[d].position.x -= 0.03;
        if (carLanes1[d].position.x < -14.5)
        {
            carLanes1[d].position.x = 10.5;
        }
    }

    for(d = 0; d < carLanes2.length; d++)
    {
        carLanes2[d].position.x -= .05;
        if(carLanes2[d].position.x < -14.5)
        {
            carLanes2[d].position.x = 11.5;
        }
    }

    for(d = 0; d < carLanes3.length; d++)
    {
        carLanes3[d].position.x += .04;
        if(carLanes3[d].position.x > 13.5)
        {
            carLanes3[d].position.x = -12.5;
        }
    }

    for(d = 0; d < carLanes4.length; d++)
    {
        carLanes4[d].position.x += .02;
        if(carLanes4[d].position.x > 14.5)
        {
            carLanes4[d].position.x = -11.5;
        }
    }

    //Logs
    for(d = 0; d < allLogs.length; d++)
    {
        allLogs[d].position.x += logSpeeds[d];
        if(logSpeeds[d] > 0)
        {
            if(allLogs[d].position.x >= 16.5)
            {
                allLogs[d].position.x = -16.5;
            }
        }
        else
        {
            if(allLogs[d].position.x <= -16.5)
            {
                allLogs[d].position.x = 16.5;
            }
        }
    }

}

function carLanePopulator()
{
    //Manufacturing cars
    //carLane1
    carGeometry = new THREE.BoxGeometry(carWidth,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0x4A4293});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -6;
    car.position.x = -10;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes1.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0x4A4293});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -6;
    car.position.x = -5;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes1.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0x4A4293});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -6;
    car.position.x = 1;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes1.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0x4A4293});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -6;
    car.position.x = 6;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes1.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0x4A4293});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -6;
    car.position.x = 10;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes1.push(car);
    myScene.add(car);





    //carLane2
    carGeometry = new THREE.BoxGeometry(carWidth - 0.5,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0x8B4593});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -5.2;
    car.position.x = -5;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes2.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth - 0.5,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0x8B4593});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -5.2;
    car.position.x = -1;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes2.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth - 0.5,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0x8B4593});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -5.2;
    car.position.x = 3;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes2.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth - 0.5,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0x8B4593});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -5.2;
    car.position.x = 5.8;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes2.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth - 0.5,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0x8B4593});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -5.2;
    car.position.x = 10.8;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes2.push(car);
    myScene.add(car);



    //carLane3
    carGeometry = new THREE.BoxGeometry(carWidth - 0.5,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0xFFFFFF});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -3;
    car.position.x = -7;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes3.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth - 0.5,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0xFFFFFF});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -3;
    car.position.x = -2;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes3.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth - 0.5,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0xFFFFFF});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -3;
    car.position.x = 3;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes3.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth - 0.5,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0xFFFFFF});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -3;
    car.position.x = 5.8;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes3.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth - 0.5,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0xFFFFFF});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -3;
    car.position.x = 12.8;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes3.push(car);
    myScene.add(car);




    //carLane4
    carGeometry = new THREE.BoxGeometry(carWidth,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0xffa426});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -2.2;
    car.position.x = -10;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes4.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0xffa426});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -2.2;
    car.position.x = -5;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes4.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0xffa426});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -2.2;
    car.position.x = 1;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes4.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0xffa426});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -2.2;
    car.position.x = 6;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes4.push(car);
    myScene.add(car);

    carGeometry = new THREE.BoxGeometry(carWidth,1,.7);
    carMaterial = new THREE.MeshLambertMaterial({color:0xffa426});
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -2.2;
    car.position.x = 10;
    car.position.y = 0.7;
    car.castShadow = true;
    car.receiveShadow = true;
    carLanes4.push(car);
    myScene.add(car);


}

function logPopulator() //The lane numbers are reversed: #4 is first from player POV, #1 is last
{
    //logLanes1
    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = 2.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = -10;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(-0.04);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = 2.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = -5;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(-0.04);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = 2.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = 1;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(-0.04);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = 2.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = 6;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(-0.04);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = 2.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = 10;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(-0.04);
    myScene.add(log);




    //LogLanes2
    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = 1.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = -8;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(-0.03);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = 1.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = -3;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(-0.03);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = 1.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = 3;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(-0.03);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = 1.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = 6.8;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(-0.03);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = 1.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = 11.8;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(-0.03);
    myScene.add(log);




    //LogLanes3
    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = .5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = -7;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(.01);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = .5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = -2;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(.01);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = .5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = 4.5;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(.01);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = .5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = 8.8;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(.01);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = .5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = 14.8;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(.01);
    myScene.add(log);





    //LogLanes4
    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = -.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = -10;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(.02);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = -.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = -5;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(.02);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = -.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = 1;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(.02);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = -.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = 6;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(.02);
    myScene.add(log);

    logGeometry = new THREE.CylinderGeometry( 0.4, 0.4, 3, 32 );
    log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.z = -.5;
    log.rotation.z = 90 * Math.PI/180;
    log.position.x = 10;
    log.castShadow = true;
    log.receiveShadow = true;
    allLogs.push(log);
    logSpeeds.push(.02);
    myScene.add(log);
}

function carCollisionCheck()
{
    for (c = 0; c < 5; c++)
    {
        if (player.position.z <= carLanes1[c].position.z + 0.35 && player.position.z >= carLanes1[c].position.z - 0.35)
        {
            if (player.position.x < carLanes1[c].position.x + cCollide
                && player.position.x > carLanes1[c].position.x - cCollide)
            {
                killSound.play();
                newGame();
                // console.log("collision recorded");
            }
        }

        if (player.position.z <= carLanes2[c].position.z + 0.35 && player.position.z >= carLanes2[c].position.z - 0.35)
        {
            if (player.position.x < carLanes2[c].position.x + cCollide
                && player.position.x > carLanes2[c].position.x - cCollide)
            {
                killSound.play();
                newGame();
                // console.log("collision recorded");
            }
        }

        if (player.position.z <= carLanes3[c].position.z + 0.35 && player.position.z >= carLanes3[c].position.z - 0.35)
        {
            if (player.position.x < carLanes3[c].position.x + cCollide
                && player.position.x > carLanes3[c].position.x - cCollide)
            {
                killSound.play();
                newGame();
                // console.log("collision recorded");
            }
        }

        if (player.position.z <= carLanes4[c].position.z + 0.35 && player.position.z >= carLanes4[c].position.z - 0.35)
        {
            if (player.position.x < carLanes4[c].position.x + cCollide
                && player.position.x > carLanes4[c].position.x - cCollide)
            {
                killSound.play();
                newGame();
                // console.log("collision recorded");
            }
        }
    }
}

function logCollisionCheck()
{

    logLaneFlag = false;
    for (l = 0; l < allLogs.length; l++)
    {
        if (player.position.z <= allLogs[l].position.z + 0.4 && player.position.z >= allLogs[l].position.z - 0.4)
        {
            logLaneFlag = true;
            if (player.position.x <= allLogs[l].position.x + 1.50 && player.position.x >= allLogs[l].position.x - 1.50)
            {
                logCollisionFlag = true;
                currentLogIndex = l;
                player.position.y = 0.65;
                return;
            }
        }
    }
    if (logLaneFlag)
    {
        logCollisionFlag = false;
        killSound.play();
        newGame();
    }

}

function drivePlayer()
{
    if(logCollisionFlag)
    {
        if (logSpeeds[currentLogIndex] > 0) {
            if (player.position.x <= 14) {
                player.position.x += logSpeeds[currentLogIndex];

            }

        }
        else {
            if (player.position.x >= -14) {
                player.position.x += logSpeeds[currentLogIndex];
            }

        }
    }
}

function updateScore()
{
    var myScorePanel = document.getElementById('innerScoreField');
    myScorePanel.innerHTML = zmax;
}

function init()
{
    carLanePopulator();
    logPopulator();
    render();
}

function render()
{
    requestAnimationFrame(render);
    drive();
    carCollisionCheck();
    logCollisionCheck();
    updateScore();
    drivePlayer();
    myRenderer.render(myScene, myCamera);
}

init();




