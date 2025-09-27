import { defineStore } from "pinia"
import { shallowReactive, type Component, type StyleValue } from "vue"

export interface UserCompPointer {
  plugin: string
  name: string
}
export type UserCompPointer_ = UserCompPointer | string
export const useUserStore = defineStore('userStore', helper => {
  const userCompBase = shallowReactive(new Map<string, Component<{
    user: object
    class?: any
    style?: StyleValue
    isSmall?: boolean
    showDescription?: boolean
  }, any, any, any, any, { click: [] }>>())

  

  return { userCompBase }
})