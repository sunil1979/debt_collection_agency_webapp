const { MongoClient } = require('mongodb');

const uri = 'mongodb://adminuser:password123@localhost:32000/?authSource=admin';
const client = new MongoClient(uri);

async function inspectCustomer() {
  try {
    await client.connect();
    console.log('Connected correctly to server');

    const collection = client.db('debt_collection_agency').collection('customers');
    const customer = await collection.findOne();

    console.log(customer);

    client.close();
  } catch (err) {
    console.log(err.stack);
  }
}

inspectCustomer();
