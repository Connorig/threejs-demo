<template>
  <div id="three"></div>
  <Popover ref="popoverRef" :top="popoverTop" :left="popoverLeft" :data="popoverData"></Popover>
</template>

<script lang="ts" setup name="Sence">
/* eslint-disable */
import { ref, onMounted, type Ref } from 'vue'
import Viewer, { type Animate } from '@/modules/Viewer'
import Floors from '@/modules/Floors'
import ModelLoader from '@/modules/ModelLoder'
import * as THREE from 'three'
import gsap from 'gsap'
import Event from '@/modules/Viewer/Events'
import BoxHelperWrap from '@/modules/BoxHelperWrap'
import { checkNameIncludes, findParent } from '@/utils'

import Popover from './Popover/index.vue'
import { generateUUID } from 'three/src/math/MathUtils'
import { Vector3 } from 'three'
import droneTexture from '/public/testture.png'
import { BackSide } from 'three/src/constants'

let viewer: Viewer
let modelLoader: ModelLoader
let boxHelperWrap: BoxHelperWrap

const popoverRef: Ref = ref(null)
const popoverTop = ref(0)
const popoverLeft = ref(0)
const popoverData = ref<any>({})

let office: any = null
let oldOffice: any = null
let dataCenter: any = null
let oldDataCenter: any = null
let modelSelect = ['zuo0', 'zuo1', 'zuo2', 'zuo3', 'zuo4', 'zuo5']
let modelSelectName = ''
let modelMoveName = ''
let isModelSelectName = false

onMounted(() => {
  init()
  initModel()
  // animate()
  // viewer.scene.traverse((item: THREE.Object3D) => {
  //   // console.log(item, '0000000000')
  // })
  setInterval(updateAllDevices, 1000)
})

// 主循环
function animate() {
  requestAnimationFrame(animate)
  viewer.renderer.render(viewer.scene, viewer.camera)
  updateAllDevices() // 每帧更新
}

// 实时更新数据和位置
function updateAllDevices() {
  deviceElements.forEach((element, obj) => {
    // 更新数据（实际应用中替换为真实数据源）
    obj.userData.temperature = Math.random() * 10 + 25
    obj.userData.status = obj.userData.temperature > 32 ? 'warning' : 'normal'

    // 更新显示内容
    element.innerHTML = `
            ${obj.name}<br>
            Temp: ${obj.userData.temperature.toFixed(1)}°C<br>
            Status: <span style="color:${
              obj.userData.status === 'warning' ? '#ff4444' : '#44ff44'
            }">
                ${obj.userData.status}
            </span>
        `

    // 更新位置
    updateElementPosition(obj)
  })
}

const init = () => {
  viewer = new Viewer('three')
  // viewer.addGird()
  // viewer.addAxis()
  viewer.addStats()
  // viewer.addAxis();
  // viewer.addStats();
  viewer.initRaycaster()

  modelLoader = new ModelLoader(viewer)
  // const floors = new Floors(viewer)
  // floors.addGird()

  boxHelperWrap = new BoxHelperWrap(viewer)

  // 事件
  // viewer.emitter.on(Event.dblclick.raycaster, (list: THREE.Intersection[]) => {
  //   onMouseClick(list)
  // })
  //
  // viewer.emitter.on(Event.mousemove.raycaster, (list: THREE.Intersection[]) => {
  //   onMouseMove(list)
  // })
}
const deviceElements = new Map() // 存储模型与对应信息框的映射

