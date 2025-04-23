<template>
  <div class="header">
    <div @click="hieddle">
      <slot></slot>
    </div>
  </div>
  <div id="curr_time"  style="color: white; font-size: 0.5rem; z-index: 22; position: absolute; top: 0; right: 10px">
    {{ currTime }}
  </div>
</template>

<style scoped>
.header {
  cursor: pointer;
  position: absolute;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 1rem;
  /* padding-bottom: 10px; */
  font-size: 0.4rem;
  font-weight: bold;
  color: #fff;
  background: url('@/assets/images/header_bg.png');
  background-repeat: no-repeat;
  background-size: 100% 1rem;
}

.header:hover {
  font-size: 50px;
  transition: font-size 0.5s ease;
}
</style>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const isHide = ref(false)
let currTime = ref('')

onMounted(() => {
  setInterval(() => {
    currTime = new Date().toLocaleString()
    document.getElementById('curr_time').innerHTML = currTime.toLocaleString()
  }, 100)
})

function hieddle(e) {
  isHide.value = !isHide.value
  // let l = document.getElementsByClassName('layout-content-left')
  // 获取所有具有指定类的元素
  var elements = document.getElementsByClassName('panel')

  // 遍历集合并设置样式
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.display = isHide.value ? 'none' : 'block' // 例如，将背景颜色设置为黄色
  }
}
</script>
