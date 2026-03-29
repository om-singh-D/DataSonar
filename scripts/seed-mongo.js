const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://datasonar:datasonar_secret@localhost:27018/datasonar?authSource=admin';

async function seed() {
  console.log('Connecting to MongoDB at', MONGODB_URI, '...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('datasonar');
    console.log('Connected to database "datasonar".');

    const pipelines = ['Auth-Service-Logs', 'Payment-Gateway-Metrics', 'Inventory-Sync-Global', 'User-Feedback-Stream'];

    // 1. Seed quality_scores
    console.log('Seeding quality_scores...');
    const qualityScores = db.collection('quality_scores');
    await qualityScores.deleteMany({});
    
    const scoreDocs = [];
    const now = Date.now();
    for (let i = 0; i < 50; i++) {
        const pipeline = pipelines[i % pipelines.length];
        const timestamp = new Date(now - i * 3600000).toISOString(); // 1 hour intervals backwards
        const eventId = crypto.randomUUID();
        scoreDocs.push({
            event_id: eventId,
            eventId,
            sourceId: pipeline,
            scores: {
                completeness: 85 + Math.random() * 15,
                accuracy: 90 + Math.random() * 10,
                consistency: 80 + Math.random() * 20,
                timeliness: 95 + Math.random() * 5,
                validity: 88 + Math.random() * 12,
                uniqueness: 98 + Math.random() * 2
            },
            overallScore: 88 + Math.random() * 12,
            eventVolume: Math.floor(Math.random() * 10000) + 5000,
            timestamp
        });
    }
    await qualityScores.insertMany(scoreDocs);

    // 2. Seed anomalies
    console.log('Seeding anomalies...');
    const anomalies = db.collection('anomalies');
    await anomalies.deleteMany({});
    
    const anomalyDocs = [];
    for (let i = 0; i < 15; i++) {
        const pipeline = pipelines[i % pipelines.length];
        const timestamp = new Date(now - Math.floor(Math.random() * 86400000)).toISOString(); // random time in last 24h
        anomalyDocs.push({
            eventId: crypto.randomUUID(),
            sourceId: pipeline,
            anomalyType: ['VOLUME_DROP', 'LATENCY_SPIKE', 'SCHEMA_MISMATCH'][Math.floor(Math.random() * 3)],
            severity: Math.random() > 0.7 ? 3 : (Math.random() > 0.4 ? 2 : 1), // 1=Low, 2=Medium, 3=High
            detectedAt: timestamp
        });
    }
    await anomalies.insertMany(anomalyDocs);

    // 3. Seed alerts
    console.log('Seeding alerts...');
    const alerts = db.collection('alerts');
    await alerts.deleteMany({});
    
    const alertDocs = [];
    for (let i = 0; i < 20; i++) {
        const pipeline = pipelines[i % pipelines.length];
        const timestamp = new Date(now - Math.floor(Math.random() * 86400000 * 2)).toISOString(); // random time in last 48h
        const severity = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)];
        const statuses = ['active', 'unresolved', 'resolved'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const doc = {
            severity,
            message: `Sample alert for ${pipeline} - ${severity} severity`,
            sourceId: pipeline,
            status,
            createdAt: timestamp
        };
        if (status === 'resolved') {
           doc.resolvedAt = new Date(new Date(timestamp).getTime() + 3600000).toISOString();
        }
        alertDocs.push(doc);
    }
    await alerts.insertMany(alertDocs);
    
    // 4. Seed schema_events
    console.log('Seeding schema_events...');
    const schemaEvents = db.collection('schema_events');
    await schemaEvents.deleteMany({});
    
    const schemaDocs = [];
    for (let i = 0; i < 10; i++) {
        const pipeline = pipelines[i % pipelines.length];
        const timestamp = new Date(now - Math.floor(Math.random() * 86400000 * 7)).toISOString(); // random time in last 7 days
        schemaDocs.push({
            sourceId: pipeline,
            field: `field_${i}`,
            changeType: ['ADDED', 'REMOVED', 'TYPE_CHANGED'][Math.floor(Math.random() * 3)],
            oldType: 'string',
            newType: 'integer',
            detectedAt: timestamp
        });
    }
    await schemaEvents.insertMany(schemaDocs);

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seed();
