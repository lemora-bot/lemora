/**
 * Lemora Wallet Tracker - Three.js Animated Cube
 * Renders a 3D animated cube for UI enhancement
 */

import * as THREE from 'three';

export class AnimatedCube {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cube: THREE.Mesh;
  private animationId: number = 0;

  constructor(containerId: string) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    
    this.initializeRenderer(containerId);
    this.createCube();
    this.setupLighting();
    this.positionCamera();
    this.startAnimation();
  }

  /**
   * Initializes the WebGL renderer
   */
  private initializeRenderer(containerId: string): void {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id ${containerId} not found`);
    }

    this.renderer.setSize(400, 400);
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);
  }

  /**
   * Creates the animated cube
   */
  private createCube(): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
      wireframe: false
    });
    
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);
  }

  /**
   * Sets up scene lighting
   */
  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    
    directionalLight.position.set(1, 1, 1);
    
    this.scene.add(ambientLight);
    this.scene.add(directionalLight);
  }

  /**
   * Positions the camera
   */
  private positionCamera(): void {
    this.camera.position.z = 3;
  }

  /**
   * Starts the animation loop
   */
  private startAnimation(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      this.cube.rotation.x += 0.01;
      this.cube.rotation.y += 0.01;
      
      this.renderer.render(this.scene, this.camera);
    };
    
    animate();
  }

  /**
   * Stops the animation
   */
  public stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  /**
   * Updates cube color
   */
  public updateColor(color: number): void {
    if (this.cube && this.cube.material instanceof THREE.MeshPhongMaterial) {
      this.cube.material.color.setHex(color);
    }
  }

  /**
   * Handles window resize
   */
  public onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(400, 400);
  }

  /**
   * Disposes of Three.js resources
   */
  public dispose(): void {
    this.stopAnimation();
    
    if (this.cube) {
      this.scene.remove(this.cube);
      this.cube.geometry.dispose();
      if (this.cube.material instanceof THREE.Material) {
        this.cube.material.dispose();
      }
    }
    
    this.renderer.dispose();
  }
}