const initModel = async () => {
  deviceElements.clear()
  // 删除所有.device-info
  document.querySelectorAll('.device-info').forEach((e) => {
    e.parentNode.removeChild(e)
  })

  // modelLoader.loadModelToScene('/models/plane.glb', (baseModel) => {
  //   const model = baseModel.gltf.scene
  //   // console.log('plane-------', model.children)
  //   model.scale.set(0.001 * 10, 0.001 * 10, 0.001 * 10)
  //   model.position.set(0, 0, 0)
  //   model.name = 'plane'
  //   baseModel.openCastShadow()
  //   // 动画
  //   const texture = (baseModel.object.children[0] as any).material.map
  //   // const fnOnj = planeAnimate(texture)
  //   // viewer.addAnimate(fnOnj)
  // })

  const rackList: any[] = []
  let gls: any = [{ x: 0, z: 0 }]
  const plant_width = 100
  const plant_height = 40
  for (let i = 0; i < gls.length; i++) {
    // 添加方块地板
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(plant_width, plant_height),
      new THREE.MeshPhongMaterial({ color: 0x0f2137, depthWrite: false })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.setX(gls[i].x + plant_width * 0.5)
    ground.position.setZ(gls[i].z + -plant_height * 0.5)
    ground.receiveShadow = true
    modelLoader.viewer.scene.add(ground)

    let pos = [
      { x: 1, z: -2, y: 1, status: 0, pi: 1.5, glb: '/industry013/industry013.glb' },
      { x: 20, z: -2, y: 2, status: 1, pi: 1.6, glb: '/industry013/industry015.glb' },
      { x: 40, z: -2, y: 3, status: 0, pi: 2, glb: '/industry013/industry021.glb' },
      { x: 60, z: -2, y: 0, status: 1, pi: 1.7, glb: '/industry013/industry022.glb' },
      { x: 80, z: -2, y: 1, status: 1, pi: 2, glb: '/industry013/industry028.glb' },
      { x: 100, z: -2, y: 1, status: 1, pi: 2, glb: '/industry013/industry031.glb' },
      { x: 100, z: -32, y: 1, status: 1, pi: 2, glb: '/industry013/industry028.glb' },
      { x: 80, z: -32, y: 0, status: 1, pi: 1.7, glb: '/industry013/industry022.glb' },
      { x: 60, z: -32, y: 1, status: 0, pi: 2, glb: '/industry013/industry021.glb' },
      { x: 40, z: -32, y: 1, status: 1, pi: 1.6, glb: '/industry013/industry015.glb' },
      { x: 20, z: -32, y: 0, status: 0, pi: 1.5, glb: '/industry013/industry013.glb' }
    ]

    // let p = pos.map((p) => {
    //   return [p.x + plant_width * -0.5, 1, p.z ]
    // })
    // console.log('p', p)

    let gp = ground?.position
    let p = []
    for (let i = 0; i < pos.length; i++) {
      let baseModel = await modelLoader.loadModelAsync(pos[i].glb)
      let offsetX
      let offsetZ

      offsetX = plant_width * -0.5
      offsetZ = plant_height * 0.5

      let x = pos[i].x + offsetX
      let z = pos[i].z + offsetZ
      let y = pos[i].y

      baseModel.setScalc(3)
      baseModel.object.rotation.y = -Math.PI / pos[i].pi
      const model = baseModel.gltf.scene
      z += 0.5
      model.position.set(gp.x + x, gp.y + y, gp.z + z)
      p.push([-model.position.x * 2, 1, model.position.z * 2])

      model.name = `设备-${i + 1}`
      model.userData = {
        name: i + 1,
        deviceId: generateUUID(),
        id: i + 1,
        status: pos[i].status
      }
      let cl = 0x00ff00
      if (pos[i].status == 0) {
        cl = 0xff0000
      }

      model.traverse((item) => {
        console.log('model==========', item, deviceElements)
        if (item.name.startsWith('设备')) {
          if (!deviceElements.has(item)) {
            createDeviceInfo(item) // 为每个设备创建信息框
          }
        }
        // p.push([gp.x + x, 1, gp.z + z])
        if (item.isMesh) {
          // item.material.color.set(cl)
        }
      })
      modelLoader.viewer.scene.add(baseModel.object)
      model.traverse((item) => {
        // if (checkIsRack(item)) {
        // if (item.name == 'Mesh_38') {
        //   console.log(item)
        // }
        rackList.push(item)
        // }
      })
    }
    //创建工序管道
    initTubeModel(p)
  }
  viewer.setRaycasterObjects(rackList)
}

function createDeviceInfo(obj) {
  // 创建信息框DOM元素
  const infoElement = document.createElement('div')
  infoElement.className = 'device-info'
  document.body.appendChild(infoElement)

  // 初始化设备数据
  obj.userData = {
    temperature: 25 + Math.random() * 5,
    status: 'normal',
    infoElement: infoElement
  }

  // 存储映射关系
  deviceElements.set(obj, infoElement)

  // 初始定位
  updateElementPosition(obj)
}

function updateElementPosition(obj) {
  const worldPosition = new THREE.Vector3()
  obj.getWorldPosition(worldPosition)

  // 将3D坐标转换为屏幕坐标
  const vector = worldPosition.project(viewer.camera)
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth
  const y = (vector.y * -0.5 + 0.5) * window.innerHeight

  // 更新信息框位置
  obj.userData.infoElement.style.left = `${x}px`
  obj.userData.infoElement.style.top = `${y}px`
}

const planeAnimate = (texture: any): Animate => {
  // console.log(texture, 'texture')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  const animateFn = {
    fun: () => {
      const count = texture.repeat.y
      if (count <= 10) {
        texture.repeat.x += 0.01
        texture.repeat.y += 0.02
      } else {
        texture.repeat.x = 0
        texture.repeat.y = 0
      }
    },
    content: viewer
  }
  return animateFn
}

