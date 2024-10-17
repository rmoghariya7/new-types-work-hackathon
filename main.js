import "./style.css";
import * as THREE from "three";
import gsap from "gsap";

const sizes = {
  height: window.innerHeight,
  width: window.innerWidth,
};

// canvas
const canvas = document.querySelector("canvas.webgl");

// scene
const scene = new THREE.Scene();

// camera
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

// Objects
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("textures/gradients/8.png");
const gradientTexture = textureLoader.load("textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

// Material
const material = new THREE.MeshToonMaterial({
  color: "#ffeded",
  gradientMap: gradientTexture,
});

const objectsDistance = 4;
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);
const objectMeshes = [mesh1, mesh2, mesh3];

const xPosition = window.innerWidth > 768 ? 2 : window.innerWidth > 500 ? 1 : 0;

mesh2.position.x = xPosition;
mesh1.position.x = -xPosition;
mesh3.position.x = xPosition;

mesh2.position.y = -0;
mesh1.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;

scene.add(mesh1, mesh2, mesh3);

// particles
const count = 200;
const position = new Float32Array(count * 3);
const particleGeometry = new THREE.BufferGeometry();
for (let i = 0; i < count; i++) {
  let i3 = i * 3;
  position[i3] = (Math.random() - 0.5) * 10;
  position[i3 + 1] =
    objectsDistance * 0.5 -
    Math.random() * objectsDistance * objectMeshes.length;
  position[i3 + 2] = (Math.random() - 0.5) * 10;
}
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(position, 3)
);
const particleMaterial = new THREE.PointsMaterial({
  size: 0.1,
  sizeAttenuation: true,
  alphaMap: particleTexture,
  alphaTest: 0.1,
  color: 0xfffffff,
});
const particleMesh = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleMesh);

// lights
const directionalLight = new THREE.DirectionalLight("#C75B7A", 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

// event listeners
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

let scrollY = window.scrollY;
let currentSection = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);

  if (newSection !== currentSection) {
    currentSection = newSection;
    gsap.to(objectMeshes[newSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+= 6",
      y: "+= 6",
      y: "+= 1.5",
    });
  }
});

// cursor
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

// renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();
let previousTime = 0;

// animate
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;
  // Render
  renderer.render(scene, camera);

  // Animate camera
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  // parallax
  const parallaxX = cursor.x;
  const parallaxY = -cursor.y;

  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * deltaTime;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * deltaTime;

  // Animate meshes
  for (const mesh of objectMeshes) {
    mesh.rotation.x += deltaTime * 0.2;
    mesh.rotation.y += deltaTime * 0.12;
  }

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
