<template>
  <div id="three"></div>
  <div class="detail-panel" id="detailPanel">
    <h2>设备详情</h2>
    <div id="panelContent"></div>
  </div>
  <Popover ref="popoverRef" :top="popoverTop" :left="popoverLeft" :data="popoverData"></Popover>
</template>

<script lang="ts" setup name="Sence">
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
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
import droneTexture from '/public/textture.png'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

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
const highlightBoxes = new Map()
let selectedModel = null
const loader = new FontLoader()

onMounted(() => {
  // 初始化网络
  init()
  // 创建模型
  initModel()

  initLogo()

  // 更新卡片数据(AJAX)
  setInterval(updateAllDevicesData, 1000)

  // 实时更新卡片与模型的位置
  viewer.addAnimate({
    fun: updateAllDevices,
    content: viewer
  })
  viewer.addAnimate({
    fun: runningSmallTubes,
    content: viewer
  })
})

// 主循环
// function animate() {
//   requestAnimationFrame(animate)
//   updateAllDevices() // 每帧更新
//   runningSmallTubes() // 设置小管道运动
//   viewer.controls.update()
//   viewer.renderer.render(viewer.scene, viewer.camera)
// }

async function initModel3(url: string) {
  // 创建3D图片
  let pictureMesh
  // 纹理加载器
  const textureLoader = new THREE.TextureLoader()

  // 加载图片纹理
  let texture = await textureLoader.loadAsync(url)
  // 改善纹理设置
  texture.encoding = THREE.sRGBEncoding // 正确解码颜色
  texture.anisotropy = viewer.renderer.capabilities.getMaxAnisotropy() // 提高纹理质量

  // 创建材质
  // const material = new THREE.MeshPhongMaterial({
  //   map: texture,
  //   side: THREE.DoubleSide,
  //   specular: 0xffffff,
  //   shininess: 10
  // })

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,    // 启用透明
    alphaTest: 0.5,       // 设置alpha测试阈值
    side: THREE.DoubleSide // 双面显示
  });

  // 创建平面几何体
  const geometry = new THREE.PlaneGeometry(50, 50)

  // 创建网格
  pictureMesh = new THREE.Mesh(geometry, material)

  // pictureMesh.position.z = 150
  // pictureMesh.position.y = 50
  // pictureMesh.position.x = 210
  // pictureMesh.rotation.y = Math.PI * 5
  pictureMesh.rotation.x = Math.PI / 4
  pictureMesh.object = pictureMesh

  return pictureMesh
}

function initModel2(url: string) {
  // 5. 创建带贴图的立方体
  const cubeSize = 40 // 立方体大小

  // 创建立方体几何体
  const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)

  // 加载纹理图片
  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load(url)

  // 创建材质（使用加载的纹理）
  const material = new THREE.MeshPhongMaterial({
    map: texture, // 设置纹理贴图
    specular: 0x111111, // 高光颜色
    shininess: 20 // 高光强度
  })

  // 改善纹理设置
  texture.encoding = THREE.sRGBEncoding // 正确解码颜色
  texture.anisotropy = viewer.renderer.capabilities.getMaxAnisotropy() // 提高纹理质量

  // 创建网格对象
  const cube = new THREE.Mesh(geometry, material)
  cube.object = cube
  return cube
}

function initLogo() {
  // 创建3D图片
  let pictureMesh
  // 纹理加载器
  const textureLoader = new THREE.TextureLoader()
  // 加载图片纹理
  textureLoader.load(
    '/public/logo/sg4.png', // 你可以替换为你自己的图片URL
    (texture) => {
      // 创建平面几何体
      const geometry = new THREE.PlaneGeometry(400, 100)

      // 创建材质
      // const material = new THREE.MeshPhongMaterial({
      //   map: texture,
      //   side: THREE.DoubleSide,
      //   specular: 0x111111,
      //   shininess: 30
      // })

      // 创建带透明通道的材质
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,    // 启用透明
        alphaTest: 0.5,       // 设置alpha测试阈值
        side: THREE.DoubleSide // 双面显示
      });

      // 创建网格
      pictureMesh = new THREE.Mesh(geometry, material)

      pictureMesh.position.z = 150
      pictureMesh.position.y = 50
      pictureMesh.position.x = 210
      pictureMesh.rotation.y = Math.PI * 5
      pictureMesh.rotation.x = Math.PI / 3
      viewer.scene.add(pictureMesh)
    }
  )
}

