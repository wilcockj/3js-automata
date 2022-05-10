import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import './style.css'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import hdr from './envmap.hdr?url';
import {Pane} from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

// TODO colors based on distance from center
// need to do CA rules as discussed here https://softologyblog.wordpress.com/2019/12/28/3d-cellular-automata-3/
/*Rule 445 is the first rule in the video and shown as 4/4/5/M. This is fairly standard survival/birth CA syntax.
The first 4 indicates that a state 1 cell survives if it has 4 neighbor cells.
The second 4 indicates that a cell is born in an empty location if it has 4 neighbors.
The 5 means each cell has 5 total states it can be in (state 4 for newly born which then fades to state 1 and then state 0 for no cell)
M means a Moore neighborhood.*/
//Add gap inbetween cubes
function initCube(x,y,z){
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshStandardMaterial({ color: field.color, roughness: 0.5});
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
  cube.position.set(x,y,z);
  return cube.uuid;
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

function initCubeArray(){
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
  var obj = {
    cubeGrid: cubeGrid,
    cubeArray: cubeArray
  };
  return obj;
}

function deleteCubeArray(cubeArray){
  for (var x in cubeArray){
    for (var y in cubeArray){
      for (var z in cubeArray){
        const obj = scene.getObjectByProperty('uuid', cubeArray[x][y][z]);
        obj.geometry.dispose();
        obj.material.dispose();
        scene.remove(obj)
        }
      }
  }

}


const loader = new RGBELoader();
loader.load( hdr, function ( texture ) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;

});

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
renderer.outputEncoding = THREE.sRGBEncoding;

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.set( 0, 20, 20 );
scene.add(camera);

const controls = new OrbitControls( camera, renderer.domElement );

var field = {size: 7, color: 0x7f4d9f};

var {cubeGrid,cubeArray} = initCubeArray();
console.log(cubeArray);
updateGrid(cubeGrid);

//event listener for window resize
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

const pane = new Pane();
pane.registerPlugin(EssentialsPlugin);
const fpsGraph = pane.addBlade({
  view: 'fpsgraph',
  label: 'FPS',
});

const automataControls = pane.addFolder({
  title: "Automata Controls"
});
const sizeInput = automataControls.addInput(field, 'size', {
  label: "Size",
  min: 5,
  max: 30,
  step: 1,
});
sizeInput.on('change', function(ev) {
  //console.log(`change: ${ev.value}`);
  //clear last cube array and its objs
  //initCubeArray();
  deleteCubeArray(cubeArray);
  cubeArray = null;
  cubeGrid = null;
  var {cubeGrid,cubeArray} = initCubeArray();
  console.log(cubeArray);
});
const colorInput = automataControls.addInput(field, 'color', {
  view: 'color',
  picker: 'inline',
  expanded: false,
  label: "Color",
});
colorInput.on('change', function(ev) {
  scene.traverse ( function( child ) {
    if ( child instanceof THREE.Mesh ) {
      child.material.color.setHex(field.color);  
    }
  });
});

const camControls = pane.addFolder({
  title: "Camera Controls",
  expanded: false,
});
camControls.addInput(renderer, 'toneMappingExposure', {
  label: "Exposure",
  min: 0,
  max: 3,
  step: 0.1,
});
camControls.addInput(camera, 'fov', {
  label: "FOV",
  min: 20,
  max: 120,
  step: 1,
});

function animate() {
  fpsGraph.begin();
  camera.updateProjectionMatrix();
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );
  
  var x = getRandomInt(field.size);
  var y = getRandomInt(field.size);
  var z = getRandomInt(field.size);
  var cube = scene.getObjectByProperty("uuid", cubeArray[x][y][z]);
  
  if (cube.visible){
    cube.visible = false;
  }
  else{
    cube.visible = true;
  }
  
  fpsGraph.end();
}
animate();
