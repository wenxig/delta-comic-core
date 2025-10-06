import Await from './components/await.vue'
import Loading from './components/loading.vue'
import FloatPopup from './components/floatPopup.vue'
import Image from './components/image.vue'
import List from './components/list.vue'
import Popup from './components/popup.vue'
import RouterTab from './components/routerTab.vue'
import Text from './components/text.vue'
import ToggleIcon from './components/toggleIcon.vue'
import Var from './components/var.vue'
import Waterfall from './components/waterfall.vue'
import Content from './components/content.vue'

import UserFavouriteSelect from './components/user/favouriteSelect.vue'
import UserCreateFavouriteCard from './components/user/createFavouriteCard.vue'
import UserPreviewUser from './components/user/previewUser.vue'

import ContentUnitCard from './components/content/unitCard.vue'

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
  Waterfall,
  user: {
    FavouriteSelect: UserFavouriteSelect,
    CreateFavouriteCard: UserCreateFavouriteCard,
    PreviewUser: UserPreviewUser
  },
  content: {
    UnitCard: ContentUnitCard
  }
}


export { uni } from './struct/index'

import * as uData from './utils/data'
import * as uDelay from './utils/delay'
import * as uEventBus from './utils/eventBus'
import * as uImage from './utils/image'
import * as uLayout from './utils/layout'
import * as uRequest from './utils/request'
import * as uDb from './utils/db'
import * as uTranslate from './utils/translate'
import * as uMessage from './utils/message'

export namespace Utils {
  export import data = uData
  export import delay = uDelay
  export import eventBus = uEventBus
  export import image = uImage
  export import layout = uLayout
  export import request = uRequest
  export import translate = uTranslate
  export import db = uDb
  export import message = uMessage
}
import { useTemp } from './stores/temp'
import { useConfig } from './config'
export const Store = {
  useTemp,
  useConfig
}

export { Db } from './db'

import './index.css'

export { User } from './layout/user'

export * from "./plugin"