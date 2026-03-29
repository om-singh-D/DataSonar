import { DashboardCard } from '@/components/layout/DashboardCard';
import { VolumeChart } from '@/components/charts/VolumeChart';
import { Activity, Database, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Mock Data
const volumeData = Array.from({ length: 24 }).map((_, i) => {
  const isAnomaly = i === 14 || i === 20;
  return {
    timestamp: new Date(Date.now() - (24 - i) * 3600000).toISOString(),
    volume: isAnomaly ? Math.floor(Math.random() * 1000) : Math.floor(Math.random() * 10000) + 5000,
    isAnomaly
  };
});

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Global Overview</h1>
          <p className="text-muted-foreground">Monitor system-wide data pipeline health and volume.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Pipelines</p>
              <h3 className="text-2xl font-bold">12</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Events (24h)</p>
              <h3 className="text-2xl font-bold">14.2M</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-destructive/10 rounded-full text-destructive">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recent Anomalies</p>
              <h3 className="text-2xl font-bold">3</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-500/10 rounded-full text-green-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Global Quality</p>
              <h3 className="text-2xl font-bold">94%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <DashboardCard title="System-wide Ingestion Volume" className="lg:col-span-2">
          <VolumeChart data={volumeData} />
        </DashboardCard>
        
        <DashboardCard title="Recent Alerts">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg border bg-card text-card-foreground">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Volume drop - Pipeline #{i}</p>
                  <p className="text-xs text-muted-foreground">{i * 2} hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
