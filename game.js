var container, eingabe, canvasDown, currentCanvasRow, currentCanvasCol, ctx, c, difficulty, score, fruit, beginningBlockNumber, gameLost, direction, doUpdatem, wall, material, material2, geometrysnake, texturesnake, texturesnakehead, edges, edges2, edges3, edges4, mesh, wall2, material2, mesh2, wall3, material3, mesh3, wall4, material4, mesh4, texture, helper, controls, OrbitControls, sun, camerasettings, camerasettings2;
var cameramode = "ThirdPerson";
var geometrysnake, geometrysnakehead;
var materialsnake, materialsnakehead;

var materialapple;
var geometryapple = new THREE.SphereGeometry(0.05, 32, 32);
var controls;
var renderer_left, renderer_right;
var scene_left, scene_right;
var camera_left, camera_right;
// first is player 
var snakes_left = [];
var snakes_right = [];
snakes_left[0] = [];
snakes_right[0] = [];
snakes_left[1] = [];
snakes_right[1] = [];
var tick; //interval
fruit = [];

TILE_SIZE = 0.1;
direction = 'l';
difficulty = 'EASY'
responsive = true;
gameOver = false;
moved = false;
needNewApple = false;
over_shoulder = false;
pause = false;
snake_height = 0.06; // half snake height
beginningBlockNumber = 3;
cameraLoc = { x: 0, y: -2, z: 7 };
rotationDegree_left = { val: 0 };
rotationDegree_right = { val: 0 };
var board_left = []; // marks N: empty S: snake A: apple
for (var i = 0; i < 40; i++) {
    board_left[i] = [];
    for (var j = 0; j < 40; j++) {
        board_left[i][j] = { type: 'N', mesh: null };

    }
}

var board_right = [];
for (var i = 0; i < 40; i++) {
    board_right[i] = [];
    for (var j = 0; j < 40; j++) {
        board_right[i][j] = { type: 'N', mesh: null };

    }
}


function getInterval() {
    if (difficulty == "EASY") {
        wait = 350;
    } else if (difficulty == "MEDIUM") {
        wait = 200;
    } else if (difficulty == "HARD") {
        wait = 90;
    } else {
        wait = 1000;
    }
    return wait;
}
function init() {
    document.addEventListener("keydown", onDocumentKeyDown, false);
    left_container = document.getElementById("left");
    right_container = document.getElementById("right");
    WIDTH = left_container.offsetWidth;
    HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.01, FAR = 10000;

    // Left View
    renderer_left = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer_left.setSize(0.9 * WIDTH , 0.9 * HEIGHT);
    left_container.append(renderer_left.domElement);
    camera_left = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera_left.position.set(cameraLoc.x, cameraLoc.y, cameraLoc.z);
    scene_left = new THREE.Scene();
     camera_left.lookAt(scene_left.position);
    scene_left.add(camera_left);

    //Right View
    renderer_right = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer_right.setSize(0.8 * WIDTH, 0.8 * HEIGHT);
    right_container.append(renderer_right.domElement);
    camera_right = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera_right.position.set(cameraLoc.x, cameraLoc.y, cameraLoc.z);
    scene_right = new THREE.Scene();
    camera_right.lookAt(scene_right.position);
    scene_right.add(camera_right);

    // Add Objects
    genApples(); // both left and right are same
    addObjects(scene_left);
    addObjects(scene_right);
    for(var i = 0; i < snakes_left.length; i++){
        genSnakes(i)
    }


    tick = setInterval(function () {
        moved = !gameOver;
    }, getInterval());
    animate();
}
function addObjects(scene) {
    createWalls(scene);
    createGrid(scene);
}
function animate() {
    requestAnimationFrame(animate);
    if (moved) {
        if (gameOver) {
            // clearInterval(tick);
            moved = false;
            window.prompt("Game Over!! Record Your Name: ", "Lin Zhu");

        } else {
                    //first camera
            
            update(scene_left, board_left, snakes_left[0], rotationDegree_left);
            updateFirstCamera(camera_left);
            update(scene_right, board_right, snakes_right[0], rotationDegree_right);
            
            if (needNewApple) {
                oneApple(materialapple);
                needNewApple = false;
            }
            moved = false;
            responsive = true;
        }

    }
    renderer_left.render(scene_left, camera_left);
    renderer_right.render(scene_right, camera_right);
}

