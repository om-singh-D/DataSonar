export interface OverviewMetrics {
  totalEvents: number;
  avgQualityScore: number;
  activeAlerts: number;
  anomaliesDetected: number;
  eventsOverTime: Array<{ timestamp: string; volume: number; isAnomaly: boolean }>;
  qualityTrend: Array<{ timestamp: string; score: number }>;
  topSources: Array<{ sourceId: string; volume: number }>;
}

export interface QualityScore {
  timestamp: string;
  overallScore: number;
  scores: {
    accuracy: number;
    completeness: number;
    consistency: number;
    timeliness: number;
    validity: number;
    uniqueness: number;
  };
}

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

export interface AlertItem {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  pipelineId: string;
  timestamp: string;
  status: string;
  anomalyType?: string;
}

export interface PaginatedAlerts {
  alerts: AlertItem[];
  total: number;
}
