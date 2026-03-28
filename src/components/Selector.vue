<script setup lang="ts">
import { useDraggable } from '@vueuse/core'
import { computed, useTemplateRef } from 'vue'

defineProps<{ question: string, num: number }>()

const SWIPE_THRESHOLD = 32

const el = useTemplateRef<HTMLElement>('el')
const styles = defineStyleX({
  fieldset: {
    position: 'relative',
    userSelect: 'none',
    touchAction: 'pan-y',
    cursor: 'grab',
    willChange: 'transform',
  },
  fieldsetDragging: {
    cursor: 'grabbing',
  },
  option: {
    cursor: 'pointer',
  },
})

const model = defineModel<(boolean | null)>()

const { isDragging, x, position } = useDraggable(el, {
  initialValue: { x: 0, y: 0 },
  axis: 'x',
  onEnd(endPosition) {
    if (endPosition.x <= -SWIPE_THRESHOLD)
      model.value = true
    else if (endPosition.x >= SWIPE_THRESHOLD)
      model.value = false
    else
      model.value = null

    if (endPosition.x !== 0)
      // Reset after release so CSS can animate the snap-back.
      position.value = { x: 0, y: 0 }
  },
})

const fieldsetStyle = computed(() => ({
  transform: `translate(${x.value}px, 0px)`,
  transition: isDragging.value ? 'none' : 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
}))
</script>

<template>
  <fieldset
    ref="el"
    v-stylex="[styles.fieldset, isDragging && styles.fieldsetDragging]"
    :style="fieldsetStyle"
  >
    <legend>{{ question }}</legend>
    <label v-stylex="styles.option">
      <input v-model="model" type="radio" :name="num.toString()" :value="true">
      是
    </label>
    <label v-stylex="styles.option">
      <input v-model="model" type="radio" :name="num.toString()" :value="null">
      未选择
    </label>
    <label v-stylex="styles.option">
      <input v-model="model" type="radio" :name="num.toString()" :value="false">
      否
    </label>
  </fieldset>
</template>
