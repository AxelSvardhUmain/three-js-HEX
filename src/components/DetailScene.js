// DetailScene.js
import * as THREE from 'three';

export class DetailScene {
    constructor(bubbleData, color) {
        this.scene = new THREE.Scene();
        this.bubbleData = bubbleData;
        this.color = color;
        this.init();
    }

    init() {
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Add sphere with the same color as the clicked sphere
        const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({color: this.color});
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(0, 0, 0);
        this.scene.add(sphere);

        // Add text using sprite
        this.addTextSprite(`Label: ${this.bubbleData.label}`, -2, 2, -5);
        this.addTextSprite(`Value: ${this.bubbleData.value}`, -2, 1, -5);
    }

    addTextSprite(message, x, y, z) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '48px Arial';
        context.fillStyle = 'white';
        context.fillText(message, 0, 48);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        sprite.scale.set(2, 1, 1);
        sprite.position.set(x, y, z);
        
        this.scene.add(sprite);
    }

    update() {
        // You can add any update logic here, like rotating the sphere
        const sphere = this.scene.children.find(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry);
        if (sphere) {
            sphere.rotation.x += 0.01;
            sphere.rotation.y += 0.01;
        }
    }
}