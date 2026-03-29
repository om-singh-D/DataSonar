'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, BarChart2, LayoutDashboard, Settings, AlertTriangle } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUiStore();

  const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Pipelines', href: '/pipelines', icon: Activity },
    { name: 'Anomalies', href: '/anomalies', icon: AlertTriangle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div
      className={cn(
        'h-screen border-r bg-background border-border text-foreground transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="p-4 flex items-center h-16 border-b border-border">
        {sidebarOpen ? (
          <div className="flex items-center space-x-2 font-bold text-xl text-primary">
            <BarChart2 className="w-6 h-6" />
            <span>DataSonar</span>
          </div>
        ) : (
          <div className="w-full flex justify-center text-primary">
            <BarChart2 className="w-6 h-6" />
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} className="w-full block">
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-10',
                  !sidebarOpen && 'px-0 justify-center'
                )}
                title={!sidebarOpen ? item.name : undefined}
              >
                <item.icon className={cn('w-5 h-5 shrink-0', sidebarOpen && 'mr-3')} />
                {sidebarOpen && <span className="truncate">{item.name}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
