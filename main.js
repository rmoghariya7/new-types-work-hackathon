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
const count = 400;
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

// Mouse interaction for rotating all models independently
let isMouseDown = false;
let previousMousePosition = { x: 0, y: 0 };
let activeMesh = null; // Track the currently active mesh

window.addEventListener('mousedown', (event) => {
  isMouseDown = true;
  previousMousePosition = { x: event.clientX, y: event.clientY };

  // Check which mesh is clicked
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(objectMeshes);
  if (intersects.length > 0) {
    activeMesh = intersects[0].object; // Set the active mesh to the one clicked
  }
});

window.addEventListener('mousemove', (event) => {
  if (isMouseDown && activeMesh) {
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    };

    // Rotate the active mesh based on mouse movement
    activeMesh.rotation.y += deltaMove.x * 0.01; // Adjust sensitivity as needed
    activeMesh.rotation.x += deltaMove.y * 0.01; // Adjust sensitivity as needed

    previousMousePosition = { x: event.clientX, y: event.clientY };
  }
});

window.addEventListener('mouseup', () => {
  isMouseDown = false;
  activeMesh = null; // Reset active mesh on mouse up
});

// Optional: Prevent default behavior for the right mouse button
window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

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

// what you learn
const list = document.querySelector('.wyl-list');
const description = document.getElementById('description');

// Event delegation for mouseenter and mouseleave
list.addEventListener('mouseenter', function (event) {
  if (event.target.tagName === 'LI') {
    description.innerText = event.target.getAttribute('data-description');
    description.style.display = 'block'; // Show the description
    description.classList.remove('active'); // Remove active class for fade effect
    setTimeout(() => {
      description.classList.add('active'); // Add active class for fade effect
    }, 10); // Small timeout to trigger the transition
  }
}, true); // Use capture phase to ensure it captures the event

list.addEventListener('mouseleave', function (event) {
  if (event.target.tagName === 'LI') {
    // Delay hiding the description to prevent flickering
    setTimeout(() => {
      if (!description.classList.contains('active')) {
        description.classList.remove('active'); // Remove active class to fade out
        description.style.display = 'none'; // Hide after fade out
      }
    }, 300); // Match the duration of the fade out
  }
}, true); // Use capture phase

// Click event for the list items
list.addEventListener('click', function (event) {
  if (event.target.tagName === 'LI') {
    // Cool animation on click (e.g., shake effect)
    gsap.to(description, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 });
  }
});
