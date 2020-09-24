const { seedDatabase } = require('./src/db')
const startServer = require('./src/web')

const port = 4567
const frontURL = `http://localhost:3000`

process.on('unhandledRejection', (error, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', error);
  console.log('Error stack:', error.stack)
});

seedDatabase().then(() => { startServer(port, frontURL) })
