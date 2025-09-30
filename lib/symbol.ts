import { useGlobalVar } from "./utils/plugin"

export const symbol = useGlobalVar(Object.freeze({
  thisNamespace: 'core'
}), 'symbol')