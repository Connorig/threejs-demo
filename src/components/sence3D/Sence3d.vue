// src/components/Scene3D/Scene3D.vue
<template>
  <div ref="container" class="scene-container">
    <DevicePanel :device="selectedDevice" />
    <Popover :position="popoverPosition" :data="popoverData" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Viewer, type SceneConfig } from './lib/Viewer'
import { ModelLoader } from './lib/ModelLoader'
import { PipeSystem } from './lib/PipeSystem'
import DevicePanel from './DevicePanel.vue'
import Popover from '../Popover/index.vue'

interface Device {
  id: string
  name: string
  position: THREE.Vector3
  status: 'normal' | 'warning'
  temperature: number
}

const props = defineProps<{
  sceneConfig?: SceneConfig
  devices?: Device[]
}>()

const emit = defineEmits(['device-selected'])

const container = ref<HTMLElement>()
const viewer = ref<Viewer>()
const selectedDevice = ref<Device>()
const popoverPosition = ref({ x: 0, y: 0 })
const popoverData = ref<any>({})

// 初始化场景
onMounted(async () => {
  if (!container.value) return

  // 初始化3D视图
  viewer.value = new Viewer(container.value, props.sceneConfig)

  // 初始化管道系统
  const pipeSystem = new PipeSystem(viewer.value)
  await pipeSystem.initialize()

  // 加载设备模型
  const modelLoader = new ModelLoader(viewer.value)
  await modelLoader.loadDevices(props.devices || [])

  setupEventListeners()
  startAnimationLoop()
})

// 清理资源
onUnmounted(() => {
  viewer.value?.dispose()
})

// 事件监听
const setupEventListeners = () => {
  viewer.value?.on('device-click', handleDeviceClick)
  viewer.value?.on('device-hover', handleDeviceHover)
}

// 动画循环
const startAnimationLoop = () => {
  const animate = () => {
    requestAnimationFrame(animate)
    viewer.value?.update()
  }
  animate()
}

// 设备点击处理
const handleDeviceClick = (device: Device) => {
  selectedDevice.value = device
  emit('device-selected', device)
}

// 设备悬停处理
const handleDeviceHover = (device: Device, event: MouseEvent) => {
  popoverPosition.value = { x: event.clientX, y: event.clientY }
  popoverData.value = device
}
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}
</style>
