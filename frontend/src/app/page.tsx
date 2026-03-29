'use client';

import { VolumeChart } from '@/components/charts/VolumeChart';
import { useOverview } from '@/hooks/useDashboardData';

export default function OverviewPage() {
  const { data: metrics, isLoading, error, refetch } = useOverview();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-8">
        <div className="bg-error/10 border border-error/20 p-4 rounded-lg text-error">
          Failed to load dashboard metrics. Ensure the API is running.
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 pb-12 pt-8">
      {/* Dashboard Header */}
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Dashboard Overview</h2>
          <p className="text-on-surface-variant mt-1">Real-time telemetry and pipeline health across clusters.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-container px-4 py-2 rounded-lg border border-outline-variant/10 text-sm font-medium">
            <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">calendar_today</span>
            <span>Last 24 Hours</span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm ml-2">expand_more</span>
          </div>
          <button 
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-br from-primary to-primary-dim text-on-primary font-semibold rounded-md shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95 border-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid: StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container p-5 rounded-xl border-l-2 border-primary-dim relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Total Events</span>
            <span className="material-symbols-outlined text-primary text-xl">database</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">
              {metrics.totalEvents > 1000000 
                ? `${(metrics.totalEvents / 1000000).toFixed(1)}M` 
                : metrics.totalEvents.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2 tracking-tight">Last 24 hours processing</p>
        </div>

        <div className="bg-surface-container p-5 rounded-xl border-l-2 border-secondary relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Avg Quality</span>
            <span className="material-symbols-outlined text-secondary text-xl">verified</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">{metrics.avgQualityScore.toFixed(1)}%</span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2 tracking-tight">Schema validation score</p>
        </div>

        <div className="bg-surface-container p-5 rounded-xl border-l-2 border-error relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Active Alerts</span>
            <span className="material-symbols-outlined text-error text-xl">warning</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">{metrics.activeAlerts}</span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2 tracking-tight">Requiring immediate attention</p>
        </div>

        <div className="bg-surface-container p-5 rounded-xl border-l-2 border-tertiary relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Anomalies</span>
            <span className="material-symbols-outlined text-tertiary text-xl">analytics</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">{metrics.anomaliesDetected}</span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2 tracking-tight">Detected outliers (24h)</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Large Chart Integraton */}
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold">System Volume Over Time</h3>
              <p className="text-sm text-on-surface-variant">Trend analysis for 24-hour window</p>
            </div>
          </div>
          <div className="h-64 relative w-full">
            <VolumeChart data={metrics.eventsOverTime} />
          </div>
        </div>

        {/* Two Column Sub-Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-6 bg-secondary rounded-full"></div>
              <h3 className="font-bold tracking-tight">Events per Source (Top 4)</h3>
            </div>
            <div className="space-y-5">
              {metrics.topSources.length === 0 && (
                <div className="text-sm text-on-surface-variant">No source volume data available.</div>
              )}
              {metrics.topSources.map((source, index) => {
                const topVolume = metrics.topSources[0]?.volume || 1;
                const width = Math.max((source.volume / topVolume) * 100, 8);
                return (
                  <div key={`${source.sourceId}-${index}`} className="space-y-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface-variant">{source.sourceId}</span>
                      <span className="font-mono">{source.volume.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${width}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-6 bg-tertiary rounded-full"></div>
              <h3 className="font-bold tracking-tight">Quality Trend (24h)</h3>
            </div>
            <div className="h-44 flex items-end gap-1 px-2">
              {metrics.qualityTrend.map((t, i) => (
                <div 
                  key={i} 
                  className={`flex-1 ${t.score > 90 ? 'bg-secondary' : t.score > 80 ? 'bg-primary' : 'bg-tertiary'} hover:opacity-80 transition-opacity rounded-t-sm`}
                  style={{ height: `${t.score}%` }}
                ></div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-2 text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">
              <span>-24h</span>
              <span>-18h</span>
              <span>-12h</span>
              <span>-6h</span>
              <span>Now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
