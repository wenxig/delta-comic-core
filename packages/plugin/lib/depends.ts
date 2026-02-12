import type { UseNativeStore } from '@delta-comic/utils'

import { Kysely } from 'kysely'
import type { ShallowRef } from 'vue'

interface DependDefineConstraint<_T> {}
export type DependDefine<T> = symbol & DependDefineConstraint<T>

export const declareDependType = <T>(name: string) => <DependDefine<T>>Symbol.for(`expose:${name}`)

export const requireDepend = <T>(define: DependDefine<T>): T => _pluginExposes.get(define)!

export const _pluginExposes = new Map<symbol, any>()

export const coreModule = declareDependType<{
  db: ShallowRef<Kysely<any>, Kysely<any>>
  useNativeStore: UseNativeStore
}>('core')