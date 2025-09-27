<script setup lang='ts'>
import { uni } from '@/struct'
import Image from '../image.vue'
import { computed, StyleValue, useTemplateRef } from 'vue'
const $props = withDefaults(defineProps<{
  item: {
    $cover: uni.image.Image
    title: string
  }
  freeHeight?: boolean
  disabled?: boolean
  type?: 'default' | 'big' | 'small'
  class?: any
  style?: StyleValue
}>(), {
  type: 'default'
})
const $emit = defineEmits<{
  click: []
}>()
const cover = useTemplateRef('cover')
const imageRatio = computed(() => cover.value?.isLoaded ? 'unset' : `${$props.item.$cover.aspect?.width || 3} / ${$props.item.$cover.aspect?.height || 4}`)

defineSlots<{
  default(): void
  smallTopInfo(): void
}>()
</script>

<template>
  <div ref="container" @click="$emit('click')" :disabled v-if="type != 'small'"
    class="overflow-hidden w-full van-hairline--top-bottom bg-(--van-background-2) text-(--van-text-color) relative p-2 flex"
    :style="[{ height: freeHeight ? 'auto' : '140px' }, style]"
    :class="[{ 'van-haptics-feedback': !disabled }, $props.class]">
    <Image :src="item.$cover" v-if="type == 'big'" class="blur-lg absolute top-0 left-0 w-full h-full" fit="cover" />
    <Image :src="item.$cover" class="!rounded-lg image-size z-2 flex-3" fit="contain" ref="cover" />
    <div class="flex absolute flex-col flex-7 *:text-justify pl-2">
      <span class="mt-3 van-multi-ellipsis--l3">{{ item.title }}</span>
      <div class="absolute bottom-2 text-(--van-text-color-2) text-sm">
        <slot />
      </div>
    </div>
  </div>

  <div :style="[{ height: freeHeight ? 'auto' : '140px' }, style]" v-else @click="$emit('click')" :disabled
    :class="[{ 'van-haptics-feedback': !disabled }, $props.class]" ref="container"
    class="overflow-hidden w-full rounded-lg block van-hairline--top-bottom bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative p-0 items-center">
    <div class="w-full flex items-center relative">
      <Image v-if="!$slots.cover" :src="item.$cover" class="rounded-t-lg w-full image-size" fit="cover" ref="cover" />
      <div
        class="absolute w-full h-6 !text-[10px] text-white bg-[linear-gradient(transparent,rgba(0,0,0,0.9))] bottom-0 flex pb-0.5 gap-1 pl-1 items-end justify-start *:flex *:items-center">
        <slot name="smallTopInfo" />
      </div>
    </div>
    <div class="w-full overflow-hidden p-1 flex flex-col text-(--van-text-color)">
      <div class="flex flex-nowrap">
        <span class="text-start text-sm">{{ item.title }}</span>
      </div>
      <div class=" my-1 w-full h-auto flex-nowrap flex items-center">
        <slot />
      </div>
    </div>
  </div>
</template>
<style scoped lang='scss'>
:deep(.image-size) {
  aspect-ratio: v-bind("imageRatio");
}
</style>