import { useLocalStorage } from "@vueuse/core"
import { AppDB, type SaveItem, type SaveItem_ } from "./app"
import type { Table } from "dexie"
import { useLiveQueryRef, type LiveQueryRef } from "@/utils/db"
import { defaults, isEmpty, uniq } from "lodash-es"
import { PromiseContent } from "@/utils/data"
import type { uni } from "@/struct"
import { useGlobalVar } from "@/utils/plugin"

export interface FavouriteItem {
  itemKey: string
  addtime: number
  belongTo: (FavouriteCard['createAt'])[]
  ep: uni.ep.RawEp
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
      favouriteItemBase: 'addtime, *belongTo, itemKey -> itemBase.key, ep',
      favouriteCardBase: 'createAt, title, private, description'
    })
  }

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
    aims: FavouriteItem['belongTo'],
    ep: uni.ep.RawEp
  })[]) {
    return PromiseContent.fromPromise(
      favouriteDB.transaction('readwrite', [favouriteDB.itemBase, favouriteDB.favouriteItemBase], async tran => {
        await tran.itemBase.bulkPut(items.map(v => AppDB.createSaveItem(v.item)))
        await Promise.all(items.map(async ({ aims, item, fItem, ep }) => {
          const belongTo = uniq(aims.concat(fItem?.belongTo ?? []))
          if (isEmpty(belongTo)) fItem && await this.$removeItems(fItem.addtime)
          else await tran.favouriteItemBase.put({
            addtime: fItem?.addtime ?? Date.now(),
            belongTo,
            itemKey: AppDB.createSaveItem(item).key,
            ep
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

  public defaultPack: LiveQueryRef<FavouriteCard | undefined> = useLiveQueryRef(() => favouriteDB.favouriteCardBase.where('createAt').equals(0).first(), undefined)

  public mainFilters = useLocalStorage('app.filter.favourite.main', new Array<string>())
  public infoFilters = useLocalStorage('app.filter.favourite.info', new Array<string>())

  public $init = () => this.$setCards({
    title: '默认收藏夹',
    createAt: 0,
    description: "默认收藏内容",
    private: true
  })
}
export const favouriteDB = useGlobalVar(new FavouriteDB(), 'db/favouriteDB')
