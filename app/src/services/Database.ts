import * as faker from 'faker'
import _ from 'lodash'
import path from 'path'
import utils from '../utils'
const dbPath = path.join(__dirname, '../../dist/main/resources/', utils.config.DB_NAME)
const sqlite3 = require('sqlite3').verbose()

console.log(dbPath)
class Database {
  db: any
  constructor() {
    this.init()
  }
  async init() {
    this.db = new sqlite3.Database(dbPath, (err: any) => {
      if (err) {
        console.error(err.message)
      }
      console.log('Connected to the inventory database.')
    })
  }

  serializeAsync(queries: any) {
    return new Promise((resolve) => {
      this.db.serialize(() => {
        const statements = queries.map((query: any) => this.db.prepare(query))
        statements.map((statement: any) => statement.run())
      })
      resolve({ message: 'Database has been successfully updated' })
    })
  }

  runAsync(sql: string, params?: any) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err: any, data: any) {
        if (err) {
          const responseObj = {
            error: err,
          }
          reject(responseObj)
        } else {
          const responseObj: any = {
            statement: data,
          }
          resolve(responseObj)
        }
      })
    })
  }

  allAsync(sql: string, params?: any) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: any, rows: any) => {
        debugger
        console.log(err, rows)
        if (err) {
          const responseObj = {
            error: err,
          }
          reject(responseObj)
        } else {
          const responseObj = {
            rows,
          }
          resolve(responseObj)
        }
      })
    })
  }

  initDataBase() {
    let queries: any[] = []
    queries.push(
      'CREATE TABLE IF NOT EXISTS [Item] ( [id]   INTEGER PRIMARY KEY AUTOINCREMENT, [title] TEXT    NOT NULL, [quantity] REAL NOT NULL DEFAULT 0, [unit] TEXT NOT NULL, [price] INTEGER NOT NULL );'
    )
    queries.push(
      'CREATE TABLE IF NOT EXISTS [Transaction] ( [id] INTEGER PRIMARY KEY AUTOINCREMENT, [itemId] INTEGER NOT NULL, [orderId] INTEGER, [price] INTEGER NOT NULL, [quantity] REAL NOT NULL, [timestamp] DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY([itemId]) REFERENCES [Item](id), FOREIGN KEY([orderId]) REFERENCES [Order](id) );'
    )
    queries.push(
      'CREATE TABLE IF NOT EXISTS [Order] ( [id]          INTEGER PRIMARY KEY AUTOINCREMENT, [timestamp] DATETIME DEFAULT CURRENT_TIMESTAMP );'
    )
    return this.allAsync(`SELECT name FROM sqlite_master WHERE type='table' AND name='Item';`).then(
      (result: any) => {
        if (result.rows.length < 1) {
          queries = queries.concat(getTestItems())
        }
        return this.serializeAsync(queries)
      }
    )
  }

  getTables() {
    return this.allAsync(`SELECT name FROM sqlite_master WHERE type='table'`)
  }

  getItems(value: string) {
    return this.allAsync(`SELECT * FROM Item WHERE title LIKE '${value}%' ORDER BY title ASC`)
  }

  getItem(value: string) {
    return this.allAsync(`SELECT * FROM Item WHERE id = ${value}`)
  }

  createItem(fields: any = {}) {
    return this.runAsync(formatInsert('Item', fields))
  }

  addTransaction(transaction: any = {}, items: any = []) {
    return this.serializeAsync(formatTransaction(transaction, items))
  }

  updateItem(id: number, data: any = {}) {
    return this.runAsync(formatUpdate('Item', id, data))
  }

  deleteItem(id: number) {
    return this.runAsync(formatDelete('Item', id))
  }

  addTransactions(transactions: any = [], items: any = []) {
    const queries = Array.prototype.concat.apply(
      [],
      transactions.map((transaction: any) => formatTransaction(transaction, items))
    )
    return this.serializeAsync(queries)
  }

  getMinMaxTransactionTimestamp() {
    return this.allAsync(
      'SELECT MIN(timestamp) AS min, MAX(timestamp) AS max FROM [Transaction] WHERE orderId IS NOT NULL'
    )
  }

  getTransactions(dateString: string = utils.constants.MOMENT.DEFAULT_DATE, isTransaction = true) {
    return this.allAsync(
      `SELECT id, itemId, orderId, price, quantity, datetime(timestamp,'localtime') FROM [Transaction] WHERE orderId IS ${
        isTransaction ? 'NOT ' : ''
      }NULL AND strftime('%m-%Y', timestamp) = '${dateString}'`
    )
  }

  addOrder() {
    return this.runAsync('INSERT INTO [Order] (id) VALUES (null)')
  }

  close() {
    this.db.close()
  }
}

// the entries of fields should be correctly indexed to the entries of values
const formatInsert = (table: string, data: any = {}) => {
  const formattedData = formatData(data)
  return `INSERT INTO [${table}] (${Object.keys(formattedData).join(',')}) VALUES (${Object.values(
    formattedData
  ).join(',')})`
}

const formatUpdate = (table: string, id: number, data: any = {}) => {
  const formattedData = formatData(data)
  const fields = Object.keys(formattedData).map((key) => `${key} = ${formattedData[key]}`)
  return `UPDATE [${table}] SET ${fields.join(',')} WHERE id = ${id}`
}

const formatDelete = (table: string, id: number) => `DELETE FROM [${table}] WHERE id = ${id}`

const formatTransaction = (transaction: any = {}, items: any = []) => {
  const item: any = items.find((i: any) => i.id === transaction.itemId)
  const quantity = transaction.orderId
    ? item.quantity - transaction.quantity
    : item.quantity + transaction.quantity
  return [formatInsert('Transaction', transaction), formatUpdate('Item', transaction.itemId, { quantity })]
}

const formatData = (data: any = {}) => {
  const formattedData = { ...data }
  Object.keys(data).map((k) => {
    if (_.isString(data[k])) {
      formattedData[k] = insertQuote(data[k])
    }
  })
  return formattedData
}

const insertQuote = (input: string) => `'${input}'`

const getTestItems = () => {
  const queries: any = []
  for (let i = 0; i < 200; i += 1) {
    const element = `INSERT INTO [Item] (title, quantity, unit, price) VALUES ('${faker.commerce.productName()}',
     ${faker.random.number()}, '${faker.name.prefix()}', ${faker.commerce.price()});`
    queries.push(element)
  }
  return queries
}
export default Database
