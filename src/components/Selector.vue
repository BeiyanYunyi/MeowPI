<script setup lang="ts">
import { useDraggable } from '@vueuse/core'
import { useTemplateRef } from 'vue'

defineProps<{ question: string, num: number }>()
const el = useTemplateRef<HTMLElement>('el')
const { style } = useDraggable(el, {
  initialValue: { x: 0, y: 0 },
  axis: 'x',
})

const model = defineModel<(boolean | null)>()
</script>

<template>
  <fieldset ref="el" :style="style">
    <legend>{{ question }}</legend>
    <label><input v-model="model" type="radio" :name="num.toString()" :value="true">是</label>
    <label><input v-model="model" type="radio" :name="num.toString()" :value="null">未选择</label>
    <label><input v-model="model" type="radio" :name="num.toString()" :value="false">否</label>
  </fieldset>
</template>

<style>
fieldset {
  position: relative;
}
</style>
