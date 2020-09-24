function sum(array, fn) {
  return array.map(fn).reduce((sum, e) => sum + e, 0)
}

async function asyncForEach(array, fn) {
  for(let i = 0; i < array.length; ++i) {
    await fn(array[i])
  }
}

module.exports = {
  asyncForEach,
  sum
}
