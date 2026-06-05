const { cleanEnv, str, port, url } = require('envalid')

const env = cleanEnv(process.env, {
  PORT:         port({ default: 5000, docs: 'Server port' }),
  NODE_ENV:     str({ choices: ['development','production','test'], default: 'development' }),
  MONGO_URI:    str({ docs: 'MongoDB connection string' }),
  JWT_SECRET:   str({ docs: 'Secret key for JWT signing — min 32 chars' }),
  CLIENT_URL:   url({ default: 'http://localhost:5173', docs: 'Frontend URL for CORS' }),
  // Optional — email
  SMTP_HOST:    str({ default: '', docs: 'SMTP host (e.g. smtp.gmail.com)' }),
  SMTP_PORT:    str({ default: '587' }),
  SMTP_USER:    str({ default: '', docs: 'SMTP email address' }),
  SMTP_PASS:    str({ default: '', docs: 'SMTP app password' }),
})

module.exports = env
