const db = require('knex')({
  client: 'sqlite3',
  connection: { filename: process.env.SQLITE_FILENAME },
  useNullAsDefault: true,
  pool: { min: 0, max: 20 }
})

async function seedDatabase() {
  const existingBooks = await db.select().from('books')
  if (existingBooks.length > 0) {
    console.log('Skipping seed as there are already some books in the database.')
    return
  }

  console.log('Seeding 1 user, 2 books, and 3 stock entries...')

  await db('users').insert({ id: 1 })

  await db('books').insert({
    isbn: '9780134456478',
    title: 'Practical Object-oriented Design: An Agile Primer Using Ruby (2nd Edition)',
  })

  await db('books').insert({
    isbn: '1617296856',
    title: 'Object Design Style Guide',
  })

  await db('stock_entries').insert({
    isbn: '9780134456478',
    quantity: 5,
    unit_price: 3099,
    currency: 'EUR',
  })

  await db('stock_entries').insert({
    isbn: '9780134456478',
    quantity: 1,
    unit_price: 1510,
    currency: 'EUR',
  })

  await db('stock_entries').insert({
    isbn: '1617296856',
    quantity: 3,
    unit_price: 3549,
    currency: 'EUR',
  })
}

module.exports = { seedDatabase, db }
