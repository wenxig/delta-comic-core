import type { RemovableRef } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'

export type UseNativeStore = <T extends object>(
  namespace: string,
  key: MaybeRefOrGetter<string>,
  defaultValue: MaybeRefOrGetter<T>
) => RemovableRef<T>