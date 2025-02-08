import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { DetailScene } from './components/DetailScene';
import { MainScene } from './components/MainScene';
// import { SceneTransitioner } from './transitions/SceneTranstion';

// Transition Config
const transitionConfig = {
    camera: {
        transitionDuration: 1.5,
        transitionEase: "power2.inOut",
        peakY: -100, // How high the camera should go during transition
        finalPosition: { x: 0, y: 0, z: 17 },
        finalDuration: 1,
        finalEase: "power2.out"
    },
    mainSceneFadeOut: {
        duration: 0.5,
        ease: "power2.inOut"
    },
    detailSceneBubbles: {
        startY: 60, // Start bubbles higher than the peak camera position
        mainBubble: {
            delay: 0.2,
            duration: 3,
            ease: "power2.out"
        },
        nameBubble: {
            delay: 0.5,
            duration: 3,
            ease: "power2.out"
        },
        valueBubble: {
            delay: 0.7,
            duration: 3,
            ease: "power2.out"
        },
        fadeIn: {
            duration: 0.5
        }
    }
};

// Set up the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20);

// Set up the camera rig
const cameraRig = new THREE.Group();
cameraRig.add(camera);

// Set up controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = 0;
controls.enableZoom = false;
controls.enablePan = false;

// Sample data
const data = [
    { label: 'A', value: 5 },
    { label: 'B', value: 3 },
    { label: 'C', value: 7 },
    { label: 'D', value: 2 },
    { label: 'E', value: 6 },
    { label: 'F', value: 10 },
    { label: 'G', value: 2 },
    { label: 'H', value: 12 },
    { label: 'I', value: 6 },
    { label: 'J', value: 3 },
    { label: 'K', value: 12 },
    { label: 'L', value: 6 },
    { label: 'M', value: 3 },
];

// Chart parameters
const chartSize = 10;
const maxBubbleSize = 2;

// Create scenes
const mainScene = new MainScene(data, chartSize, maxBubbleSize);
mainScene.scene.add(cameraRig);
let detailScene = null;

let currentScene = mainScene;

// Create sidebar
const sidebar = document.getElementById('sidebar');

function createSidebar() {
    data.forEach((item, index) => {
        const sphereItem = document.createElement('div');
        sphereItem.className = 'sphere-item';
        sphereItem.textContent = `${item.label}: ${item.value}`;
        sphereItem.addEventListener('click', () => {
            const clickedBubble = mainScene.bubbles[index];
            transitionToDetailScene(clickedBubble);
        });
        
        // Add hover effects
        sphereItem.addEventListener('mouseenter', () => {
            highlightSphere(index, true);
        });
        sphereItem.addEventListener('mouseleave', () => {
            highlightSphere(index, false);
        });
        
        sidebar.appendChild(sphereItem);
    });
}

createSidebar();

// Function to highlight/unhighlight a sphere and sidebar item
function highlightSphere(index, highlight) {
    const sphere = mainScene.bubbles[index];
    const sidebarItem = sidebar.children[index];
    
    if (highlight) {
        gsap.to(sphere.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.3 });
        sphere.material.emissive.setHex(0x444444);
        sidebarItem.classList.add('active');
    } else {
        gsap.to(sphere.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        sphere.material.emissive.setHex(0x000000);
        sidebarItem.classList.remove('active');
    }
}

// Raycaster for mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Event listener for mouse clicks
window.addEventListener('click', onMouseClick, false);

// Modify the onMouseClick function
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (currentScene === mainScene) {
        const intersects = raycaster.intersectObjects(mainScene.bubbles);
        if (intersects.length > 0) {
            const clickedBubble = intersects[0].object;
            transitionToDetailScene(clickedBubble);
        }
    } else if (currentScene === detailScene) {
        const intersects = raycaster.intersectObjects(detailScene.scene.children);
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            if (clickedObject.userData.isBackButton) {
                transitionToMainScene();
            }
        }
    }
}

