let scene, camera, renderer;
let stars = [];
let score = 0;
const moveSpeed = { current: 0.1, min: 0.05, max: 1 };
const rotationSpeed = 0.002;
const velocity = new THREE.Vector3();
const rotationVelocity = new THREE.Vector3();
const dampingFactor = 0.95;
const keysPressed = {};
const starCollectionSound = new Audio('star-collect.mp3');
const backgroundMusic = new Audio('background-music.mp3');
backgroundMusic.loop = true;

// Initialize the scene
init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Add stars to the scene
  const starShape = new THREE.Shape();
  starShape.moveTo(0, 0.5);
  starShape.lineTo(0.2, 0.2);
  starShape.lineTo(0.5, 0.2);
  starShape.lineTo(0.3, 0);
  starShape.lineTo(0.4, -0.3);
  starShape.lineTo(0, -0.1);
  starShape.lineTo(-0.4, -0.3);
  starShape.lineTo(-0.3, 0);
  starShape.lineTo(-0.5, 0.2);
  starShape.lineTo(-0.2, 0.2);
  starShape.lineTo(0, 0.5);

  const extrudeSettings = {
    depth: 0.1,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.1,
    bevelThickness: 0.1
  };

  for (let i = 0; i < 20; i++) {
    const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, wireframe: false });
    const star = new THREE.Mesh(geometry, material);
    star.position.set(Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50);
    scene.add(star);
    stars.push(star);
  }

  // Add a starfield background
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
  const starVertices = [];
  for (let i = 0; i < 10000; i++) {
    starVertices.push(Math.random() * 2000 - 1000);
    starVertices.push(Math.random() * 2000 - 1000);
    starVertices.push(Math.random() * 2000 - 1000);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);

  // Position the camera
  camera.position.z = 5;

  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('keydown', onDocumentKeyDown, false);
  document.addEventListener('keyup', onDocumentKeyUp, false);

  // Start background music
  backgroundMusic.play();
}

function animate() {
  requestAnimationFrame(animate);

  // Apply damping to velocity for smooth stop
  velocity.multiplyScalar(dampingFactor);
  rotationVelocity.multiplyScalar(dampingFactor);

  // Update camera position
  camera.translateX(velocity.x);
  camera.translateY(velocity.y);
  camera.translateZ(velocity.z);

  // Update camera rotation
  camera.rotation.x += rotationVelocity.x;
  camera.rotation.y += rotationVelocity.y;
  camera.rotation.z += rotationVelocity.z;

  // Rotate all stars for a dynamic effect
  stars.forEach(star => {
    star.rotation.x += 0.01;
    star.rotation.y += 0.01;
  });

  // Check for collisions with stars
  checkCollisions();

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentKeyDown(event) {
  keysPressed[event.key] = true;

  if (event.key === '+') {
    moveSpeed.current = Math.min(moveSpeed.current + 0.05, moveSpeed.max);
    updateHUD();
  } else if (event.key === '-') {
    moveSpeed.current = Math.max(moveSpeed.current - 0.05, moveSpeed.min);
    updateHUD();
  }

  updateVelocity();
}

function onDocumentKeyUp(event) {
  keysPressed[event.key] = false;
  updateVelocity();
}

function updateVelocity() {
  if (keysPressed['w']) {
    velocity.z = -moveSpeed.current;
  } else if (keysPressed['s']) {
    velocity.z = moveSpeed.current;
  } else {
    velocity.z = 0;
  }

  if (keysPressed['a']) {
    velocity.x = -moveSpeed.current;
  } else if (keysPressed['d']) {
    velocity.x = moveSpeed.current;
  } else {
    velocity.x = 0;
  }

  if (keysPressed['ArrowUp']) {
    rotationVelocity.x = -rotationSpeed;
  } else if (keysPressed['ArrowDown']) {
    rotationVelocity.x = rotationSpeed;
  } else {
    rotationVelocity.x = 0;
  }

  if (keysPressed['ArrowLeft']) {
    rotationVelocity.y = -rotationSpeed;
  } else if (keysPressed['ArrowRight']) {
    rotationVelocity.y = rotationSpeed;
  } else {
    rotationVelocity.y = 0;
  }
}

function checkCollisions() {
  const spaceshipBox = new THREE.Box3().setFromObject(camera);
  stars.forEach((star, index) => {
    const starBox = new THREE.Box3().setFromObject(star);
    if (spaceshipBox.intersectsBox(starBox)) {
      scene.remove(star);
      stars.splice(index, 1);
      score++;
      updateHUD();
      starCollectionSound.play();
    }
  });
}

function updateHUD() {
  document.getElementById('score').textContent = `Score: ${score}`;
  document.getElementById('speed').textContent = `Speed: ${moveSpeed.current.toFixed(2)}`;
}
