# raw-mongo-js
Raw Node JS wrapper for Mongo DB

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)


## Description

This is a simple wrapper that handles the connections to MongoDB and allows you to work with the native driver. If you are looking for something not as simple as this use mongoose.

## Usage

At the beginning of your application

```node
const mongo = require('raw-mongo')
const config = require('./src/config')

async function start () {
	...

    var Connection = await mongo.settleConnections(config.mongo)

    ...
}

start()
```

In your API

```node
const Mongo = require('raw-mongo')
const db =  Mongo.db('your_database_name')
const collection = db.collection('your_collection_name')


module.exports = (req, res) => {
	const result = collection.findOne({ some_prop: 'some_prop_value' })
	res.send(result)
}
```


The config file

```node
module.exports = {
  host: process.env.MONGO_HOST || '127.0.0.1',
  port: process.env.MONGO_PORT || 27017,
  databases: [{
    name: 'db_name_1',
    user: process.env.MN_DB_1_USER,
    password: process.env.MN_DB_1_PASSWORD
  },
  {
    name: 'db_name_2'
  }]
}
```

Enjoy! :)

