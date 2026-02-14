import { useGlobalVar } from '@delta-comic/utils'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { shallowRef, watch } from 'vue'

const isFullscreen = useGlobalVar(
  (() => {
    const isFc = shallowRef(false)
    const window = getCurrentWindow()
    window.isFullscreen().then(s => (isFc.value = s))
    watch(isFc, isFc => {
      window.setFullscreen(isFc)
    })
    return isFc
  })(),
  'core/isFc'
)

export const useFullscreen = () => ({
  isFullscreen,
  entry() {
    isFullscreen.value = true
  },
  exit() {
    isFullscreen.value = false
  },
  toggle() {
    isFullscreen.value = !isFullscreen.value
  }
})