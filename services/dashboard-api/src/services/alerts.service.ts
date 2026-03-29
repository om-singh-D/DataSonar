import { getMongo } from '../db/mongo';
import { logger } from '../utils/logger';
import { ObjectId } from 'mongodb';

export interface AlertItem {
  id: string;
  severity: string;
  message: string;
  pipelineId: string;
  timestamp: string;
  status: string;
  anomalyType?: string;
}

export interface AlertFilters {
  severity?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function listAlerts(filters: AlertFilters = {}): Promise<{ alerts: AlertItem[]; total: number }> {
  const db = getMongo();
  const collection = db.collection('alerts');

  const query: any = {};
  if (filters.severity) query.severity = filters.severity;
  if (filters.status) query.status = filters.status;

  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const [docs, total] = await Promise.all([
    collection.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
    collection.countDocuments(query),
  ]);

  const alerts: AlertItem[] = docs.map((d: any) => ({
    id: d._id.toString(),
    severity: d.severity,
    message: d.message,
    pipelineId: d.sourceId || d.pipelineId || '',
    timestamp: d.createdAt || d.timestamp,
    status: d.status,
    anomalyType: d.anomalyType,
  }));

  return { alerts, total };
}

export async function resolveAlert(id: string): Promise<boolean> {
  const db = getMongo();
  const collection = db.collection('alerts');

  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'resolved', resolvedAt: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  } catch (err) {
    logger.error('Failed to resolve alert', { id, error: (err as Error).message });
    return false;
  }
}
