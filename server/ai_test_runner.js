const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');

async function run() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  process.env.MONGODB_URI = uri;
  process.env.PORT = 5500;
  
  console.log('🤖 AI TEST RUNNER: Spun up local mongodb-memory-server');
  console.log('URI:', uri);
  
  require('./index.js');
}

run().catch(console.error);
