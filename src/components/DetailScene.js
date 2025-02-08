// DetailScene.js
import * as THREE from 'three';
import { gsap } from 'gsap';

export class DetailScene {
    constructor(bubbleData, color, config) {
        this.scene = new THREE.Scene();
        this.bubbleData = bubbleData;
        this.color = color;
        this.config = config;
        this.bubbles = [];
        this.init();
    }

    init() {
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        const mainBubble = this.createBubble(1, this.color);
        const nameBubble = this.createBubble(0.5, 0x00ff00);
        const valueBubble = this.createBubble(0.5, 0x0000ff);

        this.addTextSprite(this.bubbleData.name, nameBubble.position.x, nameBubble.position.y, nameBubble.position.z + 0.5);
        this.addTextSprite(this.bubbleData.size.toString(), valueBubble.position.x, valueBubble.position.y, valueBubble.position.z + 0.5);

        this.animateBubbles(mainBubble, nameBubble, valueBubble);
    }

    createBubble(radius, color) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: color, transparent: true, opacity: 0 });
        const bubble = new THREE.Mesh(geometry, material);
        
        let colliding = true;
        while (colliding) {
            bubble.position.set(
                (Math.random() - 0.5) * 10,
                this.config.startY + (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
            colliding = this.checkCollision(bubble);
        }

        this.scene.add(bubble);
        this.bubbles.push(bubble);
        return bubble;
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

    addTextSprite(message, x, y, z) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '48px Arial';
        context.fillStyle = 'white';
        context.fillText(message, 0, 48);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        sprite.scale.set(1, 0.5, 1);
        sprite.position.set(x, y, z);
        
        this.scene.add(sprite);
    }

    animateBubbles(mainBubble, nameBubble, valueBubble) {
        const bubbles = [mainBubble, nameBubble, valueBubble];
        bubbles.forEach((bubble, index) => {
            gsap.to(bubble.position, { 
                y: bubble.position.y - this.config.startY, 
                duration: this.config[`${index === 0 ? 'main' : index === 1 ? 'name' : 'size'}Bubble`].duration, 
                ease: this.config[`${index === 0 ? 'main' : index === 1 ? 'name' : 'size'}Bubble`].ease, 
                delay: this.config[`${index === 0 ? 'main' : index === 1 ? 'name' : 'size'}Bubble`].delay 
            });

            gsap.to(bubble.material, { 
                opacity: 1, 
                duration: this.config.fadeIn.duration, 
                delay: this.config[`${index === 0 ? 'main' : index === 1 ? 'name' : 'size'}Bubble`].delay 
            });
        });
    }

    update() {
        // Rotate the bubbles
        this.bubbles.forEach((bubble, index) => {
            bubble.rotation.x += 0.01 * (index + 1);
            bubble.rotation.y += 0.01 * (index + 1);
        });
    }
}