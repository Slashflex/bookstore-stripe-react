const StateMachine = require('javascript-state-machine')
const { sum, asyncForEach } = require('./utils')

class OrderLine {
  constructor({ id, order_id, isbn, quantity, unit_price, currency, stock_entry_id, title }, db) {
    this.db = db
    this.id = id
    this.order_id = order_id
    this.isbn = isbn
    this.quantity = quantity
    this.unit_price = unit_price
    this.currency = currency
    this.stock_entry_id = stock_entry_id
    this.title = title
  }
}

class Order {
  constructor({ id, user_id, total_price, state, created_at }, db) {
    this.db = db
    this.id = id
    this.user_id = user_id
    this.total_price = total_price
    this.created_at = created_at
    this.fsm = new StateMachine({
      init: state,
      transitions: [
        { name: 'stop',       from: 'initiated',        to: 'stopped'          },
        { name: 'confirm',    from: 'initiated',        to: 'payment_pending'  },
        { name: 'cancel',     from: 'payment_pending',  to: 'canceled'         },
        { name: 'timeout',    from: 'payment_pending',  to: 'canceled'         },
        { name: 'pay',        from: 'payment_pending',  to: 'shipping_pending' },
        { name: 'ship',       from: 'shipping_pending', to: 'shipped'          },
        { name: 'deliver',    from: 'shipped',          to: 'delivered'        },
        { name: 'ask_return', from: 'delivered',        to: 'return_pending'   },
        { name: 'return',     from: 'return_pending',   to: 'returned'         },
      ],
    })
  }

  static async retrieveAll(user_id, db) {
    const rows = await db('orders').
      where('user_id', user_id).
      orderBy('created_at', 'desc').
      select()
    return rows.map((row) => new Order(row, db))
  }

  static async initiate(user_id, db) {
    // Get the current cart entries for this user
    const cartEntries = await db('cart_entries').
      where('user_id', user_id).
      select('stock_entry_id', 'quantity')

    // Lock the appropriate stock entries
    const stockEntries = await db('stock_entries').
      whereIn('id', cartEntries.map((cartEntry) => cartEntry.stock_entry_id)).
      select().forUpdate()

    const lines = cartEntries.map((cartEntry) => {
      const stockEntry = stockEntries.find((s) => s.id == cartEntry.stock_entry_id)
      return {
        isbn: stockEntry.isbn,
        quantity: cartEntry.quantity,
        unit_price: stockEntry.unit_price,
        currency: stockEntry.currency,
        stock_entry_id: stockEntry.id,
      }
    })

    const orderIds = await db('orders').insert({
      user_id: user_id,
      total_price: sum(lines, (line) => line.quantity * line.unit_price),
      state: 'initiated',
    })

    await asyncForEach(lines, async (line) => {
      const values = Object.assign({}, line, { order_id: orderIds[0] })
      await db('order_lines').insert(values)
      await db('stock_entries').
        where('id', line.stock_entry_id).
        decrement('quantity', line.quantity)
    })

    return orderIds[0]
  }

  static async stopAll(user_id, db) {
    const rows = await db('orders').
      where({ user_id: user_id, state: 'initiated' }).
      select()
    const orders = rows.map((row) => new Order(row, db))
    await asyncForEach(orders, async (order) => {
      // Stop the order
      order.fsm.stop()
      await db('orders').where('id', order.id).update('state', 'stopped')

      // Restock the orderLines
      await asyncForEach(await order.orderLines(), async (orderLine) => {
        await db('stock_entries').
          where('id', orderLine.stock_entry_id).
          increment('quantity', orderLine.quantity)
      })
    })
    return orders
  }

  async orderLines() {
    const rows = await this.db('order_lines').
      join('books', 'books.isbn', '=', 'order_lines.isbn').
      where('order_id', this.id).
      select('order_lines.*', 'books.title')
    return rows.map((row) => new OrderLine(row, this.db))
  }

  get state() {
    return this.fsm.state
  }
}

module.exports = {
  Order,
  OrderLine,
}
