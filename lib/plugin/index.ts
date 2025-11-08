import { ContentPage } from "@/struct/content"
import { isFunction } from "es-toolkit/compat"
import { Image } from "@/struct/image"
import { SharedFunction } from "@/utils/eventBus"
import { Comment } from "@/struct/comment"
import { User } from "@/struct/user"
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
  if (content) {
    for (const [ct, comp] of Object.entries(content.layout ?? {})) ContentPage.setViewLayout(ct, comp)
    for (const [ct, comp] of Object.entries(content.itemCard ?? {})) ContentPage.setItemCard(ct, comp)
    for (const [ct, page] of Object.entries(content.contentPage ?? {})) ContentPage.setContentPage(ct, page)
    for (const [ct, row] of Object.entries(content.commentRow ?? {})) Comment.setCommentRow(ct, row)
  }
  if (image) {
    if (image.forks) for (const [name, url] of Object.entries(image.forks)) Image.setFork(plugin, name, url)
    if (image.process) for (const [name, fn] of Object.entries(image.process)) Image.setProcess(plugin, name, fn)
  }
  if (search) {
    if (search.categories)
      for (const c of search.categories) ContentPage.setCategories(plugin, c)
    if (search.tabbar)
      for (const c of search.tabbar) ContentPage.setTabbar(plugin, c)
    if (search.hotPage) {
      for (const mlc of search.hotPage.mainListCard ?? []) ContentPage.setMainList(plugin, mlc)
      for (const lb of search.hotPage.levelBoard ?? []) ContentPage.setLevelboard(plugin, lb)
      for (const tb of search.hotPage.topButton ?? []) ContentPage.setTopButton(plugin, tb)
    }
  }
  if (user) {
    if (user.edit) User.userEditorBase.set(plugin, user.edit)
    if (user.authorActions)
      for (const [key, value] of Object.entries(user.authorActions))
        User.setAuthorActions(plugin, key, value)
  }
  if (subscribe) {
    for (const [key, value] of Object.entries(subscribe))
      User.setSubscribes(plugin, key, value)
  }
  if (cfg.config) {
    for (const config of cfg.config) {
      useConfig().$resignerConfig(config)
    }
  }
  return SharedFunction.call('addPlugin', cfg)
}