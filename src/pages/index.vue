<script setup lang="ts">
import TestFlow from '#/components/test/TestFlow.vue'
import { analyze_score, calculate_score } from '#/data'
import { Gender } from '#/utils/gender'
import { encodeResultPayload } from '#/utils/resultPayload'
import { useRouter } from 'vue-router'

const router = useRouter()

function handleSubmit(payload: { answers: boolean[], assignedGender: boolean }) {
  const gender = payload.assignedGender ? Gender.MALE : Gender.FEMALE
  const calculateScoreResult = calculate_score(payload.answers, gender)
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
</script>

<template>
  <TestFlow @submit="handleSubmit" />
</template>
