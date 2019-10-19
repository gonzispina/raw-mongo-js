/*
 * Mongo handler
 */

const { MongoClient } = require('mongodb')
const { promisify } = require('util')

const connect = promisify(MongoClient.connect)

function Connection () {
  this.connections = {}
  return this
}

/**
 * Create all connections
 *
 * @param      {object}  config  The configuration
 * @return     {Connection}  The connection handler
 */
Connection.prototype.settleConnections = async function settleConnections (config) {
  const defaultOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 5,
    ssl: config.ssl || false,
    reconnectTries: 10
  }

  const connectionsGen = await getConnections.call(this, config.databases)
  let cnn = await connectionsGen.next()
  while (!cnn.done) {
    const { value } = cnn
    this.connections[value.name] = value.db

    cnn = await connectionsGen.next()
  }

  return this

  async function * getConnections (databases) {
    let i = 0
    for (i; i < databases.length; i += 1) {
      const dbConfig = databases[i]
      const connectionString = this.getConnectionString(config.host, config.port, dbConfig)
      const db = await connect(connectionString, dbConfig.options || defaultOptions)
      yield { name: dbConfig.name, db }
    }
  }
}

/**
 * Gets the connection string.
 *
 * @param      {string}  host      The host
 * @param      {number}  port      The port
 * @param      {object}  dbConfig  The database configuration
 * @return     {string}  The connection string.
 */
Connection.prototype.getConnectionString = function getConnectionString (host, port, dbConfig) {
  const { user, password } = dbConfig
  const userpass = user && password ? `${user}:${password}@` : ''
  return `mongodb://${userpass}${host}:${port}/${dbConfig.name}`
}

/**
 * Closes the connections within the handler
 *
 * @return     {Array}  The closing promises
 */
Connection.prototype.close = async function close () {
  const connections = Object.values(this.connections)
  if (!connections.length) return []

  const closePromises = connections.map(cnn => cnn.close())
  return Promise.all(closePromises)
}

Connection.prototype.db = function db (dbName) {
  const cnn = this.connections[dbName]
  return cnn ? cnn.db(dbName) : undefined
}

module.exports = new Connection()
