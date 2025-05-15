import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
// Postprocessing imports
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
// GSAP for smooth tweens
import { gsap } from 'gsap';

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
  private composer!: EffectComposer;
  private quizObjects: THREE.Object3D[] = [];
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private isRotating = true;
  private selectedObject: THREE.Object3D | null = null;
  private animationFrameId: number | null = null;
  private group!: THREE.Group;

  constructor() {}

  ngOnInit(): void {
    this.initThreeJs();
  }

  ngAfterViewInit(): void {
    this.setupRenderer();

    // Only continue with setup if renderer was successfully created
    if (this.renderer) {
      this.setupPostprocessing();
      this.setupEventListeners();
      this.animate();
    } else {
      console.warn('WebGL not available - skipping 3D rendering');
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);

    // Only try to remove event listeners if the container exists
    if (this.rendererContainer && this.rendererContainer.nativeElement) {
      const container = this.rendererContainer.nativeElement;
      ['mousemove','mousedown','mouseup','touchstart','touchmove','touchend']
          .forEach(evt => container.removeEventListener(evt, (this as any)[`on${evt.charAt(0).toUpperCase() + evt.slice(1)}`]));
    }

    // Only dispose renderer if it was successfully created
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Only dispose objects if they exist
    if (this.quizObjects) {
      this.quizObjects.forEach(obj => obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            Array.isArray(child.material)
                ? child.material.forEach(m => m && m.dispose())
                : child.material.dispose();
          }
        }
      }));
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    // Skip if renderer or container is not available
    if (!this.renderer || !this.rendererContainer || !this.rendererContainer.nativeElement) {
      return;
    }

    const container = this.rendererContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    this.renderer.setSize(width, height);

    if (this.composer) {
      this.composer.setSize(width, height);
    }

    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  private initThreeJs(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    this.camera.position.set(0, 2, 10);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.addParticles();

    // Quiz-themed objects
    this.createQuestionMark(0, 1, 0);
    this.createBeerMug(-3, -1, 1);
    this.createBeerMug(3, -1, -1);
    this.createQuizCard(2, 2, 0);
    this.createQuizCard(-2, 2, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    const spot = new THREE.SpotLight(0xffffff, 1.5);
    spot.position.set(0, 10, 10);
    this.scene.add(ambient, spot);
  }

  private setupRenderer(): void {
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      const container = this.rendererContainer.nativeElement;
      const { clientWidth: width, clientHeight: height } = container;
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(this.renderer.domElement);
    } catch (error) {
      console.error('WebGL not supported:', error);
      // Don't throw error to allow tests to continue
    }
  }

  private setupPostprocessing(): void {
    // Skip postprocessing if renderer is not available
    if (!this.renderer) {
      console.warn('Skipping postprocessing setup - renderer not available');
      return;
    }

    try {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(), 1.2, 0.4, 0.85);
      bloom.threshold = 0;
      bloom.strength = 1.2;
      bloom.radius = 0.5;
      this.composer.addPass(bloom);
    } catch (error) {
      console.error('Error setting up postprocessing:', error);
    }
  }

  private addParticles(): void {
    const count = 2000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ size: 0.1, transparent: true, opacity: 0.6 });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);
  }

  // -- QUIZ OBJECTS --
  private createQuestionMark(x: number, y: number, z: number): void {
    const torusGeom = new THREE.TorusGeometry(0.8, 0.2, 16, 32, Math.PI * 1.5);
    const stemGeom = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
    const dotGeom = new THREE.SphereGeometry(0.2, 16, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.8, roughness: 0.2, emissive: 0xffcc00, emissiveIntensity: 0.2 });

    const torus = new THREE.Mesh(torusGeom, mat);
    torus.rotation.x = Math.PI;
    torus.rotation.z = Math.PI;
    torus.position.set(0, 0.5, 0);

    const stem = new THREE.Mesh(stemGeom, mat);
    stem.rotation.z = Math.PI;
    stem.position.set(0, -0.7, 0);

    const dot = new THREE.Mesh(dotGeom, mat);
    dot.position.set(0, -1.9, 0);

    const group = new THREE.Group();
    group.add(torus, stem, dot);
    group.position.set(x, y, z);
    group.userData = { type: 'questionMark' };
    this.group.add(group);
    this.quizObjects.push(group);
  }

  private createBeerMug(x: number, y: number, z: number): void {
    const mugGeom = new THREE.CylinderGeometry(0.7, 0.5, 1.5, 32);
    const handleGeom = new THREE.TorusGeometry(0.3, 0.1, 16, 32, Math.PI);

    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffee, metalness: 0, roughness: 0.1, transmission: 0.9, transparent: true });
    const beerMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0, roughness: 0.2, emissive: 0xffaa00, emissiveIntensity: 0.1 });

    const mug = new THREE.Mesh(mugGeom, glassMat);
    const beer = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.45, 1.3, 32), beerMat);
    beer.position.y = 0.05;

    const handle = new THREE.Mesh(handleGeom, glassMat);
    handle.rotation.z = Math.PI*1.45;
    handle.position.set(0.57, 0, 0);

    const group = new THREE.Group();
    group.add(mug, beer, handle);
    group.position.set(x, y, z);
    group.userData = { type: 'beerMug' };
    this.group.add(group);
    this.quizObjects.push(group);
  }

  private createQuizCard(x: number, y: number, z: number): void {
    const cardGeom = new THREE.BoxGeometry(1.5, 1, 0.05);
    const cardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    const card = new THREE.Mesh(cardGeom, cardMat);

    const detail = new THREE.Mesh(
        new THREE.PlaneGeometry(1.3, 0.8),
        new THREE.MeshBasicMaterial({ color: 0x3f51b5, side: THREE.DoubleSide })
    );
    detail.position.z = 0.03;

    const group = new THREE.Group();
    group.add(card, detail);
    group.position.set(x, y, z);
    group.rotation.z = Math.random() * 0.5 - 0.25;
    group.userData = { type: 'quizCard' };
    this.group.add(group);
    this.quizObjects.push(group);
  }

  private setupEventListeners(): void {
    // Skip if renderer container is not available
    if (!this.rendererContainer || !this.rendererContainer.nativeElement) {
      console.warn('Skipping event listener setup - renderer container not available');
      return;
    }

    const c = this.rendererContainer.nativeElement;
    c.addEventListener('mousemove', this.onMouseMove.bind(this));
    c.addEventListener('mousedown', this.onMouseDown.bind(this));
    c.addEventListener('mouseup', this.onMouseUp.bind(this));
    c.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    c.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
    c.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  private onMouseMove(event: MouseEvent): void {
    // Skip if renderer container or group is not available
    if (!this.rendererContainer || !this.rendererContainer.nativeElement || !this.group) {
      return;
    }

    const rect = this.rendererContainer.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    gsap.to(this.group.rotation, { x: this.mouse.y * 0.2, y: this.mouse.x * 0.5, duration: 0.5, ease: 'power2.out' });

    this.checkIntersection();
  }

  private onMouseDown(): void {
    if (this.selectedObject) this.interactWithObject(this.selectedObject);
  }

  private onMouseUp(): void { this.isRotating = true; }

  private onTouchStart(evt: TouchEvent): void { if (evt.touches.length === 1) this.onMouseMove(evt.touches[0] as any); }

  private onTouchMove(evt: TouchEvent): void { if (evt.touches.length === 1) this.onMouseMove(evt.touches[0] as any); }

  private onTouchEnd(): void { this.isRotating = true; }

  private checkIntersection(): void {
    // Skip if raycaster, camera, group, or quizObjects are not available
    if (!this.raycaster || !this.camera || !this.group || !this.quizObjects || !this.quizObjects.length) {
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check if group has children before intersecting
    if (!this.group.children || !this.group.children.length) {
      return;
    }

    const hits = this.raycaster.intersectObjects(this.group.children, true);

    // Reset scales
    this.quizObjects.forEach(o => gsap.to(o.scale, { x: 1, y: 1, z: 1, duration: 0.3 }));

    if (hits.length && hits[0].object.parent) {
      const parent = hits[0].object.parent;
      this.selectedObject = parent;
      gsap.to(parent.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.3, yoyo: true, repeat: 1 });
    } else {
      this.selectedObject = null;
    }
  }

  private interactWithObject(obj: THREE.Object3D): void {
    const tl = gsap.timeline();
    switch (obj.userData['type']) {
      case 'questionMark':
        tl.to(obj.rotation, { y: obj.rotation.y + Math.PI * 2, duration: 1, ease: 'elastic.out(1,0.3)' });
        break;
      case 'beerMug':
        tl.to(obj.rotation, { z: obj.rotation.z + Math.PI / 4, duration: 0.5, yoyo: true, repeat: 1 });
        break;
      case 'quizCard':
        tl.to(obj.rotation, { y: obj.rotation.y + Math.PI, duration: 0.6, ease: 'power2.inOut' });
        break;
    }
  }

  private animate(): void {
    // Skip animation if renderer or composer is not available
    if (!this.renderer || !this.composer) {
      return;
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (this.group) {
      this.group.rotation.y += 0.005;
    }

    this.composer.render();
  }
}
