import 'src/index.css';
import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, PlaneGeometry, MultiMaterial, MeshBasicMaterial, MeshStandardMaterial, TextureLoader, AmbientLight, DirectionalLight, Mesh, Vector3, Vector2, BackSide, DoubleSide, Fog, FogExp2} from 'three';
import {vec2, vec3} from 'src/vector';
import {load as loadAtlas} from 'src/atlas-texture';


const fogColor = 0x777777;
const lightColor = 0xFFC361;


function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleResize);


const topScene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new WebGLRenderer({
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

//scene.fog = new Fog(fogColor, 1, 2000);
topScene.fog = new FogExp2(fogColor, 0.0005);
renderer.setClearColor(fogColor);

document.body.appendChild(renderer.domElement);

function render() {
  requestAnimationFrame(render);
  renderer.render(topScene, camera);
}
render();


camera.position.set(0, 0, 0);
camera.lookAt(new Vector3(0, 0, 1));

const light = new DirectionalLight(lightColor, 0.5);
light.position.set(-1, 1, 0);
topScene.add(light);

const light2 = new AmbientLight(lightColor, 0.5);
topScene.add(light2);

const width = 370;
const height = 466;
const worldWidth = 10000;

const scale = worldWidth / width;

const terrainScene = new Scene();
terrainScene.position.y = -50;
window.terrainScene = terrainScene;
topScene.add(terrainScene);

const terrainGeometry = new PlaneGeometry(width * scale, height * scale, width - 1, height - 1);
const terrainMaterial = new MeshStandardMaterial({
  color: 0x88aa88,
  side: DoubleSide,
  roughness: 0.8,
  metalness: 0.2,
});
const terrainMesh = new Mesh(terrainGeometry, terrainMaterial);
terrainMesh.rotateX(-Math.PI / 2);
terrainScene.add(terrainMesh);

fetch('SanFranciscoNorth.bin').then(response => response.arrayBuffer()).then(response => {
  const tif = new Uint16Array(response);

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
terrainScene.add(waterMesh);

loadAtlas('above-the-sea.jpg').then(textures => {
  const materials = textures.map(texture => new MeshBasicMaterial({
    map: texture,
    side: BackSide,
  }));
  const skyMaterial = new MultiMaterial(materials);
  const skyGeometry = new BoxGeometry(100, 100, 100);

  materials.forEach((material, i) => {
    skyGeometry.faces[i * 2].materialIndex = i;
    skyGeometry.faces[i * 2 + 1].materialIndex = i;
  });
  //skyGeometry.elementsNeedUpdate = true;
  skyGeometry.groupsNeedUpdate = true;

  const testMaterial = new MeshBasicMaterial({map: textures[0]});
  const skyMesh = new Mesh(skyGeometry, skyMaterial);

  topScene.add(skyMesh);
});


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
    terrainScene.position.y += event.deltaY * 0.1;
  } else if (event.altKey) {
    topScene.rotation.x -= event.deltaY * 0.01;
    topScene.rotation.y += event.deltaX * 0.01;
  } else {
    terrainScene.position.addScaledVector(dir, event.deltaY);
    terrainScene.position.addScaledVector(sideDir, event.deltaX);
    /*
    terrainMesh.position.x += event.deltaX * 0.1;
    terrainMesh.position.y += event.deltaY * 0.1;
    */
  }
});

