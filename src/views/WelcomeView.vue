<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

function handleGoToResume() {
  router.push({
    path: '/resume/gaofeixiang'
  })
}
</script>

<template>
  <div class="">
    <button @click="handleGoToResume">前往简历页面</button>
  </div>
</template>

<style scoped lang="less">
botton {
  width: 200px;
  height: 80px;
  background-color: #fff;
}
</style>
