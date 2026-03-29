import Link from 'next/link';

export default function AnomaliesPage() {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Alerts Center</h1>
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-surface-container-high border border-outline-variant/20">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Live</span>
            </div>
          </div>
          <p className="text-on-surface-variant max-w-xl">Real-time health monitoring and anomaly detection across your globally distributed pipeline architecture.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant/10">
            <span className="px-3 text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Severity</span>
            <div className="flex gap-1">
              <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-error/10 text-error border border-error/20 hover:bg-error/20 transition-colors">High</button>
              <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors border-0">Medium</button>
              <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors border-0">Low</button>
            </div>
          </div>
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant/10">
            <span className="px-3 text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Status</span>
            <div className="flex gap-1">
              <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary/10 text-primary border border-primary/20">Unresolved</button>
              <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors border-0">Resolved</button>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface rounded-md border border-outline-variant/20 hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            <span className="text-xs font-semibold uppercase tracking-wider">More Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Row 1: High */}
        <div className="bg-surface-container-low rounded-xl border-l-[3px] border-error group relative overflow-hidden">
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-error border border-error/20">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>error</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-error">High Severity</span>
                  <span className="text-[10px] text-on-surface-variant font-mono">2024-05-20 14:22:31 UTC</span>
                </div>
                <h3 className="text-lg font-semibold text-on-surface leading-snug">Schema mismatch detected in Pipeline-A</h3>
                <p className="text-sm text-on-surface-variant mt-1">Found 43 unexpected fields in the ingestion layer. Automatic mapping failed for 'user_metadata_v2' cluster.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-md bg-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-wider hover:bg-surface-variant transition-all border-0">Acknowledge</button>
              <button className="px-4 py-2 rounded-md bg-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-wider hover:bg-surface-variant transition-all border-0">Resolve</button>
              <button className="px-4 py-2 rounded-md bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 border-0">
                View Pipeline <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-error/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0"></div>
        </div>

        {/* Row 2: Medium */}
        <div className="bg-surface-container-low rounded-xl border-l-[3px] border-tertiary group relative overflow-hidden">
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-tertiary">Medium Severity</span>
                  <span className="text-[10px] text-on-surface-variant font-mono">2024-05-20 14:15:04 UTC</span>
                </div>
                <h3 className="text-lg font-semibold text-on-surface leading-snug">High Latency in US-East-1 Ingestion</h3>
                <p className="text-sm text-on-surface-variant mt-1">Average response time spiked to 1.2s (Threshold: 400ms). Load balancer reporting 5% retry rate.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-md bg-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-wider hover:bg-surface-variant transition-all border-0">Acknowledge</button>
              <button className="px-4 py-2 rounded-md bg-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-wider hover:bg-surface-variant transition-all border-0">Resolve</button>
              <button className="px-4 py-2 rounded-md bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 border-0">
                View Pipeline <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-tertiary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0"></div>
        </div>

        {/* Row 3: Low */}
        <div className="bg-surface-container-low rounded-xl border-l-[3px] border-primary group relative overflow-hidden">
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>info</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Low Severity</span>
                  <span className="text-[10px] text-on-surface-variant font-mono">2024-05-20 13:58:12 UTC</span>
                </div>
                <h3 className="text-lg font-semibold text-on-surface leading-snug">Pipeline-C: Minor Throughput Drop</h3>
                <p className="text-sm text-on-surface-variant mt-1">Throughput decreased by 12%. No impact on downstream consumers noted yet.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-md bg-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-wider hover:bg-surface-variant transition-all border-0">Acknowledge</button>
              <button className="px-4 py-2 rounded-md bg-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-wider hover:bg-surface-variant transition-all border-0">Resolve</button>
              <button className="px-4 py-2 rounded-md bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 border-0">
                View Pipeline <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 4: Resolved/Archived */}
        <div className="bg-surface-container-low/40 rounded-xl border-l-[3px] border-outline-variant opacity-60">
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-outline-variant/10 flex items-center justify-center text-on-surface-variant border border-outline-variant/20">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Resolved</span>
                  <span className="text-[10px] text-on-surface-variant/60 font-mono">2024-05-20 11:02:45 UTC</span>
                </div>
                <h3 className="text-lg font-semibold text-on-surface-variant leading-snug line-through decoration-1">Memory Pressure on Redis Cluster 04</h3>
                <p className="text-sm text-on-surface-variant/60 mt-1">Auto-scaling group triggered. 2 new nodes added to pool. Resolved by System.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-md bg-surface-container text-on-surface-variant text-xs font-bold uppercase tracking-wider cursor-not-allowed border-0">Archived</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Alert Volume (24h)</span>
            <span className="material-symbols-outlined text-primary">monitoring</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold tracking-tight text-on-surface">142</span>
            <span className="text-secondary text-sm font-medium">+12%</span>
          </div>
          <div className="h-16 w-full flex items-end gap-1">
            <div className="w-full bg-primary/20 h-[30%] rounded-t-sm"></div>
            <div className="w-full bg-primary/20 h-[45%] rounded-t-sm"></div>
            <div className="w-full bg-primary/20 h-[60%] rounded-t-sm"></div>
            <div className="w-full bg-primary/20 h-[55%] rounded-t-sm"></div>
            <div className="w-full bg-primary/20 h-[80%] rounded-t-sm"></div>
            <div className="w-full bg-primary h-full rounded-t-sm shadow-[0_0_15px_rgba(133,173,255,0.4)]"></div>
          </div>
        </div>
        
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Mean Time to Resolution</span>
            <span className="material-symbols-outlined text-secondary">timer</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold tracking-tight text-on-surface">14.2m</span>
            <span className="text-secondary text-sm font-medium">-4.5m</span>
          </div>
          <p className="text-xs text-on-surface-variant">Performing better than last week average (18.7m).</p>
        </div>
        
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Critical Incidents</span>
            <span className="material-symbols-outlined text-error">report</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold tracking-tight text-on-surface">3</span>
            <span className="text-error text-sm font-medium">Attention</span>
          </div>
          <div className="flex -space-x-2">
            <img alt="On-call user" className="w-7 h-7 rounded-full border-2 border-surface-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUncizo977zGyFKGkaT_5YjN0-eeLLOIiTTbf5njGYdCDBT6N7-vbTrPMdZ03xG4BsL0SxjIInl2ZC_y9a-FNlV0kjdhbGQIZ7lqpxeFnwG-VcDKzIudnApkEWTKObD_glY3jioGJaj6ujNy6s4FHswvdbkg_Akk2CLObnxJNX4KGvCp2iw4cFDIgCsGLNQzuEqS5s0gXK1aJEz07kzktr54U2R4M42miqA_kPdEh2ykPSmR9YfmZZQgXSJVZ49c3UeHAikU2SYT0Q"/>
            <img alt="On-call user" className="w-7 h-7 rounded-full border-2 border-surface-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVY5xVnrkKmfbLMhwwTV5ITgI2oyJT_bGNtmxd_p6N2QIB09p_mjdO8tOKiJyIyzJm9mi1GjZ6ImCFXBOoL8hNW6di8lJVW7IVP0EoLujjqboI9c1SBk18RN6kAEZ_3LuOCiFPU2n3wRoMGqsmbqb_lqHXFyGGhT1UZUZV7-gEDuLTwIzW_PIvTrn4M1Q8OaN4vGhJt0cbvIIqaPhd9WhUnYdRmwAb_Pxoia_BovY_bnMYEfHhDoOr0Y0nmu-J284Y9WS1J-7dntpv"/>
            <div className="w-7 h-7 rounded-full bg-surface-container-highest border-2 border-surface-container flex items-center justify-center text-[8px] font-bold">+2</div>
          </div>
        </div>
      </div>

      <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary shadow-xl shadow-primary/20 flex items-center justify-center active:scale-95 transition-all z-50 group border-0">
        <span className="material-symbols-outlined text-2xl">add</span>
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-surface-container-high border border-outline-variant/20 rounded-md text-xs font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">New Alert Rule</span>
      </button>
    </div>
  );
}
