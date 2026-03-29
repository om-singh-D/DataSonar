import { DashboardCard } from '@/components/layout/DashboardCard';
import { QualityRadar } from '@/components/charts/QualityRadar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Server, Key } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const qualityData = [
  { dimension: 'Completeness', score: 95, fullMark: 100 },
  { dimension: 'Uniqueness', score: 100, fullMark: 100 },
  { dimension: 'Timeliness', score: 85, fullMark: 100 },
  { dimension: 'Validity', score: 92, fullMark: 100 },
  { dimension: 'Accuracy', score: 88, fullMark: 100 },
  { dimension: 'Consistency', score: 90, fullMark: 100 },
];

export default async function PipelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-4">
        <Link href="/pipelines" className="p-2 hover:bg-muted rounded-full transition-colors relative -left-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight">Pipeline: {id}</h1>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Healthy
            </Badge>
          </div>
          <p className="text-muted-foreground">Source: PostgreSQL • Connected 24 days ago</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schema">Schema Definition</TabsTrigger>
          <TabsTrigger value="quality">Quality History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <DashboardCard title="Data Quality Dimensions" description="Score breakdown across the 6 dimensions">
              <QualityRadar data={qualityData} />
            </DashboardCard>
            
            <DashboardCard title="Connection Details">
              <div className="space-y-4 pt-4">
                <div className="flex items-start space-x-3">
                  <Server className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Host URL</h4>
                    <p className="text-sm text-muted-foreground font-mono bg-muted p-1 rounded mt-1 inline-block">db.prod.internal:5432</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Key className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Authentication</h4>
                    <p className="text-sm text-muted-foreground">Password (Stored securely in vault)</p>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </TabsContent>
        
        <TabsContent value="schema" className="mt-6">
          <DashboardCard title="Schema Mapping">
            <div className="flex justify-center flex-col items-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
              <p>Schema auto-discovery in progress...</p>
            </div>
          </DashboardCard>
        </TabsContent>
        
        <TabsContent value="quality" className="mt-6">
          <DashboardCard title="Historical Quality Trends">
             <div className="flex justify-center flex-col items-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
              <p>Not enough historical data collected yet.</p>
            </div>
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
