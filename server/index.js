const dotenv = require('dotenv')
dotenv.config()

// ✅ Validate env variables before anything else
const env = require('./utils/env')

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fs = require('fs')
const path = require('path')
const { apiLimiter } = require('./middleware/rateLimiter')
const logger = require('./utils/logger')
const swaggerUi = require('swagger-ui-express')
const swaggerDoc = require('./utils/swagger')

// Ensure logs dir
const logsDir = path.join(__dirname, 'logs')
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir)

const app = express()

app.use(helmet())
app.use(compression())
app.use(cors({ origin: env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }))
}

app.use('/api/', apiLimiter)

// ─── API Docs ─────────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
  customSiteTitle: 'CampusFlow API',
  customCss: '.swagger-ui .topbar { background: #6c63ff }',
}))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'))
app.use('/api/users',       require('./routes/users'))
app.use('/api/departments', require('./routes/departments'))
app.use('/api/teachers',    require('./routes/teachers'))
app.use('/api/courses',     require('./routes/courses'))
app.use('/api/rooms',       require('./routes/rooms'))
app.use('/api/routine',     require('./routes/routine'))
app.use('/api/semesters',   require('./routes/semesters'))
app.use('/api/audit',       require('./routes/audit'))

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }))
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))
app.use((err, req, res, next) => {
  logger.error(`Unhandled: ${err.stack}`)
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong' })
})

// ─── DB + Start ───────────────────────────────────────────────────────────────
const connectDB = async () => {
  await mongoose.connect(env.MONGO_URI)
  logger.info('✅ MongoDB connected')
}

if (env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => app.listen(env.PORT, () => logger.info(`🚀 CampusFlow on port ${env.PORT}`)))
    .catch(err => { logger.error(`DB failed: ${err.message}`); process.exit(1) })
}

process.on('unhandledRejection', (err) => logger.error(`UnhandledRejection: ${err.message}`))

module.exports = { app, connectDB }
