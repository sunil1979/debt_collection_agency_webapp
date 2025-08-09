const { MongoClient } = require('mongodb');

const uri = 'mongodb://adminuser:password123@localhost:32000/?authSource=admin';
const client = new MongoClient(uri);

async function seedDB() {
  try {
    await client.connect();
    console.log('Connected correctly to server');

    const collection = client.db('debt_collection').collection('customers');

    // The drop() command destroys all data from a collection.
    // Make sure you have permission to do this.
    await collection.drop();

    // make a bunch of time series data
    let customers = [
        {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '123-456-7890',
            address: '123 Main St, Anytown, USA',
            debt: 1000
        },
        {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '098-765-4321',
            address: '456 Oak Ave, Anytown, USA',
            debt: 1500
        }
    ];

    await collection.insertMany(customers);

    console.log('Database seeded!');
    client.close();
  } catch (err) {
    console.log(err.stack);
  }
}

seedDB();