function runningSmallTubes() {
  for (let i = 0; i < gls.length; i++) {
    let item = gls[i]
    // 更新小管道位置
    item.smallTubes.forEach((tube) => {
      tube.userData.progress += 0.001
      if (tube.userData.progress > 1) tube.userData.progress = 0

      // 获取路径点和方向
      const position = item.uPath.getPointAt(tube.userData.progress)
      const tangent = item.uPath.getTangentAt(tube.userData.progress)

      // 更新位置和方向
      tube.position.copy(position)
      tube.position.y = 4
      tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent)
    })
  }
  // gls.forEach((i, item) => {
  //   console.log(i,item)
  //   // 更新小管道位置
  //   item.smallTubes.forEach((tube) => {
  //     tube.userData.progress += 0.001
  //     if (tube.userData.progress > 1) tube.userData.progress = 0
  //
  //     // 获取路径点和方向
  //     const position = item.uPath.getPointAt(tube.userData.progress)
  //     const tangent = item.uPath.getTangentAt(tube.userData.progress)
  //
  //     // 更新位置和方向
  //     tube.position.copy(position)
  //     tube.position.y = i * 100
  //     tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent)
  //   })
  // })
}

function updateAllDevicesData() {
  deviceElements.forEach((element, obj) => {
    // 更新数据（实际应用中替换为真实数据源）
    obj.userData.temperature = Math.random() * 10 + 25
    obj.userData.status = obj.userData.temperature > 32 ? '警报' : '正常'
    // 更新显示内容
    element.innerHTML = `
            ${obj.name}<br>
            状态: <span style="color:${obj.userData.status === 'warning' ? '#ff4444' : '#44ff44'}">
                ${obj.userData.status}
            </span>`
    // 更新位置
    updateElementPosition(obj)
  })
}

// 实时更新数据和位置
function updateAllDevices() {
  deviceElements.forEach((element, obj) => {
    // 更新数据（实际应用中替换为真实数据源）
    obj.userData.temperature = Math.random() * 10 + 25
    obj.userData.status = obj.userData.temperature > 32 ? 'warning' : 'normal'
    // 更新显示内容
    // element.innerHTML = `
    //         ${obj.name}<br>
    //         Temp: ${obj.userData.temperature.toFixed(1)}°C<br>
    //         Status: <span style="color:${
    //           obj.userData.status === 'warning' ? '#ff4444' : '#44ff44'
    //         }">
    //             ${obj.userData.status}
    //         </span>
    //     `

    // 更新位置
    updateElementPosition(obj)
  })
}

const init = () => {
  viewer = new Viewer('three')
  // viewer.addGird()
  // viewer.addAxis()
  viewer.addStats()
  viewer.initRaycaster()

  modelLoader = new ModelLoader(viewer)
  boxHelperWrap = new BoxHelperWrap(viewer)

  // 事件
  viewer.emitter.on(Event.dblclick.raycaster, (list: THREE.Intersection[]) => {
    onMouseClick(list)
  })
  // viewer.emitter.on(Event.mousemove.raycaster, (list: THREE.Intersection[]) => {
  //   onMouseMove(list)
  // })
}
const deviceElements = new Map() // 存储模型与对应信息框的映射
const gls = []
const tempUpath = []

