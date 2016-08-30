import 'src/index.css';
import {Scene, PerspectiveCamera, WebGLRenderer, PlaneGeometry, MeshStandardMaterial, AmbientLight, DirectionalLight, Mesh, Vector3, DoubleSide} from 'three';


function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleResize);


const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new WebGLRenderer({
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
render();


camera.position.set(0, 100, 0);
camera.lookAt(new Vector3(0, 100, 0));

const light = new DirectionalLight(0xffffff, 0.5);
light.position.set(-1, 1, 0);
scene.add(light);

const light2 = new AmbientLight(0xffffff, 0.5);
scene.add(light2);

const width = 370;
const height = 466;
const worldWidth = 10000;

const scale = worldWidth / width;

const terrainGeometry = new PlaneGeometry(width * scale, height * scale, width - 1, height - 1);
const terrainMaterial = new MeshStandardMaterial({
  color: 0x88aa88,
  side: DoubleSide,
  roughness: 0.8,
  metalness: 0.2,
});
const terrainMesh = new Mesh(terrainGeometry, terrainMaterial);
terrainMesh.rotateX(-Math.PI / 2);
console.log('ho', terrainMesh.rotation);
scene.add(terrainMesh);

fetch('SanFranciscoNorth.bin').then(response => response.arrayBuffer()).then(response => {
  const tif = new Uint16Array(response);
  window.tif = tif;
  window.vertices = terrainGeometry.vertices;
  console.log('hi', response, tif);

  terrainGeometry.vertices.forEach((vertex, i) => {
    vertex.z = tif[i] * 0.1 * scale;
  });
  terrainGeometry.verticesNeedUpdate = true;
  terrainGeometry.computeFaceNormals();
  terrainGeometry.computeVertexNormals();
});

const waterGeometry = new PlaneGeometry(width * scale, height * scale, width - 1, height - 1);
const waterMaterial = new MeshStandardMaterial({
  color: 0x0000ff,
  side: DoubleSide,
  roughness: 0.5,
  metalness: 0.8,
});
const waterMesh = new Mesh(waterGeometry, waterMaterial);
waterMesh.rotateX(-Math.PI / 2);
scene.add(waterMesh);


let dir = camera.getWorldDirection();
let sideDir = new Vector3(dir.z, 0, dir.x);

window.addEventListener('wheel', event => {
  event.preventDefault();

  dir = camera.getWorldDirection(dir);
  sideDir.set(dir.z, 0, dir.x);

  if (event.shiftKey) {
    /*
    terrainMesh.position.x += event.deltaX * 0.1;
    terrainMesh.position.z += event.deltaY * 0.1;
    */
    camera.position.y += event.deltaY * 0.1;
  } else if (event.altKey) {
    //camera.rotation.x += event.deltaY * 0.01;
    camera.rotation.y += event.deltaX * 0.01;
  } else {
    camera.position.addScaledVector(dir, event.deltaY);
    camera.position.addScaledVector(sideDir, event.deltaX);
    /*
    terrainMesh.position.x += event.deltaX * 0.1;
    terrainMesh.position.y += event.deltaY * 0.1;
    */
  }
});

