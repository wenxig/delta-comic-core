<script setup lang="ts" generic="T extends Configure, O extends (keyof T)[] = (keyof T)[]">
import { NForm } from 'naive-ui'
import DcFormItem from './DcFormItem.vue'
import type { Configure, Result, SingleResult } from '../type'
import { isArray } from 'es-toolkit/compat'

defineProps<{
  configs: T
  /**
   * 设置为`true`，则所有的`DcFormItem`都会替换；如果是数组，则它仅替换数组内包含的`key`的`DcFormItem`
   */
  overrideRow?: boolean | O
}>()
const result = defineModel<Result<T>>({ default: {} })

const slots = defineSlots<{
  default?<K extends O[number], S extends T[K]>(args: {
    config: S
    path: K
    modelValue: SingleResult<S>
    setModelValue(value: SingleResult<S>): void
  }): any
}>()
</script>

<template>
  <NForm :model="result">
    <template v-for="[path, config] of Object.entries(configs)">
      <slot
        :modelValue="result[path]"
        :setModelValue="v => ((result[path] as any) = v)"
        :path
        :config="config as any"
        v-if="slots.default && (isArray(overrideRow) ? overrideRow.includes(path) : overrideRow)"
      />
      <DcFormItem v-model="result[path]" :path :config v-else />
    </template>
  </NForm>
</template>