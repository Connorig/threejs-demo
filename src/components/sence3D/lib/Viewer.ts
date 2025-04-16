// src/components/Scene3D/lib/Viewer.ts
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export interface SceneConfig {
  backgroundColor?: number
  gridSize?: number
  showAxes?: boolean
}

export class Viewer {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  private eventEmitter = new EventEmitter()

  constructor(container: HTMLElement, config: SceneConfig = {}) {
    // 初始化核心Three.js组件
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true })

    // 配置场景
    this.configureScene(config)
    this.setupControls()
    container.appendChild(this.renderer.domElement)
  }

  private configureScene(config: SceneConfig) {
    this.scene.background = new THREE.Color(config.backgroundColor || 0x0f2137)
    if (config.showAxes) this.scene.add(new THREE.AxesHelper(5))
    if (config.gridSize) this.scene.add(new THREE.GridHelper(config.gridSize, 10))
  }

  private setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.camera.position.set(10, 10, 10)
    this.controls.update()
  }

  on(event: string, callback: Function) {
    this.eventEmitter.on(event, callback)
  }

  update() {
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    // 清理资源
    this.renderer.dispose()
    this.controls.dispose()
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        obj.material.dispose()
      }
    })
  }
}