const onMouseClick = (intersects: THREE.Intersection[]) => {
  if (!intersects.length) return
  const selectedObject = intersects[0].object

  let selectedObjectName = ''
  const findClickModel = (object: any) => {
    console.log(object, 'object')
    if (object.type === 'Group') {
      selectedObjectName = object.name
    }
    if (object.parent && object.type !== 'Scene') {
      findClickModel(object.parent)
    }
  }
  findClickModel(selectedObject)
  console.log(selectedObjectName)

  // if (!selectedObjectName || !selectedObjectName.includes('办公楼')) {
  //   // this.scene.remove(this.label);
  //   return;
  // }

  // const selectedModel = viewer.scene.getObjectByName(selectedObjectName);
  console.log(selectedObject, 'selectedObject')

  // 点击楼房
  if (selectedObject.name.includes('zuo')) {
    selectOffice(selectedObject.parent)
  }

  // 点击其他区域
  if (!selectedObject.name.includes('zuo')) {
    if (!isModelSelectName && oldOffice) {
      let oldmodel = oldOffice.getObjectByName(modelMoveName)
      office.object
        .getObjectByName(modelMoveName)
        .traverse(function (child: { isMesh: any; material: any; name: any }) {
          if (child.isMesh) {
            child.material = oldmodel.getObjectByName(child.name).material
          }
        })
    }
  }
}

function checkIsRack(obj: any): boolean {
  // return checkNameIncludes(obj, 'rack')
  return checkNameIncludes(obj, '设备')
}

const onMouseMove = (intersects: THREE.Intersection[]) => {
  // console.log('onMouseMove1')
  if (!intersects.length) {
    popoverRef.value.setShow(false)
    boxHelperWrap.setVisible(false)
    return
  }
  // console.log('intersects',intersects)
  const selectedObject = intersects[0].object || {}
  // console.log('selectedObject', selectedObject)
  // selectedObject.material.color.set(0xff0000) // 设置为红色
  // console.log('onMouseMove2')

  let selectedObjectName = ''
  let showParent = {}
  const findClickModel = (object: any) => {
    // 实际鼠标选中的dom，不是初始化创建的dom而是他的子元素。
    if (object.name.includes('Cube_19')) {
      selectedObjectName = object.name
      showParent = object
      return
    }
    if (object.parent) {
      findClickModel(object.parent)
    }
  }

  // const findClickModel = (object: any) => {
  //   if (object.name.includes('zuo')) {
  //     selectedObjectName = object.name;
  //     return;
  //   }
  //   if (object.parent) {
  //     findClickModel(object.parent);
  //   }
  // };
  findClickModel(selectedObject)

  // console.log(selectedObjectName, '--selectedObjectName---')
  // console.log(selectedObject, '------selectedObject---------')

  const rack = findParent(selectedObject, checkIsRack)

  if (rack) {
    boxHelperWrap.attach(showParent)
    updateRackInfo(rack.name, rack.userData)
  }

  // if (!selectedObjectName || !selectedObjectName.includes('办公楼')) {
  //   // 重置模型
  //   // viewer.scene.children[viewer.scene.children.findIndex(o => o.name === '办公楼')] = office.object = oldOffice.clone();
  //   return;
  // }

  // modelSelect.forEach((item: any) => {
  //   if (item === selectedObject.parent?.name) {
  //     modelMoveName = item
  //     if (modelSelectName === modelMoveName) return
  //     office.object
  //       .getObjectByName(item)
  //       .traverse(function (child: { isMesh: any; material: THREE.MeshPhongMaterial }) {
  //         if (child.isMesh) {
  //           child.material = new THREE.MeshPhongMaterial({
  //             side: THREE.DoubleSide,
  //             transparent: true,
  //             depthTest: false,
  //             depthWrite: true, // 无法被选择，鼠标穿透
  //             color: 'yellow',
  //             opacity: 0.3
  //           })
  //         }
  //       })
  //   } else {
  //     if (!isModelSelectName && oldOffice) {
  //       let oldmodel = oldOffice.getObjectByName(item)
  //       office.object
  //         .getObjectByName(item)
  //         .traverse(function (child: { isMesh: any; material: any; name: any }) {
  //           if (child.isMesh) {
  //             child.material = oldmodel.getObjectByName(child.name).material
  //           }
  //         })
  //     }
  //   }
  // })
}

const updateRackInfo = (name: string, userData: Object) => {
  // console.log('userData', userData)
  if (name) {
    popoverRef.value.setShow(true, { name: name, data: userData })
    const event = viewer.mouseEvent as MouseEvent
    popoverTop.value = event.y + 10
    popoverLeft.value = event.x + 10
  } else {
    popoverRef.value.setShow(false)
  }
}

