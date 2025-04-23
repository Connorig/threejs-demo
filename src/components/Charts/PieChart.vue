<template>
  <div class="chart" ref="chartRef"></div>
</template>

<script setup lang="ts" name="PieCharts">
import { useChart } from '@/hooks/useChart'
import type { EChartsOption } from 'echarts'
import { ref, type Ref, onMounted } from 'vue'

const chartRef: Ref = ref(null)
const { setOptions } = useChart(chartRef)
let option: EChartsOption

onMounted(() => {
  init()
})

const init = () => {
  option = {
    title: {
      text: ' ',
      left: 'center',
      top:'40px',
      textStyle: {
        color: '#fff',
        fontSize: '0.3rem',
      }
    },
    tooltip: {
      trigger: 'item',
      textStyle: {
        fontSize: '0.2rem'
      }
    },
    // legend: {
    //   orient: 'vertical',
    //   left: 'left',
    // },
    series: [
      {
        name: '统计',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 1048, name: '设备1' },
          { value: 735, name: '设备2' },
          { value: 580, name: '设备3' },
          { value: 484, name: '设备4' },
          { value: 300, name: '设备5' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          fontSize: '0.2rem',
          color: '#fff',
          fontWeight: 'bold'
        }
      }
    ],
    textStyle: {}
  }

  setOptions(option)
}
</script>

<style scope>
.chart {
  width: 100%;
  height: 300px;
  //border: 2px solid white;
}
</style>
