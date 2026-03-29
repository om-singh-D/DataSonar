import Link from 'next/link';

export default function PipelinesPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Pipelines</h1>
          <p className="text-on-surface-variant text-sm">Monitor and manage real-time data ingestion flows across clusters.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm border-0">filter_list</span>
            <select className="bg-surface-container text-on-surface text-xs border-none rounded-md pl-9 pr-8 py-2.5 appearance-none focus:ring-1 focus:ring-primary/30 cursor-pointer outline-none">
              <option>All Environments</option>
              <option>Production</option>
              <option>Staging</option>
              <option>Development</option>
            </select>
          </div>
          <button className="bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold px-4 py-2.5 rounded-md text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/10 border-0">
            <span className="material-symbols-outlined text-sm">add</span>
            Add Pipeline
          </button>
        </div>
      </div>

      {/* Pulse Metrics Bento Grid (Overview) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-low p-5 rounded-xl border-l-2 border-secondary/40">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Active Stream</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold">24</span>
            <span className="text-secondary text-xs font-medium">Healthy</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-5 rounded-xl border-l-2 border-error/40">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Critical Failures</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold">2</span>
            <span className="text-error text-xs font-medium">+1 from hour</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-5 rounded-xl border-l-2 border-tertiary/40">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Avg Latency</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold">142ms</span>
            <span className="text-on-surface-variant text-xs font-medium">Global</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-5 rounded-xl border-l-2 border-primary/40">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Data Volume</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold">1.2 TB</span>
            <span className="text-primary text-xs font-medium">Last 24h</span>
          </div>
        </div>
      </div>

      {/* Pipeline Table Container */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-outline-variant/10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/30">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Pipeline Name</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Environment</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Last Run</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Health Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {/* Row 1: Healthy */}
              <tr className="group hover:bg-surface-container transition-colors duration-150 border-l-2 border-transparent">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary border border-outline-variant/10">
                      <span className="material-symbols-outlined">database</span>
                    </div>
                    <div>
                      <Link href="/pipelines/SONAR-8821" className="font-semibold text-sm hover:underline hover:text-primary">Auth-Service-Logs</Link>
                      <p className="text-[10px] text-on-surface-variant font-mono">ID: SONAR-8821</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 rounded bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider border border-secondary/20">Production</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm">2 mins ago</span>
                    <span className="text-[10px] text-on-surface-variant">Duration: 42s</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 group/tooltip relative w-fit">
                    <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(105,246,184,0.5)]"></div>
                    <span className="text-sm text-secondary font-medium">Success</span>
                    <div className="absolute top-full left-0 mt-2 hidden group-hover/tooltip:block z-20">
                      <div className="bg-surface-container-highest text-xs p-2 rounded shadow-xl border border-outline-variant/20 whitespace-nowrap text-on-surface z-50">
                        100% events delivered, 0 dropped
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-on-surface border-0 transition-colors">
                      <span className="material-symbols-outlined text-lg">analytics</span>
                    </button>
                    <button className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-on-surface border-0 transition-colors">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-error border-0 transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 2: Warning */}
              <tr className="group hover:bg-surface-container transition-colors duration-150 border-l-2 border-transparent hover:border-tertiary">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-tertiary border border-outline-variant/10">
                      <span className="material-symbols-outlined">cloud_sync</span>
                    </div>
                    <div>
                      <Link href="/pipelines/SONAR-9104" className="font-semibold text-sm hover:underline hover:text-primary">Payment-Gateway-Metrics</Link>
                      <p className="text-[10px] text-on-surface-variant font-mono">ID: SONAR-9104</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 rounded bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider border border-secondary/20">Production</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm">12 mins ago</span>
                    <span className="text-[10px] text-on-surface-variant">Duration: 1.4m</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 group/tooltip relative w-fit">
                    <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(255,111,126,0.5)] animate-pulse"></div>
                    <span className="text-sm text-tertiary font-medium">Warning</span>
                    <div className="absolute top-full left-0 mt-2 hidden group-hover/tooltip:block z-20">
                      <div className="bg-surface-container-highest text-xs p-2 rounded shadow-xl border border-outline-variant/20 whitespace-nowrap text-on-surface">
                        High latency detected on Node-04
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-on-surface border-0 transition-colors">
                      <span className="material-symbols-outlined text-lg">analytics</span>
                    </button>
                    <button className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-on-surface border-0 transition-colors">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-error border-0 transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 3: Critical */}
              <tr className="group hover:bg-surface-container transition-colors duration-150 bg-error/5 border-l-2 border-transparent hover:border-error">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-error border border-error/20">
                      <span className="material-symbols-outlined">hub</span>
                    </div>
                    <div>
                      <Link href="/pipelines/SONAR-4402" className="font-semibold text-sm hover:underline hover:text-primary">Inventory-Sync-Global</Link>
                      <p className="text-[10px] text-on-surface-variant font-mono">ID: SONAR-4402</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">Staging</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm">1 hour ago</span>
                    <span className="text-[10px] text-error font-semibold">Failed</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 group/tooltip relative w-fit">
                    <div className="w-2 h-2 rounded-full bg-error shadow-[0_0_8px_rgba(255,113,108,0.5)]"></div>
                    <span className="text-sm text-error font-bold">Critical</span>
                    <div className="absolute top-full left-0 mt-2 hidden group-hover/tooltip:block z-20">
                      <div className="bg-surface-container-highest text-xs p-2 rounded shadow-xl border border-outline-variant/20 whitespace-nowrap text-on-surface">
                        Connection refused by endpoint
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-on-surface border-0 transition-colors">
                      <span className="material-symbols-outlined text-lg">refresh</span>
                    </button>
                    <button className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-on-surface border-0 transition-colors">
                      <span className="material-symbols-outlined text-lg">analytics</span>
                    </button>
                    <button className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-error border-0 transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 4: Healthy/Dev */}
              <tr className="group hover:bg-surface-container transition-colors duration-150 border-l-2 border-transparent hover:border-surface-container-highest">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant border border-outline-variant/10">
                      <span className="material-symbols-outlined">terminal</span>
                    </div>
                    <div>
                      <Link href="/pipelines/SONAR-1190" className="font-semibold text-sm hover:underline hover:text-primary">User-Feedback-Stream</Link>
                      <p className="text-[10px] text-on-surface-variant font-mono">ID: SONAR-1190</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant text-[10px] font-bold uppercase tracking-wider border border-outline-variant/20">Development</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm">Just now</span>
                    <span className="text-[10px] text-on-surface-variant">Duration: 12s</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 group/tooltip relative w-fit">
                    <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(105,246,184,0.5)]"></div>
                    <span className="text-sm text-secondary font-medium">Success</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-on-surface border-0 transition-colors">
                      <span className="material-symbols-outlined text-lg">analytics</span>
                    </button>
                    <button className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-on-surface border-0 transition-colors">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-error border-0 transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination/Footer */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/10">
          <p className="text-xs text-on-surface-variant">Showing <span className="text-on-surface font-bold">4</span> of <span className="text-on-surface font-bold">24</span> active pipelines</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded bg-surface-container-highest text-on-surface-variant hover:text-on-surface disabled:opacity-30 border-0" disabled>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded bg-primary text-on-primary text-xs font-bold border-0 hover:bg-primary-dim transition-colors">1</button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container-highest text-xs font-bold transition-colors border-0">2</button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container-highest text-xs font-bold transition-colors border-0">3</button>
            <button className="p-1.5 rounded bg-surface-container-highest text-on-surface-variant hover:text-on-surface border-0">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Status Log */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container p-6 rounded-xl border-l-4 border-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">System Health Snapshot</h3>
            <span className="text-[10px] text-on-surface-variant font-mono">REAL-TIME FEED: ONLINE</span>
          </div>
          <div className="h-32 flex items-end gap-1 px-2">
            <div className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[60%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[40%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[55%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[80%] rounded-t-sm"></div>
            <div className="flex-1 bg-error/40 hover:bg-error transition-colors h-[15%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[65%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[70%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[45%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[90%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[30%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[55%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[75%] rounded-t-sm"></div>
            <div className="flex-1 bg-tertiary/40 hover:bg-tertiary transition-colors h-[25%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[60%] rounded-t-sm"></div>
            <div className="flex-1 bg-primary/20 hover:bg-primary transition-colors h-[45%] rounded-t-sm"></div>
          </div>
          <p className="mt-4 text-xs text-on-surface-variant italic">Data throughput across all 24 healthy streams is nominal. 2 nodes reporting minor backpressure in Staging environment.</p>
        </div>
        
        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/10">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">bolt</span>
            Quick Insights
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-1 h-8 rounded bg-error"></div>
              <div>
                <p className="text-xs font-bold">Failed: Inventory-Sync</p>
                <p className="text-[10px] text-on-surface-variant">API Endpoint Timeout after 3 retries.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1 h-8 rounded bg-secondary"></div>
              <div>
                <p className="text-xs font-bold">Optimal: Auth-Service</p>
                <p className="text-[10px] text-on-surface-variant">99th percentile latency at 12ms.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1 h-8 rounded bg-primary"></div>
              <div>
                <p className="text-xs font-bold">Updated: Pipeline-88</p>
                <p className="text-[10px] text-on-surface-variant">New transformation logic deployed.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
