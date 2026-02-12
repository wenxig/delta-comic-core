<script setup lang="ts">
import type { SingleResult, Type } from '@/form/type'
import { isEmpty } from 'es-toolkit/compat'
import { NInput } from 'naive-ui'

defineProps<{ config: Type.String }>()

const store = defineModel<SingleResult<Type.String>>({ required: true })
</script>

<template>
  <NInput
    clearable
    :allowInput="v => (config.patten ? config.patten.test(v) || isEmpty(v) : true)"
    :defaultValue="config.defaultValue"
    :placeholder="config.placeholder"
    v-model:value="store"
  />
</template>