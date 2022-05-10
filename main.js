import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'
import Stats from 'stats.js'
import './style.css'

function initCube(x,y,z){
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x0000ff});
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
  cube.position.set(x,y,z)
  var outlineMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );
  var outlineMesh = new THREE.Mesh( geometry, outlineMaterial );
  outlineMesh.position.set(cube.position.x,cube.position.y,cube.position.z);
  outlineMesh.scale.multiplyScalar(1.1);
  scene.add( outlineMesh );
  var obj = {
    cubehandle: cube,
    outlinehandle: outlineMesh
  };
  return obj;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

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
      cubeGrid[x][y][z] = 0;

      let cubeobj = initCube(x,y,z)

      cubeArray[x][y][z] = cubeobj;

    }
  }
}

var neighbors = [[-1, -1, -1], [-1, -1, 0], [-1, -1, 1], [-1, 0, -1], [-1, 0, 0], [-1, 0, 1], [-1, 1, -1], [-1, 1, 0], [-1, 1, 1], [0, -1, -1], [0, -1, 0], [0, -1, 1], [0, 0, -1], [0, 0, 1], [0, 1, -1], [0, 1, 0], [0, 1, 1], [1, -1, -1], [1, -1, 0], [1, -1, 1], [1, 0, -1], [1, 0, 0], [1, 0, 1], [1, 1, -1], [1, 1, 0], [1, 1, 1]]
console.log(cubeArray)
console.log(neighbors)

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
  cubeArray[x][y][z].cubehandle.visible = false;
  cubeArray[x][y][z].outlinehandle.visible = false;
  stats.end()
}
animate();