const initModel = async () => {
  // 清空所有模型与卡片对应数据
  deviceElements.clear()
  // 删除所有.device-info html元素
  document.querySelectorAll('.device-info').forEach((e) => {
    e.parentNode.removeChild(e)
  })

  // 添加地板
  modelLoader.loadModelToScene('/models/plane.glb', (baseModel) => {
    const model = baseModel.gltf.scene
    model.scale.set(0.08, 0.01, 0.08)
    model.position.set(100, 0, 0)
    model.name = 'plane'
    baseModel.openCastShadow()
    // 动画
    const texture = (baseModel.object.children[0] as any).material.map
    const fnOnj = planeAnimate(texture)
    viewer.addAnimate(fnOnj)
  })

  const rackList: any[] = []
  gls.push(
    {
      floor: {
        name: '1F',
        enName: 'Second floor',
        width: 420,
        height: 280,
        x: 0,
        y: 0,
        z: 0
      },
      x: 0,
      z: 0,
      devices: [
        {
          name: '真空熔炼炉',
          x: 0,
          z: 0,
          y: 20,
          status: 0,
          pi: Math.PI / -0.6,
          glb: '/industry013/industry015.glb',
          scalc: 15,
          photo_path: '/public/devices3/真空熔炼炉.jpg'
        },
        {
          name: '挤压机',
          x: -70,
          z: 0,
          y: 20,
          status: 1,
          pi: Math.PI * 1.9,
          glb: '/industry013/industry022.glb',
          scalc: 20,
          photo_path: '/public/devices3/挤压机.jpg'
        },
        {
          name: '冷油机',
          x: -140,
          z: 0,
          y: 20,
          status: 1,
          pi: Math.PI * 1.9,
          glb: '/industry013/industry021.glb',
          scalc: 20
        },
        {
          name: '退火炉',
          x: -210,
          z: 0,
          y: 20,
          status: 1,
          pi: Math.PI * 2,
          glb: '/industry013/industry021.glb',
          scalc: 20,
          photo_path: '/public/devices3/退火炉.jpg'
        },
        {
          name: '立式拉丝机',
          x: -280,
          z: 0,
          y: 20,
          status: 1,
          pi: Math.PI * 2,
          glb: '/industry013/industry021.glb',
          scalc: 20
        },
        {
          name: '卧式拉丝机',
          x: -350,
          z: 0,
          y: 20,
          status: 1,
          pi: Math.PI * 2,
          glb: '/industry013/industry021.glb',
          scalc: 20
        },
        {
          name: '轧尖机',
          x: -350,
          z: -180,
          y: 20,
          status: 1,
          pi: Math.PI * 2,
          glb: '/industry013/industry021.glb',
          scalc: 20
        },
        {
          name: '抛光机',
          x: -280,
          z: -180,
          y: 20,
          status: 1,
          pi: Math.PI * 2,
          glb: '/industry013/industry021.glb',
          scalc: 20
        },
        {
          name: '绞线机-1',
          x: 0,
          z: -180,
          y: 20,
          status: 1,
          pi: Math.PI * 2,
          glb: '/industry013/industry021.glb',
          scalc: 20,
          photo_path: '/public/devices3/绞线机.png'
        },
        {
          name: '绞线机-2',
          x: -80,
          z: -180,
          y: 20,
          status: 1,
          pi: Math.PI * 2,
          glb: '/industry013/industry021.glb',
          scalc: 20,
          photo_path: '/public/devices3/绞线机.png'
        },
        {
          name: '绞线机-3',
          x: -140,
          z: -180,
          y: 20,
          status: 1,
          pi: Math.PI * 2,
          glb: '/industry013/industry021.glb',
          scalc: 20,
          photo_path: '/public/devices3/绞线机.png'
        }
      ],
      smallTubes: [],
      uPath: []
    },
    {
      floor: {
        name: '2F',
        enName: 'Second floor',
        width: 420,
        height: 140,
        x: 0,
        y: 0,
        z: 0
      },
      x: 0,
      z: 0,
      tubus: 5,
      devices: [
        {
          name: '微拉机',
          x: -280,
          z: 0,
          y: 20,
          status: 0,
          pi: Math.PI / -0.4,
          glb: '/industry013/industry031.glb',
          scalc: 20,
          photo_path: '/public/devices3/微拉机.jpg'
        },
        {
          name: '多孔退火炉-1',
          x: -210,
          z: 0,
          y: 20,
          status: 0,
          pi: Math.PI / -0.6,
          glb: '/industry013/industry013.glb',
          scalc: 20
        },
        {
          name: '多孔退火炉-2',
          x: -140,
          z: 0,
          y: 20,
          status: 0,
          pi: Math.PI / -0.6,
          glb: '/industry013/industry013.glb',
          scalc: 20
        },
        {
          name: '多孔退火炉-3',
          x: -70,
          z: 0,
          y: 20,
          status: 0,
          pi: Math.PI / -0.6,
          glb: '/industry013/industry013.glb',
          scalc: 20
        },
        {
          name: '多孔退火炉-4',

          x: 0,
          z: 0,
          y: 20,
          status: 0,
          pi: Math.PI / -0.6,
          glb: '/industry013/industry013.glb',
          scalc: 20
        }
      ],
      smallTubes: [],
      uPath: []
    }
  )

  let plant_width = 0
  let plant_height = 0
  const thickness = 2
  for (let j = 0; j < gls.length; j++) {
    plant_width = gls[j].floor.width
    plant_height = gls[j].floor.height

    // 添加方块地板
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(plant_width, plant_height, thickness),
      new THREE.MeshStandardMaterial({ color: 0x0f2137 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.setX(gls[j].x + plant_width * 0.5)
    ground.position.setZ(gls[j].z + -plant_height * 0.5 + j * -350)
    // ground.position.setY(j * thickness)
    ground.position.setY(thickness)
    ground.receiveShadow = false

    // 添加墙面
    // 创建四面墙
    // 参数设置
    const wallWidth = plant_width // 宽
    const wallHeight = plant_width * 0.0425 // 墙面高度改为50更明显
    const wallThickness = thickness / 2

    // 创建四面墙
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x0f2137 })

    // 前墙 (z轴正方向)
    const frontWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallWidth, wallHeight, wallThickness),
      wallMaterial
    )
    let fx = plant_width / 2
    // fx += j * plant_width

    frontWall.position.set(fx, wallHeight / 2, j * ground.position.z + j * plant_height * 0.5)

    viewer.scene.add(frontWall)

    // // 后墙 (z轴负方向)
    // const backWall = new THREE.Mesh(
    //   new THREE.BoxGeometry(floorSize, wallHeight, wallThickness),
    //   wallMaterial
    // )
    // backWall.position.set(plant_width / 2, 2 + j * ground.position.y, -plant_height)
    // // viewer.scene.add(backWall)
    //
    // 右墙 (x轴负方向)
    // const leftWall = new THREE.Mesh(
    //   new THREE.BoxGeometry(wallThickness, wallHeight, plant_height),
    //   wallMaterial
    // )
    // let wlx = j * plant_width
    // wlx += 0
    // leftWall.position.set(wlx, 2 + j * ground.position.y, -plant_height / 2)
    // viewer.scene.add(leftWall)
    //
    // // 左墙 (x轴正方向)
    // const rightWall = new THREE.Mesh(
    //   new THREE.BoxGeometry(wallThickness, wallHeight, plant_height),
    //   wallMaterial
    // )
    // let wrx = plant_width
    // wrx += plant_width * j
    // rightWall.position.set(wrx, 2 + j * ground.position.y, -plant_height / 2)
    // viewer.scene.add(rightWall)

    modelLoader.viewer.scene.add(ground)
    let pos = gls[j].devices
    let gp = ground?.position

    const chineseFontURL = '/public/font/helvetiker_regular.typeface.json'
    // 创建3D文字"一楼"
    loader.load(chineseFontURL, function (font) {
      const textGeometry = new TextGeometry(gls[j].floor.name, {
        font: font,
        size: 30,
        height: 2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
      })

      // 1. 先居中文字
      textGeometry.computeBoundingBox()
      const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x
      textGeometry.translate(-textWidth / 2, ground.position.y, 0)

      // 2. 翻转几何体使其正面朝外
      textGeometry.scale(-1, 1, 1) // X轴翻转

      const textMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide // 双面材质确保翻转后可见
      })

      const textMesh = new THREE.Mesh(textGeometry, textMaterial)
      // textMesh.position.x = plant_width + 10 // 将文字放在地板上方
      textMesh.position.y = 3 // 将文字放在地板上方
      textMesh.position.z = -plant_height + j * -350 // 将文字放在地板上方

      textMesh.rotation.x = Math.PI / 3
      viewer.scene.add(textMesh)
    })

    for (let i = 0; i < pos.length; i++) {
      // 3D模型
      // let baseModel = await modelLoader.loadModelAsync(pos[i].glb)
      // 3D立方体
      // let baseModel = await initModel2('/public/devices/d3.jpg')

      let baseModel = null
      if (pos[i].name == '微拉机') {
        baseModel = await initModel2(pos[i].photo_path || '/public/devices/d3.jpg')
      } else {
        // 图片
        baseModel = await initModel3(pos[i].photo_path || '/public/devices/d3.jpg')
      }

      let offsetX = plant_width / 2 - 15
      let offsetZ = plant_height / 2 - 40

      let x = pos[i].x + offsetX
      let z = pos[i].z + offsetZ
      let y = pos[i].y
      // baseModel.setScalc(pos[i].scalc)
      // baseModel.object.rotation.y = pos[i].pi

      const model = baseModel

      model.position.set(gp.x + x, gp.y + y, gp.z + z)

      if (pos[i].name.indexOf('绞线机') == -1) {
        gls[j].uPath.push([model.position.x, 2, model.position.z])
      } else {
        tempUpath.push([model.position.x, 2, model.position.z])
      }

      model.name = `设备-${pos[i].name}`
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
        if (item.name.startsWith('设备')) {
          if (!deviceElements.has(item)) {
            createDeviceInfo(item) // 为每个设备创建信息框
          }
        }

        if (item.isMesh) {
          item.castShadow = false
          item.receiveShadow = false
        }
        // if (item.isMesh) {
        //   // item.material.color.set(cl)
        //   // 保留原有贴图
        //   const originalMap = item.material.map
        //   const normalMap = item.material.normalMap
        //   const aoMap = item.material.aoMap
        //   const roughnessMap = item.material.roughnessMap
        //   const metalnessMap = item.material.metalnessMap
        //
        //   // 创建新金属材质
        //   item.material = new THREE.MeshPhysicalMaterial({
        //     metalness: 0.9, // 金属度（0-1）
        //     roughness: 0.1, // 粗糙度（0-1）
        //     color: 0xffffff, // 基础颜色
        //     // envMap: viewer.sence.bac.background, // 环境贴图
        //     map: originalMap,
        //     normalMap: normalMap,
        //     aoMap: aoMap,
        //     roughnessMap: roughnessMap,
        //     metalnessMap: metalnessMap,
        //     transparent: true,
        //     transmission: 0.1, // 透光率（可选）
        //     clearcoat: 0.9 // 清漆层效果（可选）
        //   })
        // }
      })
      modelLoader.viewer.scene.add(baseModel.object)

      model.traverse((item) => {
        rackList.push(item)
      })
    }

    if (gls[j].floor.name == '2F') {
      gls[j].uPath = gls[j].uPath.concat(tempUpath.reverse())
    }

    //创建工序主要管道
    gls[j].uPath = createPath(gls[j].uPath)

    let mainTube = createMainTube(gls[j].uPath)
    // 适配高度
    mainTube.position.y = gp?.y
    viewer.scene.add(mainTube)

    // 创建小管道
    createSmallTubes(gls[j])
    // console.log('createSmallTubes', gls[j])
  }
  viewer.setRaycasterObjects(rackList)
}

