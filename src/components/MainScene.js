import * as THREE from 'three';

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

        // Create bubbles
        this.data.forEach((item) => {
            const bubbleSize = (item.value / Math.max(...this.data.map(d => d.value))) * this.maxBubbleSize;
            const geometry = new THREE.SphereGeometry(bubbleSize, 32, 32);
            const material = new THREE.MeshPhongMaterial({ color: this.getRandomColor() });
            const bubble = new THREE.Mesh(geometry, material);

            // Position the bubble
            let colliding = true;
            while (colliding) {
                const radius = this.chartSize / 2 * Math.random();
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);

                bubble.position.x = radius * Math.sin(phi) * Math.cos(theta);
                bubble.position.z = radius * Math.sin(phi) * Math.sin(theta);
                bubble.position.y = radius * Math.cos(phi);

                colliding = this.checkCollision(bubble);
            }

            bubble.userData = { label: item.label, value: item.value };
            this.bubbles.push(bubble);
            this.scene.add(bubble);
        });
    }

    getRandomColor() {
        return Math.random() * 0x808080 + 0x7f7f7f;
    }

    checkCollision(newBubble) {
        for (let existingBubble of this.bubbles) {
            const distance = newBubble.position.distanceTo(existingBubble.position);
            const minDistance = newBubble.geometry.parameters.radius + existingBubble.geometry.parameters.radius;
            if (distance < minDistance) {
                return true;
            }
        }
        return false;
    }

    update() {
        // You can add any continuous updates here, like rotating the bubbles
        this.bubbles.forEach(bubble => {
            bubble.visible = true;
            bubble.material.opacity = 1;
            bubble.rotation.y += 0.01;
        });
    }
}