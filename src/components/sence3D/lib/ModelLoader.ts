// src/components/Scene3D/lib/ModelLoader.ts
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Viewer } from './Viewer'

export interface DeviceModel {
  id: string
  name: string
  position: THREE.Vector3
  rotation?: THREE.Euler
  scale?: number
  modelUrl: string
  userData?: Record<string, any>
}

export class ModelLoader {
  private viewer: Viewer
  private gltfLoader: GLTFLoader
  private textureLoader: THREE.TextureLoader
  private deviceMap = new Map<string, THREE.Object3D>()

  constructor(viewer: Viewer) {
    this.viewer = viewer
    this.gltfLoader = new GLTFLoader()
    this.textureLoader = new THREE.TextureLoader()
  }

  /**
   * 批量加载设备模型
   * @param devices 设备配置数组
   */
  async loadDevices(devices: DeviceModel[]): Promise<void> {
    await Promise.all(
      devices.map(async device => {
        const model = await this.loadSingleDevice(device)
        this.deviceMap.set(device.id, model)
      })
    )
  }

  /**
   * 加载单个设备模型
   * @param device 设备配置
   */
  private async loadSingleDevice(device: DeviceModel): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        device.modelUrl,
        gltf => {
          const model = this.processModel(gltf.scene, device)
          this.viewer.scene.add(model)
          resolve(model)
        },
        undefined,
        error => reject(error)
      )
    })
  }

  /**
   * 处理模型基础设置
   */
  private processModel(model: THREE.Object3D, device: DeviceModel): THREE.Object3D {
    // 基础变换
    model.position.copy(device.position)
    model.rotation.copy(device.rotation || new THREE.Euler())
    model.scale.setScalar(device.scale || 1)

    // 元数据
    model.userData = {
      ...device.userData,
      deviceId: device.id,
      isDevice: true
    }

    // 启用阴影
    model.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    return model
  }

  /**
   * 获取设备模型实例
   */
  getDeviceModel(deviceId: string): THREE.Object3D | undefined {
    return this.deviceMap.get(deviceId)
  }

  /**
   * 更新设备模型位置
   */
  updateDevicePosition(deviceId: string, position: THREE.Vector3): void {
    const model = this.deviceMap.get(deviceId)
    if (model) model.position.copy(position)
  }

  /**
   * 清理所有模型
   */
  dispose(): void {
    this.deviceMap.forEach(model => {
      model.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
      this.viewer.scene.remove(model)
    })
    this.deviceMap.clear()
  }
}
