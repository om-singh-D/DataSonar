import { MongoClient, Db } from 'mongodb';
import { config } from '../config';
import { logger } from '../utils/logger';

let client: MongoClient;
let db: Db;

export async function connectMongo(): Promise<Db> {
  if (db) return db;
  try {
    client = new MongoClient(config.mongodb.uri);
    await client.connect();
    db = client.db(config.mongodb.dbName);
    logger.info('MongoDB connected', { db: config.mongodb.dbName });
    return db;
  } catch (error) {
    logger.error('MongoDB connection failed', { error });
    throw error;
  }
}

export function getMongo(): Db {
  if (!db) throw new Error('MongoDB not connected. Call connectMongo() first.');
  return db;
}

export function getMongoClient(): MongoClient {
  if (!client) throw new Error('MongoDB client not initialized.');
  return client;
}

export async function disconnectMongo(): Promise<void> {
  if (client) {
    await client.close();
    logger.info('MongoDB disconnected');
  }
}
