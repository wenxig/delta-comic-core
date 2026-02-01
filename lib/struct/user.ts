import { shallowReactive, type Component } from 'vue'

import type { AuthorAction, PluginConfigSubscribe } from '@/plugin/define'

import { SourcedKeyMap } from '@/utils/data'

import type { uni } from '.'
import type { RawResource } from './resource'

import { Image } from './image'

export interface RawUser {
  avatar?: RawResource
  name: string
  id: string
  $$plugin: string
}

export abstract class User {
  public static userBase = shallowReactive(new Map<string, User>())
  public static userEditorBase = shallowReactive(new Map<string, Component>())

  public static subscribes = shallowReactive(
    SourcedKeyMap.create<[plugin: string, type: string], PluginConfigSubscribe>()
  )

  public static authorActions = shallowReactive(
    SourcedKeyMap.create<[plugin: string, type: string], AuthorAction>()
  )

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
export type UserCardComp = Component<{ user: uni.user.User; isSmall?: boolean }>