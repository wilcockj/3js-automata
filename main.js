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
//for gap instead of redrawing just change position with the multiplier, v low priority though

const survivalThreshold = 4;
const birthThreshold = 4;
const lifespan = 5;

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
function distFromCenter(x,y,z){
  var midx,midy,midz;
  midx = midy = midz = Math.floor(field.size / 2) * field.spacing;
  var dist = Math.sqrt(Math.pow(x-midx,2) + Math.pow(y-midy,2) + Math.pow(z-midz,2));
  var maxdist = Math.sqrt(3*Math.pow(midx,2));
  return dist/maxdist;
}

// TODO: if r, g, or b is 0, for some reason the cube wont render.
function distToColor(obj){
  var pos = obj.position;
  var distScale = distFromCenter(pos.x * field.spacing,pos.y * field.spacing,pos.z * field.spacing);
  var rgbcolor = hexToRgb(field.color.toString(16));
  var newrgb = [(rgbcolor.r/255*distScale),(rgbcolor.g/255*distScale),(rgbcolor.b/255*distScale)];
  obj.material.color.setRGB(newrgb[0],newrgb[1],newrgb[2]);
  return obj;
}

function initCube(x,y,z,count,cubeInstances){
  var distScale = distFromCenter(x * field.spacing, y * field.spacing, z * field.spacing);
  var rgbcolor = hexToRgb(field.color.toString(16));
  var newrgb = [(rgbcolor.r/255*distScale),(rgbcolor.g/255*distScale),(rgbcolor.b/255*distScale)];
  const color = new THREE.Color();
  color.setRGB(newrgb[0],newrgb[1],newrgb[2]);
  const dummy = new THREE.Object3D();
  const _position = new THREE.Vector3(x * field.spacing,y * field.spacing ,z * field.spacing);
  dummy.position.copy(_position);
  dummy.scale.set(1,1,1);
  dummy.updateMatrix();
  cubeInstances.setMatrixAt(count,dummy.matrix);
  cubeInstances.setColorAt(count,color)
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
          //console.log(cubeGrid[x][y][z]);
          if (cubeGrid[x][y][z] == 1 && count == survivalThreshold) {
              // 
          }
          else if(cubeGrid[x][y][z] == 1){
            arrcopy[x][y][z] -= 1;
          }
          
          if (cubeGrid[x][y][z] == 0 && count >= birthThreshold) {
            arrcopy[x][y][z] = lifespan - 1;
          }
          if (cubeGrid[x][y][z] > 1){
            arrcopy[x][y][z] -= 1;
          }
          //console.log(arrcopy[x][y][z]);
        }
      }
  }
  cubeGrid = arrcopy;
  return cubeGrid;

}

function initCubeArray(){
  
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshStandardMaterial({ roughness: 0.5});
  cubeInstances = new THREE.InstancedMesh(geometry,material,Math.pow(field.size,3));

  var cubeGrid = new Array();
  var cubeArray = new Array();
  var count = 0; 
  for (let x = 0; x < field.size; x++){
    cubeGrid[x] = new Array();
    cubeArray[x] = new Array();
    for (let y = 0; y < field.size ; y++){
      cubeGrid[x][y] = new Array();
      cubeArray[x][y] = new Array();
      for (let z = 0; z < field.size; z++){
        cubeGrid[x][y][z] = 3;
        
        initCube(x,y,z,count,cubeInstances);

        cubeArray[x][y][z] = count;
        count += 1;
      }
    }
  }
  scene.add(cubeInstances);
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
camera.position.set( 20, 20, 20 );
scene.add(camera);

const controls = new OrbitControls( camera, renderer.domElement );

var field = {size: 10, color: 0x4f0000, spacing : 1.1};
var cubeInstances;
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
  min: 1,
  max: 50,
  step: 1,
});
sizeInput.on('change', function(ev) {
  //console.log(`change: ${ev.value}`);
  //clear last cube array and its objs
  //initCubeArray();
  scene.remove(cubeInstances);
  cubeInstances.dispose();
  var {cubeGrid,cubeArray} = initCubeArray();
});
const spacingInput = automataControls.addInput(field, 'spacing', {
  label: "Spacing",
  min: 1,
  max: 5,
  step: .1,
});
spacingInput.on('change', function(ev) {
  //console.log(`change: ${ev.value}`);
  //clear last cube array and its objs
  //initCubeArray();
  scene.remove(cubeInstances);
  cubeInstances.dispose();
  var {cubeGrid,cubeArray} = initCubeArray();
});

const colorInput = automataControls.addInput(field, 'color', {
  view: 'color',
  picker: 'inline',
  expanded: false,
  label: "Color",
});
colorInput.on('change', function(ev) {
  scene.remove(cubeInstances);
  cubeInstances.dispose();
  var {cubeGrid,cubeArray} = initCubeArray();
});

const camControls = pane.addFolder({
  title: "Camera Controls",
  expanded: false,
});
camControls.addInput(renderer, 'toneMappingExposure', {
  label: "Exposure",
  min: 0,
  max: 2,
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
   
  var i = getRandomInt(Math.pow(field.size,3));
  const m = new THREE.Matrix4();
  const dummy = new THREE.Object3D();
  cubeInstances.getMatrixAt(i,dummy.matrix);
  //scale cube /100 and then check first element of matrix
  //to see if it is "off" and scale *100 to return to normal
  dummy.matrix.setPosition(0,0,-1000); 
  cubeInstances.setMatrixAt(i,dummy.matrix);
  cubeInstances.instanceMatrix.needsUpdate = true;
  cubeGrid = updateGrid(cubeGrid);
  console.log(cubeGrid);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  fpsGraph.end();
}
animate();
