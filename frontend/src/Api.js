import axios from 'axios';

const backend = axios.create({
  baseURL: 'http://localhost:4567',
  timeout: 5000,
  responseType: 'json'
})

async function cart() {
  const response = await backend.get('/cart')
  return response.data
}

async function removeOneFromCart(cartEntryId) {
  const response = await backend.delete('/cart/' + cartEntryId)
  return response.data
}

async function addOneToCart(stockEntryId) {
  const response = await backend.post('/cart/' + stockEntryId)
  return response.data
}

async function stock() {
  const response = await backend.get('/stock')
  return response.data
}

async function orders() {
  const response = await backend.get('/orders')
  return response.data
}

async function initiateOrder() {
  const response = await backend.post('/orders/initiate')
  return response.data
}

async function confirmOrder() {
  const response = await backend.post('/confirm/order')
  return response.data
}

export {
  cart,
  stock,
  orders,
  addOneToCart,
  removeOneFromCart,
  initiateOrder,
  confirmOrder
}
