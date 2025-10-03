import * as image from "./image"
import { Struct, type MetaData } from "@/utils/data"
import dayjs from "dayjs"
import { ContentPage, type ContentType, type ContentType_ } from "./content"
import { useGlobalVar } from "@/utils/plugin"

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
  length: string
  epLength: string
  $$plugin: string
  $$meta: MetaData
}

export class Item extends Struct<RawItem> implements RawItem {
  private static _this
  static {
    this._this = useGlobalVar(this, 'uni/Item')
  }
  public static is(value: unknown): value is Item {
    return value instanceof this._this
  }
  public static create(v: RawItem): Item {
    return new this._this(v)
  }
  public cover: image.RawImage
  public get $cover() {
    return image.Image.create(this.cover)
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
  public length: string
  public epLength: string
  public $$plugin: string
  public $$meta
  private constructor(v: RawItem) {
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
    this.contentType = ContentPage.toContentType(v.contentType)
    this.length = v.length
    this.epLength = v.epLength
  }

  public customIsAI?: boolean
  public get $isAi() {
    const check = (str: string) => (/(^|[\(（\[\s【])ai[】\)）\]\s]?/ig).test(str)
    return this.customIsAI || check(this.title) || this.author.some(author => check(author))
  }
}

