<script setup lang="ts">
import Selector from '#/components/Selector.vue'
import { analyze_score, calculate_score, question } from '#/data'
import { Gender } from '#/utils/gender'
import { encodeResultPayload } from '#/utils/resultPayload'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const styles = defineStyleX({
  form: {
    overflowX: 'hidden',
    maxWidth: '100vw',
  },
})
const router = useRouter()
const val = ref<(boolean | null)[]>(question.map(_ => null))
const assignedGender = ref<boolean | null>(null)
function handleSubmit() {
  const gender = assignedGender.value ? Gender.MALE : Gender.FEMALE
  const calculateScoreResult = calculate_score(val.value as boolean[], gender)
  const analyzeScoreResult = analyze_score(calculateScoreResult)
  const data = encodeResultPayload({
    gender,
    calculateScoreResult,
    analyzeScoreResult,
  })
  router.push({
    path: '/result',
    query: { data },
  })
}
function handleRandomFill() {
  val.value = question.map(_ => Math.random() > 0.5)
}
</script>

<template>
  <form v-stylex="styles.form">
    <button type="button" @click="handleRandomFill">
      debug
    </button>
    <button type="button" @click.prevent="handleSubmit">
      submit
    </button>
    <Selector v-model="assignedGender" assigned-gender question="你的指派性别？" :num="-1" />
    <Selector v-for="q, i in question" :key="i" v-model="val[i]" :question="q" :num="i" />
  </form>
</template>