// 创建主管道
function createMainTube(path) {
  const geometry = new THREE.TubeGeometry(path, 1000, 2.5, 1000, false)

  const material = new THREE.MeshPhongMaterial({
    color: 0x0b3992,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  })

  return new THREE.Mesh(geometry, material)
}

// 创建流动小管道
function createSmallTubes(gls) {
  const smallTubeGeometry = new THREE.CylinderGeometry(0.7, 0.7, 2.0, 100)
  const smallTubeMaterial = new THREE.MeshPhongMaterial({
    color: 0x3c7cec,
    emissive: 0x441100
  })
  let counts = 10 * gls.devices.length

  if (gls.floor.name == '2F') {
    counts += 50
  }
  for (let i = 0; i < counts; i++) {
    const tube = new THREE.Mesh(smallTubeGeometry, smallTubeMaterial)
    // 错开位置
    let lv = 0.01

    // 初始参数设置
    tube.userData = {
      progress: i * lv
    }

    // 初始方向调整
    tube.rotation.x = Math.PI / 2
    gls.smallTubes.push(tube)
    viewer.scene.add(tube)
  }
}

function createDeviceInfo(obj) {
  // 创建信息框DOM元素
  const infoElement = document.createElement('div')
  infoElement.className = 'device-info'

  document.body.appendChild(infoElement)

  // 初始化设备数据
  // obj.userData = {
  //   temperature: 25 + Math.random() * 5,
  //   status: 'normal',
  //   infoElement: infoElement
  // }

  obj.userData.temperature = 25 + Math.random() * 5
  obj.userData.status = 'normal'
  obj.userData.infoElement = infoElement

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

function clearSelection() {
  // 移除所有高亮框
  highlightBoxes.forEach((highlight, model) => {
    viewer.scene.remove(highlight)
    highlight.geometry.dispose()
    highlight.material.dispose()
  })
  highlightBoxes.clear()

  // 隐藏面板
  document.getElementById('detailPanel').classList.remove('active')
  selectedModel = null
}

const onMouseClick = (intersects: THREE.Intersection[]) => {
  if (!intersects.length) {
    clearSelection()
    return
  } else {
  }

  const selectedObject = intersects[0].object

  // console.log('onMouseClick', selectedObject)

  let selectedObjectName = ''
  let showParent = {}
  const findClickModel = (object: any) => {
    // 实际鼠标选中的dom，不是初始化创建的dom而是他的子元素。
    if (object.name.includes('设备')) {
      selectedObjectName = object.name
      showParent = object
      return
    }
    if (object.parent) {
      findClickModel(object.parent)
    }
  }
  findClickModel(selectedObject)

  console.log('showParent', showParent.userData)

  if (showParent) {
    boxHelperWrap.attach(showParent)
  }
  addSelectionEffect(showParent)
  showDetailPanel(showParent)
}

function showDetailPanel(model) {
  const panel = document.getElementById('detailPanel')
  const content = document.getElementById('panelContent')

  // 更新面板内容
  content.innerHTML = `
        <h3>${model.name}</h3>
        <p>位置: (${model.position.x.toFixed(2)},
                  ${model.position.y.toFixed(2)},
                  ${model.position.z.toFixed(2)})</p>
        <p>状态: <span class="status">运行中</span></p>
        <div class="sensor-data">
            <p>温度: ${(Math.random() * 10 + 30) | 0}°C</p>
            <p>负载: ${(Math.random() * 100) | 0}%</p>
        </div>
    `

  // 显示面板
  panel.classList.add('active')
}

function addSelectionEffect(model) {
  // 创建红色高亮框
  const geometry = new THREE.BoxGeometry(10, 10, 10)
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0044,
    transparent: true,
    opacity: 0.5,
    depthTest: false
  })
  const highlight = new THREE.Mesh(geometry, material)

  // 对齐到选中模型
  highlight.position.copy(model.position)
  highlight.rotation.copy(model.rotation)
  viewer.scene.add(highlight)

  // 存储关联
  highlightBoxes.set(model, highlight)
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
    if (object.name.includes('设备')) {
      selectedObjectName = object.name
      showParent = object
      return
    }
    if (object.parent) {
      findClickModel(object.parent)
    }
  }

  findClickModel(selectedObject)

  console.log('showParent', showParent)

  // const rack = findParent(selectedObject, checkIsRack)
  //
  // if (rack) {
  //   boxHelperWrap.attach(showParent)
  //   updateRackInfo(rack.name, rack.userData)
  // }
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
  var curve = createPath(pointsArr)
  var tubeGeometry = new THREE.TubeGeometry(curve, 1000, 0.7, 100, false)
  var textureLoader = new THREE.TextureLoader()

  texture = textureLoader.load(droneTexture)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.x = 50
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