const selectOffice = (model: any) => {
  modelSelectName = model.name
  let oldmodel = oldOffice.getObjectByName(modelSelectName)
  let modelSelectIndex = modelSelect.findIndex((v) => v === modelSelectName)
  office.object.children.forEach((child: any, index: number) => {
    child.children.forEach((Mesh: any) => {
      if (child.name === modelSelectName) {
        child.children.forEach((Mesh: { material: any; name: any }) => {
          Mesh.material = oldmodel.getObjectByName(Mesh.name).material
        })
      } else {
        // Mesh.material = new THREE.MeshPhongMaterial({
        //   color: new THREE.Color('#123ca8'),
        //   transparent: true,
        //   opacity: 0.5,
        //   emissiveMap: Mesh.material.map,
        // });
      }
    })
    if (!model.userData.position && index > modelSelectIndex) {
      gsap.to(child.position, {
        y: !child.userData.position ? child.position.y + 60 : child.position.y,
        duration: 2,
        ease: 'power1.inOut',
        onComplete: () => {
          child.userData.position = true
        }
      })
    }
    if (model.userData.position && index <= modelSelectIndex) {
      if (child.userData.position) {
        gsap.to(child.position, {
          y: oldOffice.getObjectByName(child.name).position.y,
          duration: 2,
          ease: 'power1.inOut',
          onComplete: () => {
            child.userData.position = false
          }
        })
      }
    }
  })
}

var texture = null

function initTubeModel(pointsArr) {
  console.log('pointArr', pointsArr)
  // pointsArr = [
  //   [-1, 1, -2],
  //   [-16, 1, -2]
  //   // [-30, 1, -2],
  //   // [-44, 1, -2]
  // ]
  //  pointsArr = [
  //   //x  y   z
  //   [1, 1, -2],
  //   [-61, 1, -2]
  //   // [21, 0, 1],
  //   // [-3, 0, 1],
  //   // [-3, 0, -18]
  //   // [-10, 0, -18],
  //   // [-10, 0, 5],
  //   // [1, 0, 5],
  //   // [1, 0, 24],
  //   // [-27, 0, 24],
  //   // [-27, 0, 18],
  //   // [-46, 0, 19],
  //   // [-46, 0, -4],
  //   // [-25, 0, -6],
  //   // [-25, 0, -19],
  //   // [-35, 0, -20],
  //   // [-35, 0, -26],
  //   // [-30, 0, -30],
  //   // [3, 0, -30]
  // ]
  var curve = createPath(pointsArr)
  var tubeGeometry = new THREE.TubeGeometry(curve, 1000, 0.5, 10, false)
  var textureLoader = new THREE.TextureLoader()

  texture = textureLoader.load(droneTexture)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.x = 30
  texture.repeat.y = 1
  texture.offset.y = 0.1

  var tubeMaterial = new THREE.MeshPhongMaterial({
    map: texture,
    transparent: true,
    color: 0xffffff,
    side: THREE.DoubleSide
    // opacity: 0.4,
  })

  // 设置数组材质对象作为网格模型材质参数
  var mesh = new THREE.Mesh(tubeGeometry, tubeMaterial) //网格模型对象Mesh
  mesh.position.y = 1
  mesh.rotateZ(3.14)
  mesh.scale.set(0.5, 0.5, 0.5) // 设置管道宽度
  viewer.scene.add(mesh) //网格模型添加到场景中
  renderScene()
}

function createPath(pointsArr) {
  pointsArr = pointsArr.map((point) => new THREE.Vector3(...point)) // 将参数数组转换成点数组的形式

  // 方法一：自定义三维路径 curvePath
  const path = new THREE.CurvePath()
  for (let i = 0; i < pointsArr.length - 1; i++) {
    const lineCurve = new THREE.LineCurve3(pointsArr[i], pointsArr[i + 1]) // 每两个点之间形成一条三维直线
    path.curves.push(lineCurve) // curvePath有一个curves属性，里面存放组成该三维路径的各个子路径
  }
  return path
}

function renderScene() {
  // TWEEN.update();
  // orbit.update();
  // 使用requestAnimationFrame函数进行渲染
  requestAnimationFrame(renderScene)
  viewer.renderer.render(viewer.scene, viewer.camera)
  texture.offset.x -= 0.05
}
</script>

<style>
#three {
  height: 100%;
  width: 100%;
}

.device-info {
  border: solid #0e93b7 2px;
  position: absolute;
  background: #62cbe70d;
  //background: #1b2830;
  //background: red;
  color: white;
  padding: 8px 8px;
  //margin: 8px 6px;
  border-radius: 4px;
  font-size: 16px;
  white-space: nowrap;
  transform: translate(-40%, -200%); /* 默认位于模型上方 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}
</style>
