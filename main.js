import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'
import Stats from 'stats.js'
import './style.css'
import { RGBMLoader } from 'three/examples/jsm/loaders/RGBMLoader.js';

// TODO colors based on distance from center
// need to do CA rules as discussed here https://softologyblog.wordpress.com/2019/12/28/3d-cellular-automata-3/
/*Rule 445 is the first rule in the video and shown as 4/4/5/M. This is fairly standard survival/birth CA syntax.
The first 4 indicates that a state 1 cell survives if it has 4 neighbor cells.
The second 4 indicates that a cell is born in an empty location if it has 4 neighbors.
The 5 means each cell has 5 total states it can be in (state 4 for newly born which then fades to state 1 and then state 0 for no cell)
M means a Moore neighborhood.*/
function initCube(x,y,z){
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshPhongMaterial( { color: 0xff00ff});
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
  cube.position.set(x,y,z)
  /*
  var outlineMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.BackSide } );
  var outlineMesh = new THREE.Mesh( geometry, outlineMaterial );
  outlineMesh.position.set(cube.position.x,cube.position.y,cube.position.z);
  outlineMesh.scale.multiplyScalar(1.1);
  scene.add( outlineMesh );
  */
  var obj = {
    cubehandle: cube
    //outlinehandle: outlineMesh
  };
  return obj;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function inRange(min,max,num){
  if (num < max && num >= min){
    return 1;
  }
  else{
    return 0;
  }
}

function checkNeighbors(cubeGrid,x,y,z){
  var neighbors = [[-1, -1, -1], [-1, -1, 0], [-1, -1, 1], [-1, 0, -1], [-1, 0, 0], [-1, 0, 1], [-1, 1, -1], [-1, 1, 0], [-1, 1, 1], [0, -1, -1], [0, -1, 0], [0, -1, 1], [0, 0, -1], [0, 0, 1], [0, 1, -1], [0, 1, 0], [0, 1, 1], [1, -1, -1], [1, -1, 0], [1, -1, 1], [1, 0, -1], [1, 0, 0], [1, 0, 1], [1, 1, -1], [1, 1, 0], [1, 1, 1]];
  var count = 0;
  for (var n in neighbors){

    var [nx,ny,nz] = [neighbors[n][0],neighbors[n][1],neighbors[n][2]];
    var curx = parseInt(x) + nx;
    var cury = parseInt(y) + ny;
    var curz = parseInt(z) + nz;
    if(inRange(0,field.size,curx) && inRange(0, field.size, cury) && inRange(0, field.size, curz)){
      //console.log(cubeGrid[curx][cury][curz]);
      count += cubeGrid[curx][cury][curz];
    }
  }
  return count
}

function updateGrid(cubeGrid){
  var arrcopy = Array.from(cubeGrid);
  for (var x in cubeGrid){
    for (var y in cubeGrid[x]){
      for (var z in cubeGrid[x][y]){
        var count = checkNeighbors(cubeGrid, x, y, z);
        //console.log(count);
        }
      }
  }

}

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
var pointLight = new THREE.PointLight( 0xffffff );
pointLight.position.set(1,1,2);
camera.add(pointLight);
scene.add(camera);

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

const controls = new OrbitControls( camera, renderer.domElement );

var field = {size: 5};

var cubeGrid = new Array();
var cubeArray = new Array();
for (let x = 0; x < field.size; x++){
  cubeGrid[x] = new Array();
  cubeArray[x] = new Array();
  for (let y = 0; y < field.size ; y++){
    cubeGrid[x][y] = new Array();
    cubeArray[x][y] = new Array();
    for (let z = 0; z < field.size; z++){
      var cellstate = Math.round(Math.random());
      cubeGrid[x][y][z] = cellstate;

      let cubeobj = initCube(x,y,z)

      cubeArray[x][y][z] = cubeobj;

    }
  }
}
updateGrid(cubeGrid);

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 0, 20, 20 );
controls.update();

//event listener for window resize
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

const gui = new GUI();
const mainFolder = gui.addFolder('Controls');
mainFolder.add(field, 'size', 1, 50, 1);
mainFolder.open();

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

function animate() {
  stats.begin()
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );
  var x = getRandomInt(field.size);
  var y = getRandomInt(field.size);
  var z = getRandomInt(field.size);
  if (cubeArray[x][y][z].cubehandle.visible){
  cubeArray[x][y][z].cubehandle.visible = false;
  }
  else{
  cubeArray[x][y][z].cubehandle.visible = true;
  }
  stats.end()
}
animate();