function initTubeModel2(pointsArr) {
  var curve = createPath(pointsArr)
  var tubeGeometry = new THREE.TubeGeometry(curve, 1000, 1.0, 100, false)

  var tubeMaterial = new THREE.MeshPhongMaterial({
    // // map: texture,
    // transparent: true,
    // color: 0xffffff,
    // side: THREE.DoubleSide
    // // opacity: 0.4,
    color: 0x606060,
    transparent: true,
    opacity: 0.7
  })

  // 设置数组材质对象作为网格模型材质参数
  var mesh = new THREE.Mesh(tubeGeometry, tubeMaterial) //网格模型对象Mesh
  mesh.position.y = 1
  mesh.rotateZ(3.14)
  mesh.scale.set(0.5, 0.5, 0.5) // 设置管道宽度
  viewer.scene.add(mesh) //网格模型添加到场景中

  // 创建流动粒子
  function createFlowPipes() {
    const smallPipeCount = 5 // 小管道数量
    const smallPipeRadius = 0.6 // 稍小于主管道
    const smallPipeLength = 5 // 小管道长度
    const smallPipeSpeed = 0.1 // 移动速度
    const startOffset = 2 // 小管道起始位置偏移量，防止重叠
    // 创建小管道
    const smallPipeGeometry = new THREE.CylinderGeometry(
      smallPipeRadius,
      smallPipeRadius,
      smallPipeLength,
      32
    )
    const particleMaterial = new THREE.MeshPhongMaterial({
      color: 0x47d8f9,
      emissive: 0x004400
    })

    viewer.scene.traverse((child) => {
      if (child.geometry instanceof THREE.TubeGeometry) {
        const path = child.geometry.parameters.path
        const totalLength = path.getLength()

        for (let i = 0; i < smallPipeCount; i++) {
          // 创建流动粒子
          const particle = new THREE.Mesh(smallPipeGeometry, particleMaterial)
          // 对齐主管道方向
          particle.rotation.z = Math.PI / 2

          child.add(particle)

          // 初始参数
          particle.position.copy(path.getPointAt(0)) // 从路径起点开始
          particle.position.y += i * (smallPipeLength / 2)
          // particle.position.x += i * (smallPipeLength / 2)
          // particle.position.z += i * (smallPipeLength / 2)
          particle.userData = {
            progress: 0,
            speed: 0.015,
            totalLength: totalLength
          }
        }
      }
    })
  }

  createFlowPipes(tubeGeometry)
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
  // 使用requestAnimationFrame函数进行渲染
  requestAnimationFrame(renderScene)
  viewer.renderer.render(viewer.scene, viewer.camera)
  // texture.offset.x -= 0.05
  viewer.scene.traverse((child) => {
    if (child.userData.progress !== undefined) {
      // 更新粒子位置
      child.userData.progress += child.userData.speed
      if (child.userData.progress > 1) child.userData.progress = 0

      // 根据进度获取路径点
      const path = child.parent.geometry.parameters.path
      const newPosition = path.getPointAt(child.userData.progress)
      child.position.copy(newPosition)
    }
  })
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
  transform: translate(-50%, -260%); /* 默认位于模型上方 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}
</style>

<style>
.info-card {
  position: absolute;
  background: rgba(10, 20, 30, 0.9);
  color: #00fffc;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 252, 0.3);
  box-shadow: 0 0 15px rgba(0, 255, 252, 0.2);
  min-width: 200px;
  transform: translate(-50%, -100%);
  pointer-events: none;
  transition: all 0.3s;
  font-family: Arial, sans-serif;
}

.info-card h3 {
  margin: 0 0 10px 0;
  border-bottom: 1px solid #00fffc;
  padding-bottom: 5px;
}
</style>

<style>
/* 左侧抽屉面板样式 */
.detail-panel {
  position: fixed;
  left: -300px;
  top: 20px;
  width: 300px;
  height: 90vh;
  background: rgba(10, 25, 40, 0.95);
  border-radius: 0 10px 10px 0;
  padding: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 3px 0 15px rgba(0, 255, 252, 0.2);
  border-right: 2px solid #00fffc;
  color: #00fffc;
  backdrop-filter: blur(10px);
}

.detail-panel.active {
  left: 20px;
}

/* 选中高亮样式 */
.selected-highlight {
  position: absolute;
  width: 110%;
  height: 110%;
  border: 2px solid #ff0044;
  border-radius: 4px;
  box-shadow: 0 0 15px #ff0044;
  pointer-events: none;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 0.8;
  }
}
</style>