// Function to handle mouse move events
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(mainScene.bubbles);

    mainScene.bubbles.forEach((bubble, index) => {
        if (intersects.length > 0 && intersects[0].object === bubble) {
            highlightSphere(index, true);
        } else {
            // Only unhighlight if the sidebar item is not being hovered
            if (!sidebar.children[index].matches(':hover')) {
                highlightSphere(index, false);
            }
        }
    });
}

// Add mouse move event listener
window.addEventListener('mousemove', onMouseMove, false);


let isTransitioning = false;

function transitionToDetailScene(bubble) {
    if (isTransitioning) return;
    isTransitioning = true;
    controls.enabled = false;
    
    const bubbleColor = bubble.material.color.getHex();
    const bubbleData = bubble.userData;

    detailScene = new DetailScene(bubbleData, bubbleColor, transitionConfig.detailSceneBubbles, transitionToMainScene);

    sidebar.classList.remove('main-view');
    sidebar.classList.add('detail-view');

    // Move camera up
    gsap.to(camera.position, {
        y: transitionConfig.camera.peakY,
        duration: transitionConfig.camera.transitionDuration,
        ease: transitionConfig.camera.transitionEase,
        onUpdate: () => camera.lookAt(0, 0, 0),
        onComplete: () => {
            // Switch scenes
            currentScene = detailScene;
            mainScene.scene.visible = false;
            detailScene.scene.visible = true;

            // Move camera to final position
            gsap.to(camera.position, {
                ...transitionConfig.camera.finalPosition,
                duration: transitionConfig.camera.finalDuration,
                ease: transitionConfig.camera.finalEase,
                onUpdate: () => camera.lookAt(0, 0, 0),
                onComplete: () => {
                    controls.enabled = true;
                    // updateSidebarForDetail(bubbleData);
                    isTransitioning = false;
                }
            });
        }
    });
}

function transitionToMainScene() {
    if (currentScene === mainScene || isTransitioning) return;
    isTransitioning = true;
    
    controls.enabled = false;

    // Move camera up
    gsap.to(camera.position, {
        y: transitionConfig.camera.peakY,
        duration: transitionConfig.camera.transitionDuration,
        ease: transitionConfig.camera.transitionEase,
        onUpdate: () => camera.lookAt(0, 0, 0),
        onComplete: () => {
            // Switch scenes
            currentScene = mainScene;
            detailScene.scene.visible = false;
            mainScene.scene.visible = true;

            // Move camera back to main scene position
            gsap.to(camera.position, {
                x: 0,
                y: chartSize / 2,
                z: 20, // Use the initial camera distance for main scene
                duration: transitionConfig.camera.finalDuration,
                ease: transitionConfig.camera.finalEase,
                onUpdate: () => camera.lookAt(0, 0, 0),
                onComplete: () => {
                    controls.enabled = true;
                    mainScene.scene.add(cameraRig);
                    if (detailScene) {
                        // detailScene.dispose();
                        detailScene = null;
                    }
                    isTransitioning = false;
                    
                    // Recreate the main scene sidebar
                    sidebar.innerHTML = ''; // Clear the sidebar
                    createSidebar(); // Recreate the main scene sidebar
                    sidebar.classList.remove('detail-view');
                    sidebar.classList.add('main-view');
                    
                    // Make sure all bubbles are visible and interactive
                    mainScene.bubbles.forEach(bubble => {
                        bubble.visible = true;
                        bubble.material.opacity = 1;
                    });
                }
            });
        }
    });
}

// Add an event listener to go back to the main scene
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && currentScene === detailScene) {
        transitionToMainScene();
        console.log('hello')
    }
});
// Initialize the sidebar with main-view class
sidebar.classList.add('main-view');

// Add an event listener to go back to the main scene
window.addEventListener('keydown', (event) => {
if (event.key === 'Escape' && currentScene === detailScene) {
    transitionToMainScene();
}
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (currentScene === mainScene && !isTransitioning) {
        cameraRig.rotation.y += 0.0015;
        mainScene.update();
    } else if (detailScene) {
        detailScene.update();
    }

    renderer.render(currentScene.scene, camera);
}

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();