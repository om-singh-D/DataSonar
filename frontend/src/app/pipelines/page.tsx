import { DashboardCard } from '@/components/layout/DashboardCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const mockPipelines = [
  { id: 'pipe-1', name: 'Stripe Payments', status: 'Healthy', score: 98, lastEvent: '1m ago', source: 'PostgreSQL' },
  { id: 'pipe-2', name: 'User Analytics', status: 'Degraded', score: 72, lastEvent: '5m ago', source: 'Kafka' },
  { id: 'pipe-3', name: 'CRM Sync', status: 'Failing', score: 45, lastEvent: '2m ago', source: 'Salesforce' },
  { id: 'pipe-4', name: 'Inventory Logs', status: 'Healthy', score: 99, lastEvent: '30s ago', source: 'S3' },
];

function getStatusIcon(status: string) {
  switch (status) {
    case 'Healthy': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'Degraded': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'Failing': return <XCircle className="w-4 h-4 text-destructive" />;
    default: return null;
  }
}

export default function PipelinesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipelines</h1>
          <p className="text-muted-foreground">Manage and observe your connected data sources.</p>
        </div>
        <Button>Add Pipeline</Button>
      </div>

      <DashboardCard title="Active Data Pipelines">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pipeline Name</TableHead>
              <TableHead>Source Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quality Score</TableHead>
              <TableHead>Last Event</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPipelines.map((pipe) => (
              <TableRow key={pipe.id}>
                <TableCell className="font-medium">{pipe.name}</TableCell>
                <TableCell>{pipe.source}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(pipe.status)}
                    <span>{pipe.status}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={pipe.score >= 90 ? 'outline' : pipe.score >= 70 ? 'secondary' : 'destructive'}
                         className={pipe.score >= 90 ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' : ''}>
                    {pipe.score}%
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{pipe.lastEvent}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/pipelines/${pipe.id}`}>
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardCard>
    </div>
  );
}
