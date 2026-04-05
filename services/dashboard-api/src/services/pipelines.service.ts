import { getPrisma } from '../db/prisma';
import { getMongo } from '../db/mongo';
import { getCached, setCache } from '../db/redis';
import { logger } from '../utils/logger';

const CACHE_KEY_PIPELINES = 'pipelines:list';

export interface PipelineListItem {
  id: string;
  name: string;
  sourceType: string;
  status: string;
  lastEventAt: string | null;
  eventCount: string;
  createdAt: string;
  latestQualityScore: number | null;
}

export interface PipelineDetail {
  id: string;
  name: string;
  sourceType: string;
  status: string;
  lastEventAt: string | null;
  eventCount: string;
  createdAt: string;
  qualityDimensions: {
    accuracy: number;
    completeness: number;
    consistency: number;
    timeliness: number;
    validity: number;
    uniqueness: number;
  } | null;
  overallScore: number | null;
  schemaEvents: Array<{
    field: string;
    changeType: string;
    oldType?: string;
    newType?: string;
    detectedAt: string;
  }>;
  recentAnomalies: Array<{
    eventId: string;
    anomalyType: string;
    severity: number;
    detectedAt: string;
  }>;
  resources: {
    cpu: number;
    memory: string;
    backlog: number;
    uptime: string;
  } | null;
}

function normalizeScore(doc: any): number | null {
  if (typeof doc?.overallScore === 'number') {
    return doc.overallScore;
  }

  if (typeof doc?.latestScore === 'number') {
    return doc.latestScore;
  }

  if (typeof doc?.composite_score === 'number') {
    return Number((doc.composite_score <= 1 ? doc.composite_score * 100 : doc.composite_score).toFixed(1));
  }

  if (typeof doc?.latestQualityScore === 'number') {
    return doc.latestQualityScore;
  }

  return null;
}

function normalizeQualityDimensions(doc: any): PipelineDetail['qualityDimensions'] {
  if (!doc) {
    return null;
  }

  if (doc.scores) {
    return {
      accuracy: Number(doc.scores.accuracy ?? 0),
      completeness: Number(doc.scores.completeness ?? 0),
      consistency: Number(doc.scores.consistency ?? 0),
      timeliness: Number(doc.scores.timeliness ?? 0),
      validity: Number(doc.scores.validity ?? 0),
      uniqueness: Number(doc.scores.uniqueness ?? 0),
    };
  }

  if (doc.dimensions) {
    const toPct = (key: string): number => {
      const value = doc.dimensions?.[key]?.score;
      if (typeof value !== 'number') {
        return 0;
      }
      return Number((value <= 1 ? value * 100 : value).toFixed(1));
    };

    return {
      accuracy: toPct('accuracy'),
      completeness: toPct('completeness'),
      consistency: toPct('consistency'),
      timeliness: toPct('timeliness'),
      validity: toPct('validity'),
      uniqueness: toPct('uniqueness'),
    };
  }

  return null;
}

export async function listPipelines(): Promise<PipelineListItem[]> {
  const cached = await getCached<PipelineListItem[]>(CACHE_KEY_PIPELINES);
  if (cached) return cached;

  const prisma = getPrisma();
  const db = getMongo();

  let pipelines: any[] = [];

  try {
    pipelines = await prisma.pipeline.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  } catch (error) {
    logger.warn('Falling back to Mongo telemetry for pipelines list', {
      error: (error as Error).message,
    });
  }

  // Get latest quality scores per source
  const qualityScores = await db.collection('quality_scores')
    .aggregate([
      { $sort: { timestamp: -1, scored_at: -1 } },
      {
        $group: {
          _id: { $ifNull: ['$sourceId', '$source_id'] },
          latestScore: {
            $first: {
              $ifNull: ['$overallScore', { $multiply: [{ $ifNull: ['$composite_score', 0] }, 100] }],
            },
          },
          totalVolume: {
            $sum: { $ifNull: ['$eventVolume', { $ifNull: ['$record_count', 0] }] },
          },
          lastEventAt: {
            $first: { $ifNull: ['$timestamp', '$scored_at'] },
          },
          sourceName: {
            $first: { $ifNull: ['$sourceName', '$source_id'] },
          },
          sourceType: {
            $first: { $ifNull: ['$sourceType', '$source_type'] },
          },
        },
      },
    ])
    .toArray();

  const scoreMap = new Map<string, number>();
  const volumeMap = new Map<string, number>();
  const lastEventMap = new Map<string, string>();

  for (const scoreRow of qualityScores as any[]) {
    if (typeof scoreRow._id !== 'string' || !scoreRow._id) {
      continue;
    }

    const normalized = normalizeScore(scoreRow);
    if (normalized !== null) {
      scoreMap.set(scoreRow._id, normalized);
    }

    volumeMap.set(scoreRow._id, Number(scoreRow.totalVolume || 0));
    if (typeof scoreRow.lastEventAt === 'string') {
      lastEventMap.set(scoreRow._id, scoreRow.lastEventAt);
    }
  }

  if (pipelines.length > 0) {
    const result: PipelineListItem[] = pipelines.map((p: any) => ({
      id: p.id,
      name: p.name,
      sourceType: p.sourceType,
      status: p.status,
      lastEventAt: p.lastEventAt?.toISOString() || null,
      eventCount: p.eventCount.toString(),
      createdAt: p.createdAt.toISOString(),
      latestQualityScore: scoreMap.get(p.id) || scoreMap.get(p.name) || null,
    }));

    await setCache(CACHE_KEY_PIPELINES, result, 30);
    return result;
  }

  const pipelineSnapshots = await db.collection('pipeline_snapshots')
    .find({})
    .sort({ lastEventAt: -1 })
    .toArray();

  if (pipelineSnapshots.length > 0) {
    const result: PipelineListItem[] = pipelineSnapshots.map((snapshot: any) => {
      const sourceId = String(snapshot.sourceId || 'unknown-source');
      const latestQualityScore =
        normalizeScore(snapshot) ??
        scoreMap.get(sourceId) ??
        null;

      return {
        id: sourceId,
        name: String(snapshot.name || sourceId),
        sourceType: String(snapshot.sourceType || 'stream'),
        status:
          typeof snapshot.status === 'string'
            ? snapshot.status
            : Number(snapshot.rejectedCount || 0) > 0
            ? 'ERROR'
            : 'ACTIVE',
        lastEventAt:
          typeof snapshot.lastEventAt === 'string'
            ? snapshot.lastEventAt
            : lastEventMap.get(sourceId) || null,
        eventCount: String(snapshot.eventCount || volumeMap.get(sourceId) || 0),
        createdAt:
          typeof snapshot.createdAt === 'string'
            ? snapshot.createdAt
            : new Date().toISOString(),
        latestQualityScore,
      };
    });

    await setCache(CACHE_KEY_PIPELINES, result, 15);
    return result;
  }

  const result: PipelineListItem[] = (qualityScores as any[])
    .filter((row: any) => typeof row._id === 'string' && row._id)
    .map((row: any) => ({
      id: row._id,
      name: String(row.sourceName || row._id),
      sourceType: String(row.sourceType || 'stream'),
      status: 'ACTIVE',
      lastEventAt: typeof row.lastEventAt === 'string' ? row.lastEventAt : null,
      eventCount: String(row.totalVolume || 0),
      createdAt: new Date().toISOString(),
      latestQualityScore: normalizeScore(row),
    }));

  await setCache(CACHE_KEY_PIPELINES, result, 15);
  return result;
}

