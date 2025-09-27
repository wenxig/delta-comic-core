import { AppDB as _AppDB, SaveItem as _SaveItem, SaveItem_ as _SaveItem_, appDB as _appDB } from './app'
import { FavouriteCard as _FavouriteCard, FavouriteDB as _FavouriteDB, FavouriteItem as _FavouriteItem, favouriteDB as _favouriteDB } from './favourite'

export namespace Db {
  export const AppDB = _AppDB
  export type SaveItem = _SaveItem
  export type SaveItem_ = _SaveItem_
  export const appDB = _appDB

  export type FavouriteCard = _FavouriteCard
  export const FavouriteDB = _FavouriteDB
  export type FavouriteItem = _FavouriteItem
  export const favouriteDB = _favouriteDB

}