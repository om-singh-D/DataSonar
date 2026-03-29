import { VolumeChart } from '@/components/charts/VolumeChart';

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
            <span>Oct 24 - Oct 31, 2023</span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm ml-2">expand_more</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-semibold rounded-md shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid: StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container p-5 rounded-xl border-l-2 border-primary-dim relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Total Events</span>
            <span className="material-symbols-outlined text-primary text-xl">database</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">1.2B</span>
            <span className="text-secondary text-xs font-medium flex items-center">
              <span className="material-symbols-outlined text-[10px] mr-0.5">trending_up</span>
              12%
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
            <span className="text-2xl font-bold font-mono">94.2%</span>
            <span className="text-secondary text-xs font-medium flex items-center">
              <span className="material-symbols-outlined text-[10px] mr-0.5">trending_up</span>
              0.4%
            </span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2 tracking-tight">Schema validation score</p>
        </div>

        <div className="bg-surface-container p-5 rounded-xl border-l-2 border-error relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Active Alerts</span>
            <span className="material-symbols-outlined text-error text-xl">warning</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">12</span>
            <span className="text-error text-xs font-medium flex items-center">
              <span className="material-symbols-outlined text-[10px] mr-0.5">priority_high</span>
              Critical
            </span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2 tracking-tight">Requiring immediate attention</p>
        </div>

        <div className="bg-surface-container p-5 rounded-xl border-l-2 border-tertiary relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Anomalies</span>
            <span className="material-symbols-outlined text-tertiary text-xl">analytics</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">3</span>
            <span className="text-on-surface-variant text-xs font-medium flex items-center">
              <span className="material-symbols-outlined text-[10px] mr-0.5">remove</span>
              Stable
            </span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2 tracking-tight">Detected outliers (6h)</p>
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
            <VolumeChart data={volumeData} />
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
              <div className="space-y-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">AWS Firehose</span>
                  <span className="font-mono">428M</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[85%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">Kafka-Cluster-Blue</span>
                  <span className="font-mono">312M</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[65%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">GCP PubSub</span>
                  <span className="font-mono">205M</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[45%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">Snowflake Sync</span>
                  <span className="font-mono">118M</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[25%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-6 bg-tertiary rounded-full"></div>
              <h3 className="font-bold tracking-tight">Anomaly Trend (Hourly)</h3>
            </div>
            <div className="h-44 flex items-end gap-1 px-2">
              <div className="flex-1 bg-surface-container hover:bg-tertiary/40 transition-colors h-[20%] rounded-t-sm"></div>
              <div className="flex-1 bg-surface-container hover:bg-tertiary/40 transition-colors h-[15%] rounded-t-sm"></div>
              <div className="flex-1 bg-surface-container hover:bg-tertiary/40 transition-colors h-[30%] rounded-t-sm"></div>
              <div className="flex-1 bg-tertiary/80 h-[90%] rounded-t-sm relative group">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-surface-container-high text-[10px] p-1 rounded border border-outline-variant/20 whitespace-nowrap">Spike Detected</div>
              </div>
              <div className="flex-1 bg-surface-container hover:bg-tertiary/40 transition-colors h-[40%] rounded-t-sm"></div>
              <div className="flex-1 bg-surface-container hover:bg-tertiary/40 transition-colors h-[25%] rounded-t-sm"></div>
              <div className="flex-1 bg-surface-container hover:bg-tertiary/40 transition-colors h-[10%] rounded-t-sm"></div>
              <div className="flex-1 bg-surface-container hover:bg-tertiary/40 transition-colors h-[20%] rounded-t-sm"></div>
              <div className="flex-1 bg-surface-container hover:bg-tertiary/40 transition-colors h-[35%] rounded-t-sm"></div>
              <div className="flex-1 bg-surface-container hover:bg-tertiary/40 transition-colors h-[50%] rounded-t-sm"></div>
              <div className="flex-1 bg-surface-container hover:bg-tertiary/40 transition-colors h-[45%] rounded-t-sm"></div>
              <div className="flex-1 bg-tertiary/60 h-[75%] rounded-t-sm"></div>
              <div className="flex-1 bg-surface-container hover:bg-tertiary/40 transition-colors h-[30%] rounded-t-sm"></div>
              <div className="flex-1 bg-surface-container hover:bg-tertiary/40 transition-colors h-[15%] rounded-t-sm"></div>
            </div>
            <div className="flex justify-between mt-4 px-2 text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:59</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts Section */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold tracking-tight">System Events</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Pipeline</th>
                  <th className="px-6 py-4">Issue</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                <tr className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-error-container/20 text-error text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span> CRITICAL
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">customer_data_sync</td>
                  <td className="px-6 py-4 text-on-surface-variant">Schema mismatch detected on userId field</td>
                  <td className="px-6 py-4 text-on-surface-variant font-mono">2m ago</td>
                </tr>
                <tr className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-highest text-tertiary text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> ANOMALY
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">billing_events_v2</td>
                  <td className="px-6 py-4 text-on-surface-variant">Unexpected 40% volume drop</td>
                  <td className="px-6 py-4 text-on-surface-variant font-mono">14m ago</td>
                </tr>
                <tr className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> RESOLVED
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">marketing_attribution</td>
                  <td className="px-6 py-4 text-on-surface-variant">Latency spike normalized</td>
                  <td className="px-6 py-4 text-on-surface-variant font-mono">1h ago</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5 flex flex-col justify-between">
            <div>
              <h4 className="font-bold mb-2">Cluster Health</h4>
              <p className="text-sm text-on-surface-variant mb-6">Distribution of node performance.</p>
              <div className="flex items-center justify-center py-4">
                <div className="relative w-32 h-32 rounded-full border-[12px] border-secondary border-l-primary border-b-error flex items-center justify-center">
                  <div className="text-center">
                    <span className="block text-xl font-bold">98%</span>
                    <span className="text-[9px] uppercase text-on-surface-variant font-bold">Online</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary"></span> Healthy</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span> Warning</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-error"></span> Down</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
