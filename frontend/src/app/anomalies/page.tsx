'use client';

import { useState } from 'react';
import { useAlerts, useResolveAlert } from '@/hooks/useDashboardData';
import { CalendarDays, CheckCircle2, CircleAlert, Info, TriangleAlert } from 'lucide-react';

import Link from 'next/link';

export default function AnomaliesPage() {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');

  const { data, isLoading, error } = useAlerts({
    severity: filterSeverity !== 'all' ? filterSeverity : undefined,
    status: filterStatus,
  });

  const resolveMutation = useResolveAlert();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-error border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-error/10 border border-error/20 p-4 rounded-lg text-error">
          Failed to load alerts.
        </div>
      </div>
    );
  }

  const alerts = data?.alerts || [];

  return (
    <div className="px-8 pb-12 pt-8">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Alerts Center</h2>
          <p className="text-on-surface-variant mt-1">Review and resolve detected data anomalies.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-2 mb-6 shadow-sm flex flex-wrap gap-2">
        <div className="flex bg-surface-container-low p-1 rounded-lg">
          <button 
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all border-none cursor-pointer
            ${filterStatus === 'active' ? 'bg-surface-container-high text-on-surface shadow-sm' : 'bg-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            Active Inbox
          </button>
          <button 
            onClick={() => setFilterStatus('resolved')}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all border-none cursor-pointer
            ${filterStatus === 'resolved' ? 'bg-surface-container-high text-on-surface shadow-sm' : 'bg-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            Resolved
          </button>
        </div>

        <div className="w-px bg-outline-variant/20 mx-2"></div>

        <div className="flex items-center gap-2">
          {['all', 'high', 'medium', 'low'].map(level => (
            <button
              key={level}
              onClick={() => setFilterSeverity(level)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all uppercase tracking-wider cursor-pointer
                ${filterSeverity === level 
                  ? 'bg-primary text-on-primary border-primary hover:opacity-90' 
                  : 'bg-transparent text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high'}`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4 max-w-5xl">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Severity Indicator Line */}
            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
              alert.severity === 'high' || alert.severity === 'critical' ? 'bg-error' :
              alert.severity === 'medium' ? 'bg-tertiary' : 'bg-secondary'
            }`}></div>

            <div className="flex justify-between items-start gap-4 ml-2">
              <div className="flex gap-4">
                <div className={`mt-1 p-2 rounded-lg flex items-center justify-center ${
                  alert.severity === 'high' || alert.severity === 'critical' ? 'bg-error/10 text-error' :
                  alert.severity === 'medium' ? 'bg-tertiary/10 text-tertiary' : 'bg-secondary/10 text-secondary'
                }`}>
                  {alert.severity === 'high' || alert.severity === 'critical' ? (
                    <CircleAlert className="h-6 w-6" aria-hidden="true" />
                  ) : alert.severity === 'medium' ? (
                    <TriangleAlert className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Info className="h-6 w-6" aria-hidden="true" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/pipelines/${alert.pipelineId}`} className="text-xs font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider decoration-transparent">
                      {alert.pipelineId}
                    </Link>
                    <span className="text-[11px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant/10">
                      {alert.anomalyType || 'Anomaly'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-on-surface leading-tight mb-2">
                    {alert.message}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 justify-between h-full">
                {alert.status !== 'resolved' && (
                  <button 
                    onClick={() => resolveMutation.mutate(alert.id)}
                    disabled={resolveMutation.isPending}
                    className="px-4 py-2 bg-linear-to-br from-surface-container to-surface-container-high border border-outline-variant/30 text-on-surface font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:border-primary/50 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    Resolve
                  </button>
                )}
                {alert.status === 'resolved' && (
                   <div className="px-4 py-2 bg-secondary/10 text-secondary font-bold text-xs uppercase tracking-wider rounded-lg border border-secondary/20">
                     Resolved
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="bg-surface-container-low border border-dashed border-outline-variant/30 rounded-2xl p-12 text-center text-on-surface-variant">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 opacity-30" aria-hidden="true" />
            <h3 className="text-lg font-bold text-on-surface mb-1">All Clear</h3>
            <p>No {filterStatus} alerts found matching the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
