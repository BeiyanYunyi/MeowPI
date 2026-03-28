<script setup lang="ts">
import Selector from '#/components/Selector.vue'
import { question } from '#/data'
import { ref } from 'vue'

const styles = defineStyleX({ form: { overflowX: 'hidden', maxWidth: '100vw' } })
const val = ref<(boolean | null)[]>(question.map(_ => null))
// function handleSubmit(e: Event) {
//   console.log(e)
// }
function handleRandomFill() {
  val.value = question.map(_ => Math.random() > 0.5)
}
</script>

<template>
  <form v-stylex="styles.form">
    <button type="button" @click="handleRandomFill">
      debug
    </button>
    <Selector v-for="q, i in question" :key="i" v-model="val[i]" :question="q" :num="i" />
  </form>
</template>
