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
body {
  text-autospace: normal;
}
</style>
