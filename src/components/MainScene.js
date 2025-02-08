import * as THREE from "three";

export class MainScene {
  constructor(data, chartSize, maxBubbleSize) {
    this.scene = new THREE.Scene();
    this.bubbles = [];
    this.data = data;
    this.chartSize = chartSize;
    this.maxBubbleSize = maxBubbleSize;
    this.init();
  }

  init() {
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x4f4f4f);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);

    this.createBubbles();
  }

  createBubbles() {
    if (this.data.length === 0) {
      console.log("No data to create bubbles.");
      return;
    }
  
    const maxSize = Math.max(...this.data.map((d) => d.size));
    const minSize = Math.min(...this.data.map((d) => d.size));
  
    // Use a power scale for bubble sizes
    const scaleFactor = 0.5; // Adjust this value to change the size distribution
  
    this.data.forEach((item, index) => {
      // Calculate size ratio using a power scale
      const sizeRatio = Math.pow((item.size - minSize) / (maxSize - minSize), scaleFactor);
      
      // Calculate bubble size with more variation
      const bubbleSize = this.maxBubbleSize * (0.1 + sizeRatio * 0.9);
  
      const geometry = new THREE.SphereGeometry(bubbleSize, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: this.getRandomColor(),
      });
      const bubble = new THREE.Mesh(geometry, material);
  
      // Adjust positioning based on size
      const maxRadius = this.chartSize / 2;
      const radius = maxRadius * (0.3 + (1 - Math.pow(sizeRatio, 0.5)) * 0.7);
  
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      bubble.position.set(
        radius * Math.sin(phi) * Math.cos(theta) * 6.2,
        radius * Math.cos(phi) * 6.2,
        radius * Math.sin(phi) * Math.sin(theta) * 6.2
      );
  
      bubble.userData = {
        name: item.name,
        size: item.size,
        sizeRatio: sizeRatio,
      };
      this.bubbles.push(bubble);
      this.scene.add(bubble);
    });
  }

  updateData(newData) {
    this.data = newData;
    this.updateBubbles();
  }

  updateBubbles() {
    // Remove existing bubbles
    this.bubbles.forEach((bubble) => this.scene.remove(bubble));
    this.bubbles = [];

    // Create new bubbles based on the updated data
    this.createBubbles();
  }

  getRandomColor() {
    return Math.random() * 0x808080 + 0x7f7f7f;
  }

  findAvailablePosition(bubble, radius, sizeRatio) {
    const maxAttempts = 200; // Increased attempts
    for (let i = 0; i < maxAttempts; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const position = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );

      if (!this.checkCollision(bubble, position, sizeRatio)) {
        return position;
      }
    }
    return null;
  }

  checkCollision(newBubble, position, newBubbleSizeRatio) {
    for (let existingBubble of this.bubbles) {
      const distance = position.distanceTo(existingBubble.position);
      const newBubbleRadius = newBubble.geometry.parameters.radius;
      const existingBubbleRadius = existingBubble.geometry.parameters.radius;

      // Calculate minimum distance based on bubble sizes
      const minDistance =
        (newBubbleRadius + existingBubbleRadius) *
        (1.2 +
          Math.pow(
            Math.max(newBubbleSizeRatio, existingBubble.userData.sizeRatio),
            2
          ) *
            1.5);

      return false;
    }
  }

  update() {
    // You can add any continuous updates here, like rotating the bubbles
    this.bubbles.forEach((bubble) => {
      bubble.visible = true;
      bubble.material.opacity = 1;
      bubble.rotation.y += 0.01;
    });
  }
}
