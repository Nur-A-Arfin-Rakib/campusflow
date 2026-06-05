const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongod

// Start in-memory MongoDB before all tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  process.env.MONGO_URI = uri
  process.env.JWT_SECRET = 'test_secret_key_for_jest_testing_only'
  process.env.NODE_ENV = 'test'
  process.env.CLIENT_URL = 'http://localhost:5173'
  await mongoose.connect(uri)
})

// Clear all collections between tests
afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

// Stop in-memory MongoDB after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongod.stop()
})