function update(scene, board, meshes, rotationDegree) {
    var oldtail = {}
    oldtail.x = meshes[meshes.length - 1].position.x;
    oldtail.y = meshes[meshes.length - 1].position.y;

    if (direction == "r") {
        right(meshes);

    } else if (direction == "l") {
        left(meshes);
    } else if (direction == "u") {
        up(meshes);

    } else if (direction == "d") {
        down(meshes);
    }

    // Apple or Gameover
    if (rotationDegree.val != 0) meshes[0].rotation.y += rotationDegree.val;
    rotationDegree.val = 0;

    var i = toIndex(meshes[0].position.y);
    var j = toIndex(meshes[0].position.x);
    if (i < 0 || j < 0 || i > 39 || j > 39) {
        gameOver = true;
    } else {
        var headCell = board[i][j];
        if (headCell.type == 'A') { //apple
            scene.remove(headCell.mesh); //remove apple
            headCell.type = 'S';
            headCell.mesh = null;
            needNewApple = true;
            var tail = new THREE.Mesh(geometrysnake, materialsnake);
            tail.position.x = oldtail.x;
            tail.position.y = oldtail.y;
            meshes.push(tail);
            scene.add(tail);
        }
        else if (headCell.type == 'S') {
            gameOver = true;
        } else if (headCell.type == 'N') {
            headCell.type = 'S';
            var ti = toIndex(oldtail.y);
            var tj = toIndex(oldtail.x);
            board[ti][tj].type = 'N';
        }
    }
}

function updateFirstCamera(camera) {
    camera.fov  = 120;
    meshes = snakes_left[0];
    if (meshes.length != 0) {
        head = meshes[0];
        camera.position.set(head.position.x, head.position.y, 1.3*snake_height);
        if (direction == "r") {
            var lookatvecter = new THREE.Vector3(4, head.position.y, snake_height);
            camera.lookAt(lookatvecter);
            // console.log(camera.rotation.x )
            camera.rotation.x = Math.PI / 2;
            // camera.rotation.y = Math.PI / 2;
        } else if (direction == "l") {
            var lookatvecter = new THREE.Vector3(-4, head.position.y, snake_height);
            camera.lookAt(lookatvecter);
            // console.log(camera.rotation.x )
            camera.rotation.x = Math.PI / 2;
            // console.log(camera.rotation.x )

        } else if (direction == "u") {
            var lookatvecter = new THREE.Vector3(head.position.x, 4, snake_height);
            camera.lookAt(lookatvecter);
            // console.log(camera.rotation.x )
        } else if (direction == "d") {
            var lookatvecter = new THREE.Vector3(head.position.x, -4, snake_height);
            camera.lookAt(lookatvecter);
            camera.rotation.z = Math.PI;
        }
        camera.updateProjectionMatrix();
    }
}



