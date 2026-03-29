'use client';

import { DashboardCard } from '@/components/layout/DashboardCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Check, X, Clock } from 'lucide-react';
import { useState } from 'react';

// Mock Data
const initialAlerts = [
  { id: 'anom-1', pipeline: 'pipe-2', msg: 'Sudden drop in ingestion volume detected', time: '10 mins ago', severity: 'high', status: 'new' },
  { id: 'anom-2', pipeline: 'pipe-5', msg: 'Data completeness fell below 90% threshold', time: '1 hr ago', severity: 'medium', status: 'new' },
  { id: 'anom-3', pipeline: 'pipe-1', msg: 'Schema drift detected: new column "user_agent"', time: '2 hrs ago', severity: 'low', status: 'acknowledged' },
];

export default function AnomaliesPage() {
  const [alerts, setAlerts] = useState(initialAlerts);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const ackAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anomaly Feed</h1>
          <p className="text-muted-foreground">Review and act upon detected data quality issues.</p>
        </div>
      </div>

      <DashboardCard title="Active Alerts Inbox">
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
               <Check className="w-12 h-12 text-green-500 mb-4 opacity-50" />
               <p>All caught up! No active anomalies.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${alert.status === 'acknowledged' ? 'opacity-70 bg-muted/30' : 'bg-card'}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 p-2 rounded-full ${
                    alert.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                    alert.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold">{alert.pipeline}</span>
                      <Badge variant="outline" className="text-xs">{alert.severity} priority</Badge>
                      {alert.status === 'acknowledged' && <Badge variant="secondary" className="text-xs">Ack'd</Badge>}
                    </div>
                    <p className="text-sm font-medium">{alert.msg}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                       <Clock className="w-3 h-3 mr-1" />
                       {alert.time}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:self-start">
                  {alert.status === 'new' && (
                    <Button variant="outline" size="sm" onClick={() => ackAlert(alert.id)}>
                      <Check className="w-4 h-4 mr-1" /> Acknowledge
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4 mr-1" /> Dismiss
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DashboardCard>
    </div>
  );
}
