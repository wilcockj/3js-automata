import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

function initCube(x,y,z){
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
  cube.position.set(x,y,z)
  var outlineMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );
  var outlineMesh = new THREE.Mesh( geometry, outlineMaterial );
  outlineMesh.position.set(cube.position.x,cube.position.y,cube.position.z);
  outlineMesh.scale.multiplyScalar(1.1);
  scene.add( outlineMesh );
  return { cube, outlineMesh };

}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

const controls = new OrbitControls( camera, renderer.domElement );

var n = 10;

var cubeGrid = new Array();

var cubeArray = new Array();
for (let x = 0; x < n; x++){
  cubeGrid[x] = new Array();
  cubeArray[x] = new Array();
  for (let y = 0; y < n ; y++){
    cubeGrid[x][y] = new Array();
    cubeArray[x][y] = new Array();
    for (let z = 0; z < n; z++){
      cubeGrid[x][y][z] = 0;

      let {cubeobj, outlineobj} = initCube(x,y,z)

      const cell = {
        cube: cubeobj,
        outlinemesh: outlineobj,
      };
      cubeArray[x][y][z] = cell;


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

function animate() {

	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );

}
animate();
