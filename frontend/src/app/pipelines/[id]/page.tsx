'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { QualityRadar } from '@/components/charts/QualityRadar';
import { usePipelineDetail } from '@/hooks/useDashboardData';

export default function PipelineDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: pipeline, isLoading, error, refetch } = usePipelineDetail(id);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !pipeline) {
    return (
      <div className="p-8">
        <div className="bg-error/10 border border-error/20 p-4 rounded-lg text-error">
          Failed to load pipeline details.
        </div>
      </div>
    );
  }

  // Map quality dimensions
  const dims = pipeline.qualityDimensions || {
    accuracy: 0, completeness: 0, consistency: 0, timeliness: 0, validity: 0, uniqueness: 0
  };
  
  const radarData = [
    { dimension: 'Accuracy', score: dims.accuracy, fullMark: 100 },
    { dimension: 'Completeness', score: dims.completeness, fullMark: 100 },
    { dimension: 'Consistency', score: dims.consistency, fullMark: 100 },
    { dimension: 'Timeliness', score: dims.timeliness, fullMark: 100 },
    { dimension: 'Validity', score: dims.validity, fullMark: 100 },
    { dimension: 'Uniqueness', score: dims.uniqueness, fullMark: 100 },
  ];

  return (
    <div className="px-8 pb-12 pt-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center text-sm font-medium text-on-surface-variant mb-6">
        <Link href="/pipelines" className="hover:text-primary transition-colors decoration-transparent cursor-pointer">Pipelines</Link>
        <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
        <span className="text-on-surface font-bold">{pipeline.name}</span>
      </div>

      {/* Main Header Card */}
      <div className="bg-gradient-to-br from-surface-container-low to-surface-container border border-outline-variant/10 rounded-2xl p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        
        <div className="flex justify-between items-start flex-wrap gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl font-black tracking-tight text-on-surface bg-clip-text text-transparent bg-gradient-to-r from-on-surface to-on-surface-variant">
                {pipeline.name}
              </h2>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border max-w-max uppercase tracking-wider
                      ${pipeline.status === 'ACTIVE' ? 'bg-secondary/10 text-secondary border-secondary/20' : 
                        pipeline.status === 'ERROR' ? 'bg-error/10 text-error border-error/20' : 
                        'bg-surface-container text-on-surface-variant border-outline-variant/20'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${pipeline.status === 'ACTIVE' ? 'bg-secondary' : pipeline.status === 'ERROR' ? 'bg-error' : 'bg-outline-variant'}`}></div>
                {pipeline.status}
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm bg-surface-container-high px-3 py-1.5 rounded-md border border-outline-variant/10 font-mono">
                <span className="material-symbols-outlined text-[16px] text-primary">data_object</span>
                {pipeline.sourceType}
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container-highest px-3 py-1 bg-opacity-30 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Live Stream
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/20 bg-surface-container text-on-surface font-semibold rounded-lg hover:bg-surface-container-high transition-colors text-sm cursor-pointer whitespace-nowrap w-24">
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Config
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold rounded-lg shadow-lg hover:shadow-primary/30 transition-all active:scale-95 border-0 text-sm cursor-pointer whitespace-nowrap w-24">
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Actions
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quality Grid */}
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">verified</span>
                Quality Dimensions
              </h3>
              <div className="text-3xl font-black font-mono">
                {pipeline.overallScore ? pipeline.overallScore.toFixed(1) : 0}<span className="text-lg text-on-surface-variant">%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {Object.entries(dims).map(([key, rawValue]) => {
                const value = rawValue as number;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-2 font-bold uppercase tracking-wider">
                      <span className="text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] opacity-70">done</span>
                        {key}
                      </span>
                      <span className="font-mono">{value.toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden border border-outline-variant/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          value > 90 ? 'bg-secondary shadow-[0_0_10px_theme(colors.secondary)]' : 
                          value > 75 ? 'bg-primary shadow-[0_0_10px_theme(colors.primary)]' : 
                          'bg-error shadow-[0_0_10px_theme(colors.error)]'
                        }`}
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schema Evolution Box */}
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-tertiary">schema</span>
              Schema Evolution
            </h3>
            
            <div className="space-y-4">
              {pipeline.schemaEvents.map((evt, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-outline-variant/10 bg-surface-container/30">
                  <div className="mt-0.5">
                    {evt.changeType.includes('ADDED') && <span className="material-symbols-outlined text-secondary bg-secondary/10 p-1.5 rounded-md">add_box</span>}
                    {evt.changeType.includes('REMOVED') && <span className="material-symbols-outlined text-error bg-error/10 p-1.5 rounded-md">indeterminate_check_box</span>}
                    {evt.changeType.includes('TYPE') && <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-md">swap_horiz</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-base"><span className="font-mono text-primary mr-1 border border-primary/20 bg-primary/5 px-1.5 rounded">{evt.field}</span> {evt.changeType.toLowerCase()}</h4>
                      <span className="text-xs text-on-surface-variant font-medium bg-surface-container px-2 py-1 rounded-md">{new Date(evt.detectedAt).toLocaleDateString()}</span>
                    </div>
                    {evt.changeType.includes('TYPE') && (
                      <div className="text-sm text-on-surface-variant mt-2 flex items-center gap-2 font-mono">
                        <span className="line-through opacity-70 border px-1 rounded border-outline-variant/20">{evt.oldType}</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        <span className="text-on-surface border border-outline-variant/20 px-1 rounded">{evt.newType}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {pipeline.schemaEvents.length === 0 && (
                <div className="text-on-surface-variant text-sm p-4 text-center">No recent schema events.</div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 shadow-xl w-full flex flex-col items-center">
             <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4 self-start">Radar View</h3>
             <div className="w-full h-56 -ml-4">
              <QualityRadar data={radarData} />
             </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">Pipeline Resources</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-surface-container p-3 rounded-lg border border-outline-variant/5">
                <span className="text-on-surface-variant text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">memory</span> CPU
                </span>
                <span className="font-mono font-bold">{pipeline.resources.cpu}%</span>
              </div>
              <div className="flex justify-between items-center bg-surface-container p-3 rounded-lg border border-outline-variant/5">
                <span className="text-on-surface-variant text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">storage</span> RAM
                </span>
                <span className="font-mono font-bold">{pipeline.resources.memory}</span>
              </div>
              <div className="flex justify-between items-center bg-surface-container p-3 rounded-lg border border-outline-variant/5">
                <span className="text-on-surface-variant text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">queue</span> Backlog
                </span>
                <span className="font-mono font-bold">{pipeline.resources.backlog}</span>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
