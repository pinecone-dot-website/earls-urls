require('dotenv').config()

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    quoteIdentifiers: true
  },
  test: {
    storage: process.env.DATABASE_URL,
    dialect: process.env.DATABASE_TYPE,
    quoteIdentifiers: true
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    quoteIdentifiers: true
  }
}
