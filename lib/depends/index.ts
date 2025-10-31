import type { uni } from "@/struct"
import type { Component } from "vue"
import type { Utils } from ".."

interface DependDefineConstraint<_T> {
}
export type DependDefine<T> = symbol & DependDefineConstraint<T>

export const declareDependType = <T>(name: string) => <DependDefine<T>>Symbol.for(`expose:${name}`)

export const requireDepend = <T>(define: DependDefine<T>): T => _pluginExposes.get(define)!

export const _pluginExposes = new Map<symbol, any>()

export const coreModule = declareDependType<{
  layout: Record<string, uni.content.ViewLayoutComp>
  view: Record<string, uni.content.ViewComp>
  comp: {
    Comment: Component<{
      item: uni.item.Item
      comments: Utils.data.RStream<uni.comment.Comment>
    }>
    ItemCard: uni.content.ItemCardComp
    FavouriteSelect: Component<{
      item: uni.item.Item
    }>
  }
}>('core')