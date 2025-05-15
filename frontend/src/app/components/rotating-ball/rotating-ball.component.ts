import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-rotating-ball',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rotating-ball.component.html',
  styleUrls: ['./rotating-ball.component.scss']
})
export class RotatingBallComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private ball!: THREE.Mesh;
  private animationFrameId: number | null = null;

  constructor() {}

  ngOnInit(): void {
    this.initThreeJs();
  }

  ngAfterViewInit(): void {
    this.setupRenderer();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Dispose of resources
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!this.renderer || !this.camera || !this.rendererContainer) return;

    // Get updated container dimensions
    const container = this.rendererContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Update camera
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  private initThreeJs(): void {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf9f9f9);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.camera.position.z = 5;

    // Create a ball (sphere) with more interesting material
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // Create a more interesting material with gradient colors
    const material = new THREE.MeshStandardMaterial({
      color: 0x3f51b5,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x330066,
      emissiveIntensity: 0.2
    });

    this.ball = new THREE.Mesh(geometry, material);

    // Add some subtle displacement to make the ball more interesting
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    line.material = new THREE.LineBasicMaterial({ 
      color: 0xff4081,
      transparent: true,
      opacity: 0.2
    });
    this.ball.add(line);

    this.scene.add(this.ball);

    // Add lights for better visual effect
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add multiple colored point lights for more dramatic effect
    const pointLight1 = new THREE.PointLight(0xff4081, 1, 10);
    pointLight1.position.set(5, 5, 5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x3f51b5, 1, 10);
    pointLight2.position.set(-5, -5, 5);
    this.scene.add(pointLight2);
  }

  private setupRenderer(): void {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    // Get container dimensions
    const container = this.rendererContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Set renderer size and pixel ratio
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Update camera aspect ratio
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Add renderer to container
    container.appendChild(this.renderer.domElement);
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001; // Get time in seconds for smooth animation

    // Create more dynamic rotation with sine/cosine for smooth oscillation
    this.ball.rotation.x = Math.sin(time * 0.5) * 0.5;
    this.ball.rotation.y = Math.cos(time * 0.3) * 0.5 + time * 0.5; // Constant rotation + oscillation

    // Add subtle pulsing effect by scaling the ball
    const pulseFactor = 1 + Math.sin(time * 2) * 0.05;
    this.ball.scale.set(pulseFactor, pulseFactor, pulseFactor);

    // Move the lights around for dynamic lighting effects
    const lightOrbit = 3;
    const light1 = this.scene.children.find(child => child instanceof THREE.PointLight) as THREE.PointLight;
    if (light1) {
      light1.position.x = Math.sin(time) * lightOrbit;
      light1.position.z = Math.cos(time) * lightOrbit + 2;
    }

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
}