function onDocumentKeyDown(event) {
    var keyCode = event.code;
    //alert(keyCode);
    if (responsive) {
        if (keyCode == 'ArrowUp' && (direction == 'l' || direction == 'r')) {
            if (direction == 'l') {
                rotationDegree_left.val = Math.PI / 2;
                rotationDegree_right.val = Math.PI / 2;
            }
            else {
                rotationDegree_left.val = -Math.PI / 2;
                rotationDegree_right.val = -Math.PI / 2;
            }
            direction = 'u';
            responsive = false;
        } else if (keyCode == 'ArrowLeft' && (direction == 'd' || direction == 'u')) { //LEFT
            if (direction == 'd') {
                rotationDegree_left.val = Math.PI / 2;
                rotationDegree_right.val = Math.PI / 2;
            }
            else {
                rotationDegree_left.val = -Math.PI / 2;
                rotationDegree_right.val = -Math.PI / 2;
            }
            direction = "l";
            responsive = false;

        } else if (keyCode == 'ArrowRight' && (direction == 'd' || direction == 'u')) { //RIGHT
            if (direction == 'u') {
                rotationDegree_left.val = Math.PI / 2;
                rotationDegree_right.val = Math.PI / 2;
            }
            else {
                rotationDegree_left.val = -Math.PI / 2;
                rotationDegree_right.val = -Math.PI / 2;
            }
            direction = "r";
            responsive = false;
        } else if (keyCode == 'ArrowDown' && (direction == 'l' || direction == 'r')) {
            if (direction == 'r') {
                rotationDegree_left.val = Math.PI / 2;
                rotationDegree_right.val = Math.PI / 2;
            }
            else {
                rotationDegree_left.val = -Math.PI / 2;
                rotationDegree_right.val = -Math.PI / 2;
            }
            direction = 'd';
            responsive = false;
        }
        //For Over-shoulder View
        if (keyCode == 'KeyA') {  //First Person View: Turn Left
            responsive = false;
            rotationDegree_left.val = -Math.PI / 2;
            rotationDegree_right.val = -Math.PI / 2;

            if (direction == "u") {
                direction = "l";
            } else if (direction == "d") {
                direction = "r";
            } else if (direction == "l") {
                direction = "d";
            } else if (direction == "r") {
                direction = "u";
            }
        } else if (keyCode == 'KeyD') { //First Person View: Turn Right
            responsive = false;
            rotationDegree_left.val = Math.PI / 2;
            rotationDegree_right.val = Math.PI / 2;
            if (direction == "u") {
                direction = "r";
            } else if (direction == "d") {
                direction = "l";
            } else if (direction == "l") {
                direction = "u";
            } else if (direction == "r") {
                direction = "d";
            }
        }
        // Pause
        if (keyCode == 'Space') {
            if (!pause) {
                clearInterval(tick);
                moved = false;
            } else {
                tick = setInterval(function () {
                    moved = !gameOver;  // move is true in game
                }, getInterval());
            }
            pause = !pause;
        }
    }
}



function takeBodyParts(meshes) {
    for (var i = meshes.length - 1; i > 0; i--) {
        meshes[i].position.x = meshes[i - 1].position.x;
        meshes[i].position.y = meshes[i - 1].position.y;
    }

}

function right(meshes) {

    console.log("GO RIGHT");
    takeBodyParts(meshes);
    meshes[0].position.x += 0.1;
}

function left(meshes) {
    console.log("GO LEFT");

    takeBodyParts(meshes);

    meshes[0].position.x -= 0.1;

}

function up(meshes) {
    console.log("GO UP");

    takeBodyParts(meshes);

    meshes[0].position.y += 0.1;

}

function down(meshes) {
    console.log("GO DOWN");

    takeBodyParts(meshes);
    meshes[0].position.y -= 0.1;

}


function createGrid(scene) {
    helper = new THREE.GridHelper(4, 40, 0x088888, 0x888888);
    helper.position.x = 0;
    helper.position.y = 0;
    helper.position.z = 0;
    helper.material.opacity = 100;
    helper.material.transparent = true;
    helper.rotation.x = Math.PI / 2;
    helper.rotation.y = 0;
    scene.add(helper);
}

function createWalls(scene) {
    var loader = new THREE.TextureLoader();
    loader.load(
        // resource URL
        'data:image/jpeg;base64,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',
        // Function when resource is loaded
        function (texture) {
            // do something with the texture

            material = new THREE.MeshBasicMaterial({
                color: 0xf24343,
                map: texture,
                transparent: false
            });
            material2 = new THREE.MeshBasicMaterial({
                color: 0x54575b,
                map: texture,
                transparent: false
            });
            material3 = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                map: texture,
                transparent: false
            });
            material4 = new THREE.MeshBasicMaterial({
                color: 0x058e1a,
                map: texture,
                transparent: false
            });
            //4*4 area
            //wall thinness 0.1
            wall = getCube(4.2, 0.1, 0.28, material, { x: 0, y: 2.05, z: 0.14 });//up
            wall2 = getCube(4.2, 0.1, 0.28, material2, { x: 0, y: -2.05, z: 0.14 });//down
            wall3 = getCube(0.1, 4.2, 0.28, material3, { x: 2.05, y: 0, z: 0.14 });//right
            wall4 = getCube(0.1, 4.2, 0.28, material4, { x: -2.05, y: 0, z: 0.14 });//left

            scene.add(wall);
            scene.add(wall2);
            scene.add(wall3);
            scene.add(wall4);
        }
    );

}


