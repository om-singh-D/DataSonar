'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { Bell, GitBranch, Radar, Search } from 'lucide-react';

export function Header() {
  const { alerts } = useRealtimeAlerts();
  const recentAlertsCount = alerts.length;

  return (
    <header className="fixed top-0 right-0 left-64 h-16 z-40 bg-surface-container-low/70 backdrop-blur-xl border-b border-outline-variant/15 shadow-sm flex justify-between items-center px-4 md:px-8 font-inter text-sm font-medium">
      <div className="flex flex-1 items-center gap-4 md:gap-6 min-w-0">
        <div className="relative w-48 md:w-64 lg:w-80 group shrink-0">
          <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />
          <input 
            className="w-full bg-surface-container-lowest py-2 pl-10 pr-4 rounded-md border-none focus:ring-1 focus:ring-primary/30 text-on-surface placeholder:text-on-surface-variant transition-all outline-none truncate" 
            placeholder="Search logs, alerts, pipelines..." 
            type="text"
          />
        </div>
        <div className="flex items-center gap-4 shrink-0 overflow-hidden">
          <Link href="#" className="text-primary border-b-2 border-primary pb-1 transition-opacity truncate">Prod-Cluster-01</Link>
          <Link href="#" className="text-on-surface-variant hover:text-on-surface transition-opacity truncate hidden sm:block">Staging</Link>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 shrink-0 ml-4">
        <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Live telemetry">
          <Radar className="h-5 w-5" aria-hidden="true" />
        </button>
        <Link href="/anomalies" className="p-2 text-on-surface-variant hover:text-on-surface transition-colors relative block" aria-label="Alerts">
          <Bell className="h-5 w-5" aria-hidden="true" />
          {recentAlertsCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface-container-low animate-pulse"></span>
          )}
        </Link>
        <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Pipeline graph">
          <GitBranch className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden ml-2 border border-outline-variant/30 flex items-center justify-center font-bold text-primary text-xs bg-primary/10">
          <Image
            alt="User Avatar"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB55UsOwQMP0rsJxrOXJSawnbiHJ5via7J3Z3cSbXTva5JRyB_rjNWDCbPjk6oXWcvhPbk0kspNslQNDawdKsvmt7s4bD7dbwVNEJev8v1SQxLCXGwgN9bB0ohdNFy_WXgidCRGAgbM6AJZRESlkx3dS3PLBYHWFOoZtW_hdBrf6v9NDQvHP5bM1tkS2tm1eZvmYJit2lSDc6CY6UGhXKguCrK6OFN-VjAzZ2qUSJHrCSPYRhQnWCPT8SAETL6WAwdIP0wg_73RO6Cj"
            width={32}
            height={32}
            unoptimized
          />
        </div>
      </div>
    </header>
  );
}
