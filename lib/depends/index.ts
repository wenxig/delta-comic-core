import type { RemovableRef } from '@vueuse/core'
import type { Component, MaybeRefOrGetter, ShallowRef, SlotsType } from 'vue'

import { Kysely } from 'kysely'

import type { uni } from '@/struct'

import type { Utils } from '..'
interface DependDefineConstraint<_T> {}
export type DependDefine<T> = symbol & DependDefineConstraint<T>

export const declareDependType = <T>(name: string) => <DependDefine<T>>Symbol.for(`expose:${name}`)

export const requireDepend = <T>(define: DependDefine<T>): T => _pluginExposes.get(define)!

export const _pluginExposes = new Map<symbol, any>()

export const coreModule = declareDependType<{
  layout: Record<string, uni.content.ViewLayoutComp>
  view: Record<string, uni.content.ViewComp>
  comp: {
    Comment: Component<{ item: uni.item.Item; comments: Utils.data.RStream<uni.comment.Comment> }>
    CommentRow: Component<
      {
        comment: uni.comment.Comment
        parentComment?: uni.comment.Comment
        usernameHighlight?: boolean
      },
      any,
      any,
      any,
      any,
      { click: [c: uni.comment.Comment]; clickUser: [u: uni.user.User] },
      SlotsType<{ userExtra(): any }>
    >
    ItemCard: uni.item.ItemCardComp
    FavouriteSelect: Component<{ item: uni.item.Item }>
    AuthorIcon: Component<{
      author: { $$plugin: string; icon: string | uni.resource.RawResource }
      sizeSpacing: number
    }>
  }
  db: ShallowRef<Kysely<any>, Kysely<any>>
  useNativeStore: UseNativeStore
}>('core')

export type UseNativeStore = <T>(
  namespace: string,
  key: MaybeRefOrGetter<string>,
  defaultValue: MaybeRefOrGetter<T>
) => RemovableRef<T>