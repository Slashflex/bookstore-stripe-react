const { db } = require('./db')
const { Order } = require('./order')

async function getStockEntries() {
  const stockEntries = await db('stock_entries').
    join('books', 'books.isbn', '=', 'stock_entries.isbn').
    select('stock_entries.*', 'books.title')
  return stockEntries
}

async function getCartEntries(userId) {
  const cartEntries = await db('cart_entries').
    join('stock_entries', 'stock_entries.id', '=', 'cart_entries.stock_entry_id').
    join('books', 'books.isbn', '=', 'stock_entries.isbn').
    where({ user_id: userId }).
    select(
      'cart_entries.*',
      'books.title',
      'stock_entries.unit_price',
      'stock_entries.currency',
    )
  return cartEntries
}

async function stopInitiatedOrder(userId) {
  await db.transaction(async trx => {
    // Lock all the user's orders
    await trx('orders').where('user_id', userId).select().forUpdate()
    await Order.stopAll(userId, trx)
  })
}

async function moveFromCart(userId, cartEntryId) {
  await stopInitiatedOrder(userId)

  await db('cart_entries').
    where({ id: cartEntryId, user_id: userId }).
    decrement('quantity', 1)

  await db('cart_entries').
    where({ id: cartEntryId, user_id: userId }).
    where('quantity', '<=', 0).
    delete()
}

async function moveToCart(userId, stockEntryId) {
  await stopInitiatedOrder(userId)

  await db.transaction(async trx => {
    const stockEntry = await trx('stock_entries').
      where({ id: stockEntryId }).
      first('quantity').forUpdate()

    const existingCartEntry = await trx('cart_entries').
      where({ user_id: userId, stock_entry_id: stockEntryId }).
      first().forUpdate()

    if (existingCartEntry) {
      if (stockEntry.quantity > existingCartEntry.quantity) {
        await trx('cart_entries').
          where('id', existingCartEntry.id).
          increment('quantity', 1)
      }
    } else {
      if (stockEntry.quantity >= 1) {
        await trx('cart_entries').insert({
          user_id: userId,
          stock_entry_id: stockEntryId,
          quantity: 1,
        })
      }
    }
  })
}

async function initiateOrder(userId) {
  await stopInitiatedOrder(userId)

  return await db.transaction(async trx => {
    const orderId = await Order.initiate(userId, trx)
    return await trx('order_lines').
      join('books', 'books.isbn', '=', 'order_lines.isbn').
      where('order_lines.order_id', orderId).
      select('order_lines.*', 'books.title')
  })
}

async function getOrders(userId) {
  const orders = await Order.retrieveAll(userId, db)
  return await Promise.all(orders.map(async (order) => {
    return {
      id: order.id,
      total_price: order.total_price,
      currency: order.currency,
      state: order.state,
      created_at: order.created_at,
      lines: await order.orderLines(),
    }
  }))
}

async function confirmOrder(userId) {
  const allOrders = await getOrders(userId)
  return allOrders.find((order) => order.state === 'initiated')
}

module.exports = {
  getCartEntries,
  getStockEntries,
  getOrders,
  initiateOrder,
  confirmOrder,
  stopInitiatedOrder,
  moveFromCart,
  moveToCart,
}
