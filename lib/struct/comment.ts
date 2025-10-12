import { Struct, type MetaData, type RStream } from "@/utils/data"
import { shallowReactive, type Component } from "vue"
import { uni } from "."
import dayjs from "dayjs"
import type { User } from "./user"

export interface RawComment {
  sender: uni.user.User
  content: {
    type: 'string' | 'html'
    text: string
  }
  time: number
  id: string
  childrenCount: number
  likeCount: number
  isLiked: boolean
  reported: boolean
  $$plugin: string
  $$meta?: MetaData
  isTop: boolean
}
export type CommentRow = Component<{
  comment: Comment
  item: uni.item.Item
  parentComment?: Comment
}>
export abstract class Comment extends Struct<RawComment> implements RawComment {
  private static commentRow = shallowReactive(new Map<string, CommentRow>())
  public static setCommentRow(ct_: uni.content.ContentType_, component: CommentRow): string {
    const fullName = uni.content.ContentPage.toContentTypeString(ct_)
    this.commentRow.set(fullName, component)
    return fullName
  }
  public static getCommentRow(ct_: uni.content.ContentType_) {
    const ct = uni.content.ContentPage.toContentTypeString(ct_)
    return this.commentRow.get(ct)
  }

  constructor(v: RawComment) {
    super(v)
    this.content = v.content
    this.time = v.time
    this.id = v.id
    this.childrenCount = v.childrenCount
    this.likeCount = v.likeCount
    this.isLiked = v.isLiked
    this.reported = v.reported
    this.$$plugin = v.$$plugin
    this.$$meta = v.$$meta
    this.isTop = v.isTop
  }
  public abstract sender: User
  public content: {
    type: 'string' | 'html'
    text: string
  }
  public time: number
  public $time() {
    return dayjs(this.time)
  }
  public id: string
  public childrenCount: number
  public likeCount: number
  public isTop: boolean
  public isLiked: boolean
  public reported: boolean
  public $$plugin: string
  public $$meta?: MetaData
  public abstract like(signal?: AbortSignal): PromiseLike<boolean>
  public abstract report(signal?: AbortSignal): PromiseLike<any>
  public abstract sendComment(text: string, signal?: AbortSignal): PromiseLike<any>
  public abstract children: RStream<Comment>
}