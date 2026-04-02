<script setup lang="ts">
import AppFooter from '#/components/AppFooter.vue'
</script>

<template>
  <main>
    <RouterView />
    <AppFooter />
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}
:root {
  overflow-x: clip;
}
body {
  text-autospace: normal;
  overflow-x: clip;
}
</style>
