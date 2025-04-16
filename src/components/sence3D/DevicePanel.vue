// src/components/Scene3D/DevicePanel.vue
<template>
  <div v-if="device" class="device-panel">
    <h3>{{ device.name }}</h3>
    <div class="status" :class="device.status">
      Temperature: {{ device.temperature.toFixed(1) }}°C
    </div>
    <div class="position">
      X: {{ device.position.x.toFixed(2) }}, Y: {{ device.position.y.toFixed(2) }}, Z:
      {{ device.position.z.toFixed(2) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  device?: {
    name: string
    position: THREE.Vector3
    status: 'normal' | 'warning'
    temperature: number
  }
}>()
</script>

<style scoped>
.device-panel {
  /* 面板样式... */
}
</style>
