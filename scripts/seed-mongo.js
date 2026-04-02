const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://datasonar:datasonar_secret@localhost:27018/datasonar?authSource=admin';

async function resetCollections() {
  console.log('Connecting to MongoDB at', MONGODB_URI, '...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('datasonar');

    const collectionsToReset = [
      'quality_scores',
      'anomalies',
      'alerts',
      'schema_events',
    ];

    for (const collectionName of collectionsToReset) {
      const collection = db.collection(collectionName);
      const result = await collection.deleteMany({});
      console.log(`Cleared ${collectionName}: deleted ${result.deletedCount} documents.`);
    }

    console.log('Reset complete. No sample data inserted.');
  } catch (error) {
    console.error('Error resetting MongoDB collections:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

resetCollections();
