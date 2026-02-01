export { uni } from './struct/index'
import type { useDialog, useLoadingBar, useMessage } from 'naive-ui'
import type { Component, MaybeRefOrGetter } from 'vue'
import type { Router } from 'vue-router'

import { uni } from './struct/index'
export interface ExternalLibKey {
  vue: 'Vue'
  vant: 'Vant'
  'naive-ui': 'Naive'
  axios: 'Axios'
  'delta-comic-core': 'Dcc'
  'vue-router': 'VR'
  pinia: 'Pinia'
}

declare global {
  interface Window {
    $message: ReturnType<typeof useMessage>
    $loading: ReturnType<typeof useLoadingBar>
    $dialog: ReturnType<typeof useDialog>
    $api: Record<string, any>
    $$lib$$: Record<ExternalLibKey[keyof ExternalLibKey], any>
    $$safe$$: boolean
    $router: Router
    $layout: Record<string, uni.content.ViewLayoutComp>
    $view: Record<string, uni.content.ViewComp>
    $comp: {
      Comment: Component<{
        item: uni.item.Item
        comments: Utils.data.RStream<uni.comment.Comment>
      }>
    }
    $isDev: boolean
  }
}
declare module 'axios' {
  interface AxiosRequestConfig {
    __retryCount?: number
    disretry?: boolean
    allowEmpty?: boolean
  }
}

declare module 'vue-router' {
  interface Router {
    force: {
      push: Router['push']
      replace: Router['replace']
    }
  }
  interface RouteMeta {
    statusBar?: MaybeRefOrGetter<'dark' | 'light' | 'auto'>
    force?: boolean
  }
}

import Await from './components/await.vue'
import Content from './components/content.vue'
import FloatPopup from './components/floatPopup.vue'
import Image from './components/image.vue'
import List from './components/list.vue'
import Loading from './components/loading.vue'
import Popup from './components/popup.vue'
import RouterTab from './components/routerTab.vue'
import Text from './components/text.vue'
import ToggleIcon from './components/toggleIcon.vue'
import Var from './components/var.vue'
import Waterfall from './components/waterfall.vue'

export const Comp = {
  Await,
  Loading,
  Content,
  FloatPopup,
  Image,
  List,
  Popup,
  RouterTab,
  Text,
  ToggleIcon,
  Var,
  Waterfall
}

import * as uData from './utils/data'
import * as uEventBus from './utils/eventBus'
import * as uImage from './utils/image'
import * as uLayout from './utils/layout'
import * as uMessage from './utils/message'
import * as uRequest from './utils/request'
import * as uTranslate from './utils/translate'

export namespace Utils {
  export import data = uData
  export import eventBus = uEventBus
  export import image = uImage
  export import layout = uLayout
  export import request = uRequest
  export import translate = uTranslate
  export import message = uMessage
}
import { useConfig, ConfigPointer, appConfig } from './config'
import { useTemp } from './stores/temp'
export const Store = {
  useTemp,
  useConfig,
  appConfig,
  ConfigPointer
}

import './index.css'

export * from './plugin/index'

export * from './depends'

export * from './plugin/define.ts'

import _package from '../package.json'
export const version = _package.version
