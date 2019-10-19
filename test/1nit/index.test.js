const tap = require('tap')
const proxyquire = require('proxyquire')

function MongodbMock () {}
MongodbMock.prototype.connect = function (cnnString, options, cb) {
  return cb(null, new ClientMock(cnnString, options))
}

function ClientMock (cnnString, options) {
  this.cnnString = cnnString
  this.options = options
  return this
}
ClientMock.prototype.db = (name) => new DBMock(name)

function DBMock (name) {
  this.name = name
  return this
}

const config = {
  host: '127.0.0.1',
  port: 27017,
  databases: [{
    name: 'db_name_1'
  },
  {
    name: 'db_name_2',
    user: 'user_name_2',
    password: 'user_password_2'
  }]
}

const Connection = proxyquire('../../index', { mongodb: { MongoClient: new MongodbMock() } })

tap.test('Mongo DB Unit Tests', childTest => {
  childTest.tearDown(() => proxyquire.callThru())

  childTest.test('Has functions', t => {
    t.plan(4)
    t.ok(typeof Connection.settleConnections === 'function')
    t.ok(typeof Connection.getConnectionString === 'function')
    t.ok(typeof Connection.close === 'function')
    t.ok(typeof Connection.db === 'function')
    t.end()
  })

  childTest.test('Function - getConnectionString', t => {
    t.plan(2)
    const connectionString1 = Connection.getConnectionString(config.host, config.port, config.databases[0])
    const connectionString2 = Connection.getConnectionString(config.host, config.port, config.databases[1])

    t.equal(connectionString1, 'mongodb://127.0.0.1:27017/db_name_1')
    t.equal(connectionString2, 'mongodb://user_name_2:user_password_2@127.0.0.1:27017/db_name_2')
    t.end()
  })

  childTest.test('Function - settleConnections', async t => {
    t.plan(1)
    const mongo = await Connection.settleConnections(config)
    t.equal(Object.keys(mongo.connections).length, config.databases.length)
    t.end()
  })

  childTest.test('Function - db', async t => {
    t.plan(3)

    const db = Connection.db('db_name_2')
    t.ok(db instanceof DBMock)
    t.ok(db.name === 'db_name_2')

    const notDb = Connection.db('not_a_db')
    t.equal(notDb, undefined)

    t.end()
  })

  childTest.test('Function - close', async t => {
    t.plan(2)

    Object.keys(Connection.connections).forEach(function (key) {
      Connection.connections[key].close = async () => true
    })

    t.deepEqual(await Connection.close(), [true, true])

    Connection.connections = []
    t.deepEqual(await Connection.close(), [])

    t.end()
  })

  childTest.end()
})
