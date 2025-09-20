import * as image from "./image"
import { Struct, type MetaData } from "@/utils/data"
import dayjs from "dayjs"
import { isString } from "lodash-es"
import type { Component } from "vue"

export interface ViewLayout {
  plugin: string
  name: string
  componentPointer: string
}
export type ViewLayout_ = string | ViewLayout

export interface ContentType {
  plugin: string
  name: string
  layout: ViewLayout
}
/** 
 * @example "bika:comic#core:default"
 * "91video:video#core:default"
 * "bika:comic#jm:comic"
 */
export type ContentType_ = ContentType | string

export interface RawItem {
  cover: image.RawImage
  title: string
  id: string
  categories: string[]
  author: string[]
  viewNumber?: number
  likeNumber?: number
  commentNumber?: number
  isLiked?: boolean
  updateTime?: number
  customIsAI?: boolean
  contentType: ContentType_

  $$plugin: string
  $$meta: MetaData & {
    defaultLayoutAvatar?: image.Image_
  }
}
export class Item extends Struct<RawItem> implements RawItem {
  private static viewLayout = new Map<string, Component>()
  public static setViewLayout(plugin: string, name: string, component: Component): ViewLayout {
    const fullName = `${plugin}:${name}`
    this.viewLayout.set(fullName, component)
    return {
      componentPointer: fullName,
      name,
      plugin
    }
  }
  public static toViewLayout(vl: ViewLayout_): ViewLayout {
    if (isString(vl)) {
      const [plugin, name] = vl.split(':')
      return {
        name, plugin,
        componentPointer: `${plugin}:${name}`
      }
    }
    return vl
  }
  public static toContentType(ct: ContentType_): ContentType {
    if (isString(ct)) {
      const [c, v] = ct.split('#')
      const [plugin, name] = c.split(':')
      return {
        name, plugin,
        layout: this.toViewLayout(v)
      }
    }
    return ct
  }

  public static is(value: unknown): value is Item {
    return value instanceof this
  }
  public cover: image.RawImage
  public get $cover() {
    return new image.Image(this.cover)
  }
  public title: string
  public id: string
  public categories: string[]
  public author: string[]
  public viewNumber?: number
  public likeNumber?: number
  public commentNumber?: number
  public isLiked?: boolean
  public description?: string
  public updateTime?: number
  public get $updateTime() {
    return dayjs(this.updateTime)
  }
  public contentType: ContentType
  public $$plugin: string
  public $$meta
  constructor(v: RawItem) {
    super(v)
    this.$$plugin = v.$$plugin
    this.$$meta = v.$$meta

    this.updateTime = v.updateTime
    this.cover = v.cover
    this.title = v.title
    this.id = v.id
    this.categories = v.categories
    this.author = v.author
    this.viewNumber = v.viewNumber
    this.likeNumber = v.likeNumber
    this.commentNumber = v.commentNumber
    this.isLiked = v.isLiked
    this.customIsAI = v.customIsAI
    this.contentType = Item.toContentType(v.contentType)
  }

  public customIsAI?: boolean
  public get $isAi() {
    const check = (str: string) => (/(^|[\(（\[\s【])ai[】\)）\]\s]?/ig).test(str)
    return this.customIsAI || check(this.title) || this.author.some(author => check(author))
  }
}

