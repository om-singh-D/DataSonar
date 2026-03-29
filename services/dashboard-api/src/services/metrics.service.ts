import { getMongo } from '../db/mongo';
import { getCached, setCache } from '../db/redis';
import { logger } from '../utils/logger';

const CACHE_KEY_OVERVIEW = 'metrics:overview';

export interface OverviewMetrics {
  totalEvents: number;
  avgQualityScore: number;
  activeAlerts: number;
  anomaliesDetected: number;
  eventsOverTime: Array<{ timestamp: string; volume: number; isAnomaly: boolean }>;
  qualityTrend: Array<{ timestamp: string; score: number }>;
  topSources: Array<{ sourceId: string; volume: number }>;
}

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  // Check cache first
  const cached = await getCached<OverviewMetrics>(CACHE_KEY_OVERVIEW);
  if (cached) {
    logger.debug('Overview metrics served from cache');
    return cached;
  }

  const db = getMongo();

  // Aggregate quality scores
  const qualityScores = db.collection('quality_scores');
  const anomalies = db.collection('anomalies');
  const alerts = db.collection('alerts');

  const [
    totalEventsResult,
    avgQualityResult,
    activeAlertsCount,
    anomalyCount,
    recentScoresRaw,
    recentAnomalies,
    topSourcesRaw,
  ] = await Promise.all([
    qualityScores.countDocuments(),
    qualityScores.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$overallScore' } } },
    ]).toArray(),
    alerts.countDocuments({ status: { $in: ['active', 'unresolved'] } }),
    anomalies.countDocuments({
      detectedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    }),
    qualityScores.find()
      .sort({ timestamp: -1 })
      .limit(24)
      .toArray(),
    anomalies.find()
      .sort({ detectedAt: -1 })
      .limit(50)
      .toArray(),
    qualityScores.aggregate([
      {
        $group: {
          _id: '$sourceId',
          volume: { $sum: { $ifNull: ['$eventVolume', 0] } },
        },
      },
      { $sort: { volume: -1 } },
      { $limit: 4 },
    ]).toArray(),
  ]);

  const recentScores = recentScoresRaw.reverse();

  // Build time-series volume data from quality scores
  const eventsOverTime = recentScores.map((s: any) => ({
    timestamp: s.timestamp,
    volume: s.eventVolume || 0,
    isAnomaly: false,
  }));

  // Mark anomaly timestamps
  const anomalyTimestamps = new Set(recentAnomalies.map((a: any) => a.detectedAt));
  for (const point of eventsOverTime) {
    if (anomalyTimestamps.has(point.timestamp)) {
      point.isAnomaly = true;
      point.volume = Math.floor(point.volume * 0.2); // Anomalies show volume drops
    }
  }

  const qualityTrend = recentScores.map((s: any) => ({
    timestamp: s.timestamp,
    score: s.overallScore,
  }));

  const result: OverviewMetrics = {
    totalEvents: totalEventsResult || 0,
    avgQualityScore: avgQualityResult[0]?.avgScore || 0,
    activeAlerts: activeAlertsCount,
    anomaliesDetected: anomalyCount,
    eventsOverTime,
    qualityTrend,
    topSources: topSourcesRaw.map((source: any) => ({
      sourceId: source._id,
      volume: source.volume,
    })),
  };

  await setCache(CACHE_KEY_OVERVIEW, result, 60);
  logger.debug('Overview metrics computed and cached');
  return result;
}

export async function getVolumeMetrics(): Promise<Array<{ timestamp: string; volume: number; isAnomaly: boolean }>> {
  const overview = await getOverviewMetrics();
  return overview.eventsOverTime;
}
