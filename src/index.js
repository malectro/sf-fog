import 'src/index.css';
import {Scene, PerspectiveCamera, WebGLRenderer, PlaneGeometry, MeshStandardMaterial, DirectionalLight, Mesh, Vector3, DoubleSide} from 'three';


function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleResize);


const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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


const light = new DirectionalLight(0xffffff, 0.5);
light.position.set(1, 1, 1);
scene.add(light);

const width = 370;
const height = 466;
const worldWidth = 100;

const scale = worldWidth / width;

const terrainGeometry = new PlaneGeometry(width * scale, height * scale, width - 1, height - 1);
const terrainMaterial = new MeshStandardMaterial({color: 0x88aa88, side: DoubleSide});
const terrainMesh = new Mesh(terrainGeometry, terrainMaterial);

scene.add(terrainMesh);
camera.position.set(0, -100, 100);
camera.lookAt(new Vector3(0, 0, 0));

fetch('SanFranciscoNorth.bin').then(response => response.arrayBuffer()).then(response => {
  const tif = new Uint16Array(response);
  window.tif = tif;
  window.vertices = terrainGeometry.vertices;
  console.log('hi', response, tif);

  terrainGeometry.vertices.forEach((vertex, i) => {
    vertex.z = tif[i] * 0.05;
  });
  terrainGeometry.verticesNeedUpdate = true;
  terrainGeometry.computeFaceNormals();
  terrainGeometry.computeVertexNormals();
});


window.addEventListener('wheel', event => {
  scene.rotation.x += event.deltaY * 0.01;
  scene.rotation.y += event.deltaX * 0.01;
});

