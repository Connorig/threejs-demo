<template>
  <div class="panel" @click="alert()">
    <div class="panel-title" @click="alert('s')">数据分析检测</div>
    <div class="panel-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts" name="Panel">

</script>

<style>
.panel_hide {
  display: none;
  padding: 20px;
  position: relative;
  box-sizing: border-box;
  //min-width: 100px;
  //width: 480px;
  height: 100%;
  background: linear-gradient(#99fffe, #99fffe) left -3px top 0,
    linear-gradient(#99fffe, #99fffe) left -3px top -3px,
    linear-gradient(#99fffe, #99fffe) right -3px top 0,
    linear-gradient(#99fffe, #99fffe) right -3px top -3px,
    linear-gradient(#99fffe, #99fffe) left -3px bottom 0,
    linear-gradient(#99fffe, #99fffe) left -3px bottom -3px,
    linear-gradient(#99fffe, #99fffe) right -3px bottom 0,
    linear-gradient(#99fffe, #99fffe) right -3px bottom -3px;
  background-color: rgba(0, 34, 51, 0.6);
  background-repeat: no-repeat;
  background-size: 20px 20px, 20px 20px;
  background-size: 3px 16px, 16px 3px;
  border: 1px solid transparent;
  backdrop-filter: blur(1px);
  color: #fff;
  z-index: 2;
}

.panel {
  padding: 20px;
  position: relative;
  box-sizing: border-box;
  //min-width: 100px;
  //width: 480px;
  width:60%;
  height: 30%;
  background: linear-gradient(#99fffe, #99fffe) left -3px top 0,
    linear-gradient(#99fffe, #99fffe) left -3px top -3px,
    linear-gradient(#99fffe, #99fffe) right -3px top 0,
    linear-gradient(#99fffe, #99fffe) right -3px top -3px,
    linear-gradient(#99fffe, #99fffe) left -3px bottom 0,
    linear-gradient(#99fffe, #99fffe) left -3px bottom -3px,
    linear-gradient(#99fffe, #99fffe) right -3px bottom 0,
    linear-gradient(#99fffe, #99fffe) right -3px bottom -3px;
  background-color: rgba(0, 34, 51, 0.6);
  background-repeat: no-repeat;
  background-size: 20px 20px, 20px 20px;
  background-size: 3px 16px, 16px 3px;
  border: 1px solid transparent;
  backdrop-filter: blur(1px);
  color: #fff;
  z-index: 2;
}

.panel-title {
  height: 0.5rem;
  margin-bottom: 0.1rem;
  font-size: 0.25rem;
  font-weight: bold;
  text-align: left;
  z-index: 100;
}

.panel-content {
  font-size: 0.2rem;
}
</style>
