<script setup lang="ts">
import { ref } from 'vue'
import Selector from './components/Selector.vue'
import { question } from './data'

const styles = defineStyleX({ form: { overflowX: 'hidden', maxWidth: '100vw' } })
const form = ref<HTMLFormElement>()
const val = ref<(boolean | null)[]>(question.map(_ => null))
// function handleSubmit(e: Event) {
//   console.log(e)
// }
</script>

<template>
  <main>
    {{ val }}
    <form ref="form" v-stylex="styles.form">
      <Selector v-for="q, i in question" :key="i" v-model="val[i]" :question="q" :num="i" />
    </form>
  </main>
</template>

<style>
</style>
