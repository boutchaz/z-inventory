const sqlite3 = require('sqlite3')
import utils from '@/src/utils'
import Database from '@/src/services/index'

const db = new Database()
console.log(db)
export const initialState = {
  zakaria: 1,
}

export function ACTION_ADD_ZAKARIA(
  data: StoreDatas['ACTION_ADD_COUNT'],
  state: StoreStates,
  action: StoreAction<'ACTION_ADD_COUNT'>
): { zakaria: StoreStates['zakaria'] } {
  console.log({ data, state, action })
  return { zakaria: data }
}
export function ACTION_GET_ZAKARIA(
  data: StoreDatas['ACTION_ADD_COUNT'],
  state: StoreStates,
  action: StoreAction<'ACTION_ADD_COUNT'>
): any {
  console.log({ data, state, action })
  db.getItem('1')
    .then((response: any) => (response.error ? console.log(response.error) : console.log(response)))
    .catch((ex: any) => {
      console.error('Error in trying to get items: ', ex)
    })
  console.log(db)
  return { zakaria: data }
}
declare global {
  interface StoreStates {
    zakaria: number
  }

  interface StoreDatas {
    ACTION_ADD_ZAKARIA: StoreStates['zakaria']
    ACTION_GET_ZAKARIA: StoreStates['zakaria']
  }
}
