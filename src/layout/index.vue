<template>
  <div class="layout">
    <Header>云锦-诸葛云可视化系统</Header>
    <div class="layout-content">
      <div class="layout-content-left">
        <Panel>
          <div>设备1 2025/04/23 12:00 <span style="color: red">异常</span></div>
          <div>设备2 2025/04/23 13:00 <span style="color: green">异常</span></div>
          <div>设备3 2025/04/23 14:00 <span style="color: green">异常</span></div>
        </Panel>
        <Panel>
          <PieChart></PieChart>
        </Panel>
        <Panel>
          <LineCharts></LineCharts>
        </Panel>
      </div>
      <div class="layout-content-right">
        <Panel>
          <PieChart></PieChart>
        </Panel>
        <Panel>
          <LineCharts></LineCharts>
        </Panel>
      </div>
      <Sence></Sence>
    </div>
  </div>
</template>

<script setup lang="ts" name="Layout">
import Header from './Header.vue'
import Sence from '@/components/Sence.vue'
import Panel from '@/components/Panel/index.vue'
import LineCharts from '@/components/Charts/LineChart.vue'
import PieChart from '@/components/Charts/PieChart.vue'
</script>

<style scope>
.layout {
  width: 100vw;
  height: 100vh;
}

.layout-content {
  width: 100vw;
  height: 100vh;
  background-color: #fff;
}

.layout-content-left {
  position: absolute;
  left: 0.3rem;
  top: 80px;
  width: 30vw;
}

.layout-content-right {
  position: absolute;
  right: -2rem;
  top: 80px;
  width: 30vw;
}

.panel {
  margin-bottom: 0.3rem;
}
</style>