function genSnakes(idx) {
    var loader = new THREE.TextureLoader();
    loader.load(
        // resource URL  
        //'res/snake.png',
        'data:image/jpeg;base64,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', // Function when resource is loaded
        //'res/snake.png',
        function (texture) {

            geometrysnake = new THREE.BoxGeometry(0.1, 0.1, snake_height);//0.1/sqrt(3) 0.057735
            geometrysnakehead = new THREE.CylinderGeometry(0.057735, 0.057735, snake_height, 3)

            materialsnake = new THREE.MeshBasicMaterial({ color: 0x087a2c, map: texture, transparent: true });
            materialsnakehead = new THREE.MeshBasicMaterial({ color: 0xff0000, map: texture, transparent: true });
            
            var row = THREE.Math.randInt(0, 39);
            var col = THREE.Math.randInt(3, 37);

            for (var i = 0; i < beginningBlockNumber; i++) {
                if (i == 0) {
                    snakes_left[idx][i] = new THREE.Mesh(geometrysnakehead, materialsnakehead);
                    snakes_left[idx][i].rotation.y = -Math.PI / 2;
                    snakes_left[idx][i].rotation.x = -Math.PI / 2;
                    snakes_right[idx][i] = new THREE.Mesh(geometrysnakehead, materialsnakehead);
                    snakes_right[idx][i].rotation.y = -Math.PI / 2;
                    snakes_right[idx][i].rotation.x = -Math.PI / 2;
                } else {
                    snakes_left[idx][i] = new THREE.Mesh(geometrysnake, materialsnake);
                    snakes_right[idx][i] = new THREE.Mesh(geometrysnake, materialsnake);
                    
                }
                
                board_left[row][col] = { type: 'S', mesh: null };
                board_right[row][col] = { type: 'S', mesh: null };
                snakes_left[idx][i].position.x = toCoord(col);
                snakes_right[idx][i].position.x = toCoord(col);
                snakes_left[idx][i].position.y = toCoord(row);
                snakes_right[idx][i].position.y = toCoord(row);
                scene_left.add(snakes_left[idx][i]);
                scene_right.add(snakes_right[idx][i]);
                col++;
            }


        }
    );
}

function genApples() {
    var loader = new THREE.TextureLoader();
    loader.load(
        // resource URL
        'data:image/jpeg;base64,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',
        // Function when resource is loaded

        function (texture) {
            // do something with the texture
            materialapple = new THREE.MeshBasicMaterial({
                // color: 0xA0522D,
                map: texture,
                transparent: false
            });

            for (var z = 0; z < 5; z++) {
                oneApple(materialapple);
            }
        }
    );

}
function oneApple(materialapple) {

    //materialfruit = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    var apple = new THREE.Mesh(geometryapple, materialapple);
    var row = THREE.Math.randInt(0, 39);
    var col = THREE.Math.randInt(0, 39);
    apple.position.z = 0.05;
    // row = 20;
    // col = 17;
    apple.position.y = toCoord(row);
    apple.position.x = toCoord(col);

    var copy = new THREE.Mesh(geometryapple, materialapple);
    copy.position.z = apple.position.z
    copy.position.y = apple.position.y
    copy.position.x = apple.position.x
    board_left[row][col] = { type: 'A', mesh: apple };
    board_right[row][col] = { type: 'A', mesh: copy };

    scene_left.add(apple);
    scene_right.add(copy);
}

function toIndex(x) {
    x -= 0.05;
    x /= 0.1;

    x += 20
    return Math.round(x);
}
function toCoord(i) {
    i -= 20;
    i *= 0.1;
    i += 0.05;
    return Math.round(i * 100) / 100;
}
function getCube(w, l, d, material, position) {
    var geometry = new THREE.BoxGeometry(w, l, d);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    return mesh;
}