export async function getPipelineDetail(id: string): Promise<PipelineDetail | null> {
  const prisma = getPrisma();
  const db = getMongo();

  // Try to find by UUID first, then by name
  let pipeline: any = null;

  try {
    pipeline = await prisma.pipeline.findUnique({ where: { id } }).catch(() => null);
    if (!pipeline) {
      pipeline = await prisma.pipeline.findUnique({ where: { name: id } }).catch(() => null);
    }
  } catch (error) {
    logger.warn('Prisma pipeline lookup failed, using telemetry fallback', {
      id,
      error: (error as Error).message,
    });
  }

  const snapshot = await db.collection('pipeline_snapshots').findOne({
    $or: [{ sourceId: id }, { name: id }],
  });

  const lookupId =
    pipeline?.name ||
    pipeline?.id ||
    snapshot?.sourceId ||
    snapshot?.name ||
    id;

  const sourceFilters = [{ sourceId: lookupId }, { source_id: lookupId }];

  const [latestQuality, schemaEvents, recentAnomalies] = await Promise.all([
    db.collection('quality_scores')
      .findOne({ $or: sourceFilters }, { sort: { timestamp: -1, scored_at: -1 } }),
    db.collection('schema_events')
      .find({ $or: sourceFilters })
      .sort({ detectedAt: -1 })
      .limit(5)
      .toArray(),
    db.collection('anomalies')
      .find({ $or: sourceFilters })
      .sort({ detectedAt: -1 })
      .limit(10)
      .toArray(),
  ]);

  if (!pipeline && !snapshot && !latestQuality) {
    return null;
  }

  const fallbackEventCount = Number(snapshot?.eventCount || 0);
  const fallbackCreatedAt =
    typeof snapshot?.createdAt === 'string' ? snapshot.createdAt : new Date().toISOString();

  const normalizedScore = normalizeScore(latestQuality);

  return {
    id: pipeline?.id || String(snapshot?.sourceId || lookupId),
    name: pipeline?.name || String(snapshot?.name || lookupId),
    sourceType: pipeline?.sourceType || String(snapshot?.sourceType || 'stream'),
    status:
      pipeline?.status ||
      (typeof snapshot?.status === 'string'
        ? snapshot.status
        : recentAnomalies.length > 0
        ? 'ERROR'
        : 'ACTIVE'),
    lastEventAt:
      pipeline?.lastEventAt?.toISOString() ||
      (typeof snapshot?.lastEventAt === 'string' ? snapshot.lastEventAt : null),
    eventCount: pipeline?.eventCount?.toString() || String(fallbackEventCount),
    createdAt: pipeline?.createdAt?.toISOString() || fallbackCreatedAt,
    qualityDimensions: normalizeQualityDimensions(latestQuality),
    overallScore: normalizedScore,
    schemaEvents: schemaEvents.map((s: any) => ({
      field: s.field || 'unknown',
      changeType: s.changeType || 'update',
      oldType: s.oldType,
      newType: s.newType,
      detectedAt: s.detectedAt || s.timestamp || new Date().toISOString(),
    })),
    recentAnomalies: recentAnomalies.map((a: any) => ({
      eventId: a.eventId || a.event_id || 'unknown',
      anomalyType: a.anomalyType || a.anomaly_type || 'validation_error',
      severity: Number(a.severity ?? 0.5),
      detectedAt: a.detectedAt || a.detected_at || a.timestamp || new Date().toISOString(),
    })),
    resources: null,
  };
}
