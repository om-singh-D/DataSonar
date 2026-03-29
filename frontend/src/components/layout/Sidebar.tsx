'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/', icon: 'dashboard' },
    { name: 'Pipelines', href: '/pipelines', icon: 'account_tree' },
    { name: 'Alerts', href: '/anomalies', icon: 'notifications_active' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-[#0e0e10] border-r border-[#48474a]/15 z-50 font-inter antialiased text-sm tracking-tight">
      <div className="flex flex-col h-full p-4 gap-2">
        {/* Header */}
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary text-xl" data-icon="account_tree">account_tree</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter text-[#f9f5f8]">DataSonar</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold leading-none">Observability</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={isActive 
                  ? "flex items-center gap-3 px-3 py-2 text-[#85adff] bg-[#19191c] font-semibold rounded-md active:scale-[0.98] transition-all"
                  : "flex items-center gap-3 px-3 py-2 text-[#adaaad] hover:text-[#f9f5f8] hover:bg-[#131315] transition-colors duration-200 active:scale-[0.98]"}
              >
                <span 
                  className="material-symbols-outlined text-[20px]" 
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer Navigation */}
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-outline-variant/10">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-[#adaaad] hover:text-[#f9f5f8] hover:bg-[#131315] transition-colors duration-200">
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
            <span>Profile</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-[#adaaad] hover:text-[#f9f5f8] hover:bg-[#131315] transition-colors duration-200">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
