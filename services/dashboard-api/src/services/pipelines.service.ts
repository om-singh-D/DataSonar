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
  };
}

export async function listPipelines(): Promise<PipelineListItem[]> {
  const cached = await getCached<PipelineListItem[]>(CACHE_KEY_PIPELINES);
  if (cached) return cached;

  const prisma = getPrisma();
  const db = getMongo();

  const pipelines = await prisma.pipeline.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  // Get latest quality scores per source
  const qualityScores = await db.collection('quality_scores')
    .aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$sourceId', latestScore: { $first: '$overallScore' } } },
    ])
    .toArray();

  const scoreMap = new Map(qualityScores.map((q: any) => [q._id, q.latestScore]));

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

  await setCache(CACHE_KEY_PIPELINES, result, 60);
  return result;
}

export async function getPipelineDetail(id: string): Promise<PipelineDetail | null> {
  const prisma = getPrisma();
  const db = getMongo();

  // Try to find by UUID first, then by name
  let pipeline = await prisma.pipeline.findUnique({ where: { id } }).catch(() => null);
  if (!pipeline) {
    pipeline = await prisma.pipeline.findUnique({ where: { name: id } }).catch(() => null);
  }
  if (!pipeline) return null;

  const lookupId = pipeline.name; // Quality engine uses pipeline name as sourceId

  const [latestQuality, schemaEvents, recentAnomalies] = await Promise.all([
    db.collection('quality_scores')
      .findOne({ sourceId: lookupId }, { sort: { timestamp: -1 } }),
    db.collection('schema_events')
      .find({ sourceId: lookupId })
      .sort({ detectedAt: -1 })
      .limit(5)
      .toArray(),
    db.collection('anomalies')
      .find({ sourceId: lookupId })
      .sort({ detectedAt: -1 })
      .limit(10)
      .toArray(),
  ]);

  const eventCountNumber = Number(pipeline.eventCount || 0);
  const cpuEstimate = Math.min(95, Math.max(8, Math.round((latestQuality?.overallScore ? 100 - latestQuality.overallScore : 45))));
  const backlog = Math.max(0, Math.floor(eventCountNumber * 0.03));
  const uptimeHours = Math.max(1, Math.floor((Date.now() - pipeline.createdAt.getTime()) / (1000 * 60 * 60)));
  const uptimeDays = Math.floor(uptimeHours / 24);
  const uptimeRemainderHours = uptimeHours % 24;

  return {
    id: pipeline.id,
    name: pipeline.name,
    sourceType: pipeline.sourceType,
    status: pipeline.status,
    lastEventAt: pipeline.lastEventAt?.toISOString() || null,
    eventCount: pipeline.eventCount.toString(),
    createdAt: pipeline.createdAt.toISOString(),
    qualityDimensions: latestQuality?.scores || null,
    overallScore: latestQuality?.overallScore || null,
    schemaEvents: schemaEvents.map((s: any) => ({
      field: s.field,
      changeType: s.changeType,
      oldType: s.oldType,
      newType: s.newType,
      detectedAt: s.detectedAt,
    })),
    recentAnomalies: recentAnomalies.map((a: any) => ({
      eventId: a.eventId,
      anomalyType: a.anomalyType,
      severity: a.severity,
      detectedAt: a.detectedAt,
    })),
    resources: {
      cpu: cpuEstimate,
      memory: `${Math.max(2, Math.min(32, Math.round(eventCountNumber / 100000) + 2))} GB`,
      backlog,
      uptime: `${uptimeDays}d ${uptimeRemainderHours}h`,
    },
  };
}
