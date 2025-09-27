import { shallowReactive, type Component, type StyleValue } from "vue"
export namespace User {
  export type UserInfoComp = Component<{
    user: object
    class?: any
    style?: StyleValue
    isUserPage?: boolean
    editable?: boolean
  }, any, any, any, any, { click: [] }>
  /**
   * key: plugin name
  */
  export const userInfoCompBase = shallowReactive(new Map<string, UserInfoComp>())


}