'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePipelines } from '@/hooks/useDashboardData';

export default function PipelinesPage() {
  const { data: pipelines, isLoading, error, refetch } = usePipelines();
  const [filterEnv, setFilterEnv] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredPipelines = pipelines?.filter((p) => {
    if (filterEnv === 'All') return true;
    return p.sourceType.toLowerCase() === filterEnv.toLowerCase();
  }) || [];

  const totalPages = Math.max(1, Math.ceil(filteredPipelines.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pagePipelines = filteredPipelines.slice(pageStart, pageStart + pageSize);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-error/10 border border-error/20 p-4 rounded-lg text-error">
          Failed to load pipelines.
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 pb-12 pt-8">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Data Pipelines</h2>
          <p className="text-on-surface-variant mt-1">Manage and monitor all active data sources.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface-container px-4 py-2 rounded-lg border border-outline-variant/10 text-sm font-medium cursor-pointer hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-2">filter_alt</span>
            <select 
              className="bg-transparent border-none outline-none cursor-pointer text-on-surface font-semibold"
              value={filterEnv}
              onChange={(e) => setFilterEnv(e.target.value)}
            >
              <option value="All">All Environments</option>
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="Kafka">Kafka</option>
              <option value="S3">S3</option>
              <option value="API">API</option>
            </select>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface border border-outline-variant/20 font-semibold rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span>Refresh</span>
          </button>
          <button 
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-br from-primary to-primary-dim text-on-primary font-bold rounded-lg shadow-lg hover:shadow-primary/30 transition-all active:scale-95 border-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Pipeline</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-xl overflow-hidden">
        {/* Table Controls Header */}
        <div className="px-6 py-4 flex items-center justify-between bg-surface-container/50 border-b border-outline-variant/10">
          <div className="flex items-center bg-surface-container px-4 py-2 rounded-full border border-outline-variant/20 focus-within:border-primary/50 transition-colors w-72">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Search pipelines..." 
              className="bg-transparent border-none outline-none ml-2 text-sm w-full placeholder:text-on-surface-variant/50"
            />
          </div>
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            {filteredPipelines.length} Pipelines visible
          </div>
        </div>

        {/* The Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/30 text-on-surface-variant text-xs uppercase tracking-widest border-b border-outline-variant/10">
                <th className="px-6 py-4 font-bold">Pipeline Name</th>
                <th className="px-6 py-4 font-bold">Source</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Volume</th>
                <th className="px-6 py-4 font-bold">Health</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {pagePipelines.map((pipeline) => (
                <tr key={pipeline.id} className="hover:bg-surface-container/40 transition-colors group">
                  <td className="px-6 py-5">
                    <Link href={`/pipelines/${pipeline.id}`} className="font-bold text-on-surface text-[15px] group-hover:text-primary transition-colors flex items-center gap-2 decoration-transparent cursor-pointer">
                      {pipeline.name}
                    </Link>
                    <div className="text-[11px] text-on-surface-variant mt-1 flex items-center gap-1 font-mono">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {pipeline.lastEventAt ? new Date(pipeline.lastEventAt).toLocaleString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-surface-container flex items-center justify-center border border-outline-variant/20">
                        {pipeline.sourceType === 'PostgreSQL' && <span className="material-symbols-outlined text-[14px]">database</span>}
                        {pipeline.sourceType === 'Kafka' && <span className="material-symbols-outlined text-[14px]">cell_tower</span>}
                        {(pipeline.sourceType !== 'PostgreSQL' && pipeline.sourceType !== 'Kafka') && <span className="material-symbols-outlined text-[14px]">api</span>}
                      </div>
                      <span className="text-sm font-medium">{pipeline.sourceType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border max-w-max uppercase tracking-wider ${
                      pipeline.status === 'ACTIVE'
                        ? 'bg-secondary/10 text-secondary border-secondary/20'
                        : pipeline.status === 'ERROR'
                        ? 'bg-error/10 text-error border-error/20'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant/20'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${pipeline.status === 'ACTIVE' ? 'bg-secondary' : pipeline.status === 'ERROR' ? 'bg-error' : 'bg-outline-variant'}`}></div>
                      {pipeline.status}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="font-mono font-bold text-sm">{parseInt(pipeline.eventCount).toLocaleString()}</div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Events</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${(pipeline.latestQualityScore || 0) > 90 ? 'bg-secondary' : (pipeline.latestQualityScore || 0) > 75 ? 'bg-primary' : 'bg-error'}`}
                          style={{ width: `${pipeline.latestQualityScore || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold font-mono">{pipeline.latestQualityScore ? pipeline.latestQualityScore.toFixed(1) + '%' : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors bg-transparent border-none cursor-pointer group-hover:opacity-100 opacity-50">
                      <span className="material-symbols-outlined ml-auto text-[20px]">more_horiz</span>
                    </button>
                  </td>
                </tr>
              ))}
              
              {pagePipelines.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                    <p>No pipelines found matching the filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Details (Visual Only for now) */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/10 text-sm">
          <div className="text-on-surface-variant font-medium">
            Showing <span className="font-bold text-on-surface">{filteredPipelines.length > 0 ? pageStart + 1 : 0}</span> to <span className="font-bold text-on-surface">{Math.min(pageStart + pageSize, filteredPipelines.length)}</span> of <span className="font-bold text-on-surface">{filteredPipelines.length}</span> pipelines
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={safePage <= 1}
              className="flex items-center justify-center w-8 h-8 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-on-primary font-bold border border-primary cursor-pointer">
              {safePage}
            </button>
            <button
              onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
              disabled={safePage >= totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
