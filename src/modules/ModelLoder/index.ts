import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import BaseModel from '../BaseModel'
import type Viewer from '../Viewer'

type LoadModelCallbackFn<T = any> = (arg: T) => any

const publicPath = `${import.meta.env.VITE_PUBLIC_BASE_PATH || ''}`

/**模型加载器 */
export default class ModelLoder {
  protected viewer: Viewer
  private gltfLoader: GLTFLoader
  private dracoLoader: DRACOLoader

  constructor(viewer: Viewer, dracolPath: string = `${publicPath}/draco/`) {
    this.viewer = viewer
    this.gltfLoader = new GLTFLoader()
    this.dracoLoader = new DRACOLoader()

    // 提供一个DracLoader实例来解码压缩网格数据
    // 没有这个会报错 dracolPath 默认放在public文件夹当中
    this.dracoLoader.setDecoderPath(dracolPath)
    this.gltfLoader.setDRACOLoader(this.dracoLoader)
  }

  /**模型加载到场景 */
  public loadModelToScene(url: string, callback: LoadModelCallbackFn<BaseModel>) {
    const publicUrl = `${publicPath}${url}`
    this.loadModel(publicUrl, (model) => {
      this.viewer.scene.add(model.object)
      callback && callback(model)
    })
  }

  public loadModelToScene2(url: string, callback: LoadModelCallbackFn<BaseModel>) {
    const publicUrl = `${publicPath}${url}`
    this.loadModel(publicUrl, (model) => {
      this.viewer.scene.add(model.object)
      callback && callback(model)
    })
  }

  private loadModel(url: string, callback: LoadModelCallbackFn<BaseModel>) {
    this.gltfLoader.load(url, (gltf) => {
      const baseModel = new BaseModel(gltf, this.viewer)
      callback && callback(baseModel)
    })
  }

  private async loadModelAsync(url: string) {
    const gltf = await this.gltfLoader.loadAsync(url, (gltf) => {
      // const baseModel = new BaseModel(gltf, this.viewer)
    })
    return new BaseModel(gltf, this.viewer)
  }
}
