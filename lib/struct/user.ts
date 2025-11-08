import type { AuthorAction, PluginConfigSubscribe } from "@/plugin/define"
import type { uni } from "."
import { Image, type RawImage } from "./image"
import { shallowReactive, type Component } from "vue"

export interface RawUser {
  avatar?: RawImage
  name: string
  id: string
  $$plugin: string
}

export abstract class User {
  public static userBase = shallowReactive(new Map<string, User>())
  public static userEditorBase = shallowReactive(new Map<string, Component>())

  public static subscribes = shallowReactive(new Map<string, PluginConfigSubscribe>())
  public static setSubscribes(plugin: string, type: string, config: PluginConfigSubscribe) {
    this.subscribes.set(`${plugin}:${type}`, config)
  }
  public static getSubscribes(plugin: string, type: string) {
    return this.subscribes.get(`${plugin}:${type}`)
  }

  public static authorActions = shallowReactive(new Map<string, AuthorAction>())
  public static setAuthorActions(plugin: string, type: string, config: AuthorAction) {
    this.authorActions.set(`${plugin}:${type}`, config)
  }
  public static getAuthorActions(plugin: string, type: string) {
    return this.authorActions.get(`${plugin}:${type}`)
  }

  constructor(v: RawUser) {
    if (v.avatar) this.avatar = Image.create(v.avatar)
    this.name = v.name
    this.id = v.id
    this.$$plugin = v.$$plugin
  }
  public avatar?: Image
  public name: string
  public id: string
  public $$plugin: string
  public abstract customUser: object
}
export type UserCardComp = Component<{
  user: uni.user.User
  isSmall?: boolean
}>