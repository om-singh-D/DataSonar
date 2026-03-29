'use client';

import Link from 'next/link';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';

export function Header() {
  const { alerts } = useRealtimeAlerts();
  const recentAlertsCount = alerts.length;

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-[#131315]/70 backdrop-blur-xl border-b border-[#48474a]/15 shadow-sm flex justify-between items-center px-8 font-inter text-sm font-medium">
      <div className="flex flex-1 items-center gap-6">
        <div className="relative w-64 group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input 
            className="w-full bg-surface-container-lowest py-2 pl-10 pr-4 rounded-md border-none focus:ring-1 focus:ring-primary/30 text-on-surface placeholder:text-on-surface-variant transition-all outline-none" 
            placeholder="Search logs, alerts, pipelines..." 
            type="text"
          />
        </div>
        <div className="flex items-center gap-4">
          <Link href="#" className="text-[#85adff] border-b-2 border-[#85adff] pb-1 transition-opacity">Prod-Cluster-01</Link>
          <Link href="#" className="text-[#adaaad] hover:text-[#f9f5f8] transition-opacity">Staging</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-[#adaaad] hover:text-[#f9f5f8] transition-colors">
          <span className="material-symbols-outlined">sensors</span>
        </button>
        <Link href="/anomalies" className="p-2 text-[#adaaad] hover:text-[#f9f5f8] transition-colors relative block">
          <span className="material-symbols-outlined">notifications</span>
          {recentAlertsCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-[#131315] animate-pulse"></span>
          )}
        </Link>
        <button className="p-2 text-[#adaaad] hover:text-[#f9f5f8] transition-colors">
          <span className="material-symbols-outlined">account_tree</span>
        </button>
        <div className="h-8 w-8 rounded-full bg-surface-container overflow-hidden ml-2 border border-outline-variant/30 flex items-center justify-center font-bold text-primary text-xs bg-primary/10">
          <img alt="User Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB55UsOwQMP0rsJxrOXJSawnbiHJ5via7J3Z3cSbXTva5JRyB_rjNWDCbPjk6oXWcvhPbk0kspNslQNDawdKsvmt7s4bD7dbwVNEJev8v1SQxLCXGwgN9bB0ohdNFy_WXgidCRGAgbM6AJZRESlkx3dS3PLBYHWFOoZtW_hdBrf6v9NDQvHP5bM1tkS2tm1eZvmYJit2lSDc6CY6UGhXKguCrK6OFN-VjAzZ2qUSJHrCSPYRhQnWCPT8SAETL6WAwdIP0wg_73RO6Cj"/>
        </div>
      </div>
    </header>
  );
}
