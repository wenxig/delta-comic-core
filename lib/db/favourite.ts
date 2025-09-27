import { useLocalStorage } from "@vueuse/core"
import { AppDB,  type SaveItem, type SaveItem_ } from "./app"
import type { Table } from "dexie"
import { useLiveQueryRef } from "@/utils/db"
import { defaults, uniq } from "lodash-es"
import { PromiseContent } from "@/utils/data"

export interface FavouriteItem {
  itemKey: string
  addtime: number
  belongTo: (FavouriteCard['createAt'])[]
}

export interface FavouriteCard {
  title: string
  private: boolean
  description: string
  createAt: number
}

export class FavouriteDB extends AppDB {
  public favouriteItemBase!: Table<FavouriteItem, FavouriteItem['addtime'], FavouriteItem, {
    itemBase: SaveItem
  }>
  public favouriteCardBase!: Table<FavouriteCard, FavouriteCard['createAt']>
  constructor() {
    super()
    this.version(AppDB.createVersion()).stores({
      favouriteItemBase: 'addtime, *belongTo, itemKey -> itemBase.key',
      favouriteCardBase: 'createAt, title, private, description'
    })
  }

  public favouriteItem = useLiveQueryRef(() => favouriteDB.favouriteItemBase.with({
    itemBase: 'itemKey'
  }), [])
  public favouriteCard = useLiveQueryRef(() => favouriteDB.favouriteCardBase.toArray(), [])

  public async $setCards(...cards: (Partial<Omit<FavouriteCard, 'title'>> & Pick<FavouriteCard, 'title'>)[]) {
    return PromiseContent.fromPromise(
      favouriteDB.favouriteCardBase.bulkPut(cards.map(card => defaults(card, {
        private: false,
        description: '',
        createAt: Date.now()
      })))
    )
  }
  public async $clearCards(...cardCreateAts: FavouriteCard['createAt'][]) {
    return PromiseContent.fromPromise(
      favouriteDB.favouriteItemBase.where('belongTo').anyOf(cardCreateAts).delete()
    )
  }

  public async $removeCards(...cardCreateAts: FavouriteCard['createAt'][]) {
    return PromiseContent.fromPromise(
      favouriteDB.transaction('readwrite', [favouriteDB.favouriteItemBase, favouriteDB.favouriteCardBase], async trans => {
        await this.$clearCards(...cardCreateAts)
        await trans.favouriteCardBase.bulkDelete(cardCreateAts)
      })
    )
  }

  public async $setItems(...items: ({
    fItem?: FavouriteItem,
    item: SaveItem_,
    aims: FavouriteItem['belongTo']
  })[]) {
    return PromiseContent.fromPromise(
      favouriteDB.transaction('readwrite', [favouriteDB.itemBase, favouriteDB.favouriteItemBase], async tran => {
        await tran.itemBase.bulkPut(items.map(v => AppDB.createSaveItem(v.item)))
        await Promise.all(items.map(async ({ aims, item, fItem }) => {
          await tran.favouriteItemBase.put({
            addtime: fItem?.addtime ?? Date.now(),
            belongTo: uniq(aims.concat(fItem?.belongTo ?? [])),
            itemKey: AppDB.createSaveItem(item).key
          })
        }))
      })
    )
  }

  public async $removeItems(...keys: FavouriteCard['createAt'][]) {
    return PromiseContent.fromPromise(
      favouriteDB.favouriteItemBase.where('createAt').anyOf(keys).delete()
    )
  }

  public defaultPack = useLiveQueryRef(() => favouriteDB.favouriteCardBase.where('createAt').equals(0).first(), undefined)

  public mainFilters = useLocalStorage('app.filter.favourite.main', new Array<string>())
  public infoFilters = useLocalStorage('app.filter.favourite.info', new Array<string>())

  public $init = () => this.$setCards({
    title: '默认收藏夹',
    createAt: 0,
    description: "默认收藏内容",
    private: true
  })
}
export const favouriteDB: FavouriteDB = window.$api._lib_.FavouriteDB ??= new FavouriteDB()
