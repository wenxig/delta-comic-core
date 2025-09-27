<script setup lang='ts'>
import { computed, shallowRef, useTemplateRef } from 'vue'
import FloatPopup from '@/components/floatPopup.vue'
import { useElementSize } from '@vueuse/core'

const floatPopup = useTemplateRef('floatPopup')
const contentBox = useTemplateRef('contentBox')
const { height: contentBoxHeight } = useElementSize(contentBox)
const user = shallowRef<any>()

defineExpose({
  show(u: any) {
    floatPopup.value?.show(1)
    user.value = u
  },
  isShowing: computed(() => floatPopup.value?.isShowing),
  close() {
    floatPopup.value?.close()
  }
})
const anchors = computed(() => [0, (contentBoxHeight.value || Math.floor(window.innerHeight * 0.20)) + 30, 42 + 30 + (contentBoxHeight.value || Math.floor(window.innerHeight * 0.20))])
</script>

<template>
  <FloatPopup ref="floatPopup" :anchors overlay class="overflow-hidden">
    <div class="overflow-hidden">
      <div ref="contentBox" class="w-full flex justify-center items-start backdrop-blur-lg van-hairline--bottom">

      </div>
    </div>
  </FloatPopup>
</template>