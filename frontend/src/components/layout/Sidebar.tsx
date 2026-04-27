'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type LucideIcon, BellRing, CircleUserRound, GitBranch, LayoutDashboard, LogOut, Settings } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Pipelines', href: '/pipelines', icon: GitBranch },
    { name: 'Alerts', href: '/anomalies', icon: BellRing },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-[#0e0e10] border-r border-outline-variant/15 z-50 font-inter antialiased text-sm tracking-tight">
      <div className="flex flex-col h-full p-4 gap-2">
        {/* Header */}
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <div className="w-8 h-8 rounded bg-linear-to-br from-primary to-primary-dim flex shrink-0 items-center justify-center shadow-lg shadow-primary/20">
            <GitBranch className="h-5 w-5 text-on-primary" aria-hidden="true" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xl font-bold tracking-tighter text-[#f9f5f8] truncate">DataSonar</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold leading-none truncate mt-0.5">Observability</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon as LucideIcon;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={isActive 
                  ? "flex items-center gap-3 px-3 py-2 text-[#85adff] bg-surface-container font-semibold rounded-md active:scale-[0.98] transition-all"
                  : "flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-[#f9f5f8] hover:bg-surface-container-low transition-colors duration-200 active:scale-[0.98]"}
              >
                <Icon className={isActive ? 'h-5 w-5 text-[#85adff]' : 'h-5 w-5'} aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer Navigation */}
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-outline-variant/10">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-[#f9f5f8] hover:bg-surface-container-low transition-colors duration-200">
            <CircleUserRound className="h-5 w-5" aria-hidden="true" />
            <span>Profile</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-[#f9f5f8] hover:bg-surface-container-low transition-colors duration-200">
            <LogOut className="h-5 w-5" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
