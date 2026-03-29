import Link from 'next/link';

export default async function PipelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            <Link href="/pipelines" className="hover:text-primary cursor-pointer transition-colors">Pipelines</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-on-surface">{id}</span>
          </nav>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-on-surface">{id}</h2>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(105,246,184,0.6)]"></span>
              Healthy
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-high transition-all rounded-md flex items-center gap-2 border-0">
            <span className="material-symbols-outlined text-sm">history</span>
            History
          </button>
          <button className="px-6 py-2 text-xs font-bold text-on-primary bg-gradient-to-br from-primary to-primary-dim hover:shadow-[0_0_20px_rgba(133,173,255,0.3)] transition-all rounded-md flex items-center gap-2 active:scale-95 border-0">
            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
            Run Now
          </button>
        </div>
      </div>

      {/* Bento Layout Stage */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Section 1: Quality Dimensions (Bento Large) */}
        <section className="col-span-12 lg:col-span-7 bg-surface-container-low p-6 rounded-xl border-l-2 border-primary border-t border-r border-b border-outline-variant/10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">Quality Dimensions</h3>
              <p className="text-xs text-on-surface-variant mt-1">Real-time data health scoring</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-primary tracking-tighter">98.4<span className="text-sm font-medium ml-1">%</span></span>
              <p className="text-[10px] text-secondary font-bold uppercase mt-1">+0.2% vs avg</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-12">
            {/* Dimension Item */}
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <span>Accuracy</span>
                <span className="text-on-surface">99.1%</span>
              </div>
              <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary shadow-[0_0_8px_rgba(133,173,255,0.4)]" style={{width: '99.1%'}}></div>
              </div>
            </div>
            {/* Dimension Item */}
            <div className="space-y-3">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                 <span>Completeness</span>
                 <span className="text-on-surface">97.5%</span>
               </div>
               <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                 <div className="h-full bg-primary shadow-[0_0_8px_rgba(133,173,255,0.4)]" style={{width: '97.5%'}}></div>
               </div>
            </div>
            {/* Dimension Item */}
            <div className="space-y-3">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                 <span>Consistency</span>
                 <span className="text-on-surface">100%</span>
               </div>
               <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                 <div className="h-full bg-secondary shadow-[0_0_8px_rgba(105,246,184,0.4)]" style={{width: '100%'}}></div>
               </div>
            </div>
            {/* Dimension Item */}
            <div className="space-y-3">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                 <span>Timeliness</span>
                 <span className="text-on-surface">94.2%</span>
               </div>
               <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                 <div className="h-full bg-tertiary-dim shadow-[0_0_8px_rgba(255,111,126,0.4)]" style={{width: '94.2%'}}></div>
               </div>
            </div>
            {/* Dimension Item */}
            <div className="space-y-3">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                 <span>Validity</span>
                 <span className="text-on-surface">98.8%</span>
               </div>
               <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                 <div className="h-full bg-primary shadow-[0_0_8px_rgba(133,173,255,0.4)]" style={{width: '98.8%'}}></div>
               </div>
            </div>
            {/* Dimension Item */}
            <div className="space-y-3">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                 <span>Uniqueness</span>
                 <span className="text-on-surface">99.9%</span>
               </div>
               <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                 <div className="h-full bg-primary shadow-[0_0_8px_rgba(133,173,255,0.4)]" style={{width: '99.9%'}}></div>
               </div>
            </div>
          </div>
        </section>

        {/* Section 2: Schema Evolution (Bento Tall) */}
        <section className="col-span-12 lg:col-span-5 bg-surface-container-low p-6 rounded-xl overflow-hidden flex flex-col border border-outline-variant/10">
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">Schema Evolution</h3>
            <p className="text-xs text-on-surface-variant mt-1">Detected type & structural drift</p>
          </div>
          <div className="space-y-4 flex-1">
            {/* Schema Change Card */}
            <div className="p-3 bg-surface-container rounded border border-outline-variant/10 group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-secondary">schema</span>
                  <span className="text-xs font-mono font-bold text-on-surface">item_pricing</span>
                </div>
                <span className="text-[9px] font-bold uppercase text-on-surface-variant bg-surface-container-highest px-1.5 py-0.5 rounded">2h ago</span>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 px-2 py-1 bg-surface-container-lowest rounded text-[10px] border border-error-dim/20">
                  <span className="text-on-surface-variant block mb-0.5 text-[8px] uppercase tracking-tighter">Old</span>
                  <span className="font-mono text-error">INTEGER</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">arrow_forward</span>
                <div className="flex-1 px-2 py-1 bg-surface-container-lowest rounded text-[10px] border border-secondary/20">
                  <span className="text-on-surface-variant block mb-0.5 text-[8px] uppercase tracking-tighter">New</span>
                  <span className="font-mono text-secondary">DECIMAL(10,2)</span>
                </div>
              </div>
            </div>

            {/* Schema Change Card */}
            <div className="p-3 bg-surface-container rounded border border-outline-variant/10 group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-primary">add_circle</span>
                  <span className="text-xs font-mono font-bold text-on-surface">supplier_uuid</span>
                </div>
                <span className="text-[9px] font-bold uppercase text-on-surface-variant bg-surface-container-highest px-1.5 py-0.5 rounded">5h ago</span>
              </div>
              <div className="mt-2 py-1 px-2 bg-secondary/5 border border-secondary/10 rounded w-max">
                <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">Added Field</span>
               </div>
            </div>

            {/* Schema Change Card */}
            <div className="p-3 bg-surface-container rounded border border-outline-variant/10 opacity-60">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-on-surface-variant">schema</span>
                  <span className="text-xs font-mono font-bold text-on-surface-variant">meta_tag_array</span>
                </div>
                <span className="text-[9px] font-bold uppercase text-on-surface-variant bg-surface-container-highest px-1.5 py-0.5 rounded">1d ago</span>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 px-2 py-1 bg-surface-container-lowest rounded text-[10px]">
                  <span className="font-mono text-on-surface-variant">VARCHAR</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">arrow_forward</span>
                <div className="flex-1 px-2 py-1 bg-surface-container-lowest rounded text-[10px]">
                  <span className="font-mono text-on-surface-variant">JSONB</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Detailed Event History (Scatter Plot Visual) */}
        <section className="col-span-12 bg-surface-container-low p-6 rounded-xl border-l-2 border-tertiary border-t border-r border-b border-outline-variant/10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">Anomaly Detection Stream</h3>
              <p className="text-xs text-on-surface-variant mt-1">Event latencies vs. throughput volume</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-dim"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Anomaly</span>
              </div>
            </div>
          </div>

          <div className="relative h-64 w-full">
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-b border-outline-variant/10 w-full h-0"></div>
                <div className="border-b border-outline-variant/10 w-full h-0"></div>
                <div className="border-b border-outline-variant/10 w-full h-0"></div>
                <div className="border-b border-outline-variant/10 w-full h-0"></div>
                <div className="border-b border-outline-variant/10 w-full h-0"></div>
              </div>
              {/* Data Points */}
              <div className="relative w-full h-full flex items-end pb-8">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 200">
                  <polyline fill="none" points="0,150 50,145 100,160 150,140 200,155 250,50 300,140 350,145 400,150 450,148 500,20 550,145 600,152 650,155 700,140 750,148 800,160 850,155 900,145 1000,150" stroke="#85adff" strokeOpacity="0.5" strokeWidth="1.5"></polyline>
                  
                  <circle cx="50" cy="145" fill="#85adff" r="3"></circle>
                  <circle cx="100" cy="160" fill="#85adff" r="3"></circle>
                  <circle cx="150" cy="140" fill="#85adff" r="3"></circle>
                  <circle cx="200" cy="155" fill="#85adff" r="3"></circle>
                  <circle cx="350" cy="145" fill="#85adff" r="3"></circle>
                  <circle cx="450" cy="148" fill="#85adff" r="3"></circle>
                  <circle cx="600" cy="152" fill="#85adff" r="3"></circle>
                  <circle cx="750" cy="148" fill="#85adff" r="3"></circle>
                  <circle cx="900" cy="145" fill="#85adff" r="3"></circle>

                  <g className="cursor-pointer group">
                    <circle className="animate-pulse" cx="250" cy="50" fill="#ff716c" r="6"></circle>
                    <text className="opacity-0 group-hover:opacity-100 transition-opacity" fill="#ff716c" fontSize="10" fontWeight="bold" x="260" y="45">Spike: Latency +450ms</text>
                  </g>
                  <g className="cursor-pointer group">
                    <circle className="animate-pulse" cx="500" cy="20" fill="#ff716c" r="6"></circle>
                    <text className="opacity-0 group-hover:opacity-100 transition-opacity" fill="#ff716c" fontSize="10" fontWeight="bold" x="510" y="15">Spike: Payload Malformed</text>
                  </g>
                </svg>
              </div>
            </div>
            {/* Axis Labels */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-2">
              <span>12:00 PM</span>
              <span>12:15 PM</span>
              <span>12:30 PM</span>
              <span>12:45 PM</span>
              <span>01:00 PM</span>
            </div>
          </div>
        </section>

        {/* Section 4: Resource Usage */}
        <section className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-surface-container p-4 rounded border border-outline-variant/10 border-t-2 border-t-primary/20">
            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-2">CPU Utilization</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-on-surface">42.8%</span>
              <span className="text-[10px] text-secondary font-bold">-5%</span>
            </div>
          </div>
          <div className="bg-surface-container p-4 rounded border border-outline-variant/10">
            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Memory Pressure</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-on-surface">12.4 GB</span>
              <span className="text-[10px] text-on-surface-variant font-bold">Stable</span>
            </div>
          </div>
          <div className="bg-surface-container p-4 rounded border border-outline-variant/10">
            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Backlog Count</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-on-surface">2,410</span>
              <span className="text-[10px] text-tertiary font-bold">+18%</span>
            </div>
          </div>
          <div className="bg-surface-container p-4 rounded border border-outline-variant/10 border-t-2 border-t-secondary/20">
            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Uptime Duration</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-on-surface">14d 2h</span>
              <span className="text-[10px] text-secondary font-bold">Healthy</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
