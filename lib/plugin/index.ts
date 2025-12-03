import { ContentPage } from "@/struct/content"
import { isFunction } from "es-toolkit/compat"
import { Image } from "@/struct/image"
import { SharedFunction } from "@/utils/eventBus"
import { Comment } from "@/struct/comment"
import { User } from "@/struct/user"
import { Item } from "@/struct/item"
import type { PluginConfig } from "./define"
import { useConfig } from "@/config"

export const definePlugin = (config: PluginConfig | ((safe: boolean) => PluginConfig)) => {
  if (isFunction(config)) var cfg = config(window.$$safe$$)
  else var cfg = config
  console.log('[definePlugin] new plugin defining...', cfg)
  const {
    name: plugin,
    content,
    image,
    search,
    user,
    subscribe
  } = cfg
  if (content)
    for (const [ct, { commentRow, contentPage, itemCard, layout, itemTranslator }] of Object.entries(content)) {
      if (layout) ContentPage.viewLayout.set(ct, layout)
      if (itemCard) ContentPage.itemCard.set(ct, itemCard)
      if (contentPage) ContentPage.contentPage.set(ct, contentPage)
      if (commentRow) Comment.commentRow.set(ct, commentRow)
      if (itemTranslator) Item.itemTranslator.set(ct, itemTranslator)
    }

  if (image) {
    if (image.forks) for (const [name, url] of Object.entries(image.forks)) Image.fork.set([plugin, name], url)
    if (image.process) for (const [name, fn] of Object.entries(image.process)) Image.processInstances.set([plugin, name], fn)
  }
  if (search) {
    if (search.categories)
      for (const c of search.categories) ContentPage.addCategories(plugin, c)
    if (search.tabbar)
      for (const c of search.tabbar) ContentPage.addTabbar(plugin, c)
    if (search.hotPage) {
      for (const mlc of search.hotPage.mainListCard ?? []) ContentPage.addMainList(plugin, mlc)
      for (const lb of search.hotPage.levelBoard ?? []) ContentPage.addLevelboard(plugin, lb)
      for (const tb of search.hotPage.topButton ?? []) ContentPage.addTopButton(plugin, tb)
    }
  }
  if (user) {
    if (user.edit) User.userEditorBase.set(plugin, user.edit)
    if (user.authorActions)
      for (const [type, value] of Object.entries(user.authorActions))
        User.authorActions.set([plugin, type], value)
    if (user.authorIcon)
      for (const [key, value] of Object.entries(user.authorIcon))
        Item.authorIcon.set([plugin, key], value)
  }
  if (subscribe) {
    for (const [key, value] of Object.entries(subscribe))
      User.subscribes.set([plugin, key], value)
  }
  if (cfg.config) {
    for (const config of cfg.config) {
      useConfig().$resignerConfig(config)
    }
  }
  return SharedFunction.call('addPlugin', cfg)
}