import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

const controls = new OrbitControls( camera, renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
var cube1 = new THREE.Mesh( geometry, material );
scene.add( cube1 );
cube1.position.set(0,1,0)
var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );
var outlineMesh1 = new THREE.Mesh( geometry, outlineMaterial1 );
outlineMesh1.position.set(cube1.position.x,cube1.position.y,cube1.position.z);
outlineMesh1.scale.multiplyScalar(1.02);
scene.add( outlineMesh1 );

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 0, 2, 10 );
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
