'use client';

import { Menu, Bell } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function Header() {
  const { toggleSidebar } = useUiStore();
  const { alerts } = useRealtimeAlerts();

  const recentAlertsCount = alerts.length;

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 sticky top-0 z-10 w-full transition-all duration-300">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold border-l pl-4 border-border text-muted-foreground flex items-center space-x-2">
            <span>Env:</span>
            <Badge variant="outline" className="text-primary border-primary/50">Production</Badge>
          </h2>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Alerts Button */}
        <Link href="/anomalies">
          <div className="relative">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            {recentAlertsCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full text-[10px]"
              >
                {recentAlertsCount > 99 ? '99+' : recentAlertsCount}
              </Badge>
            )}
          </div>
        </Link>
        
        {/* User Profile Stub */}
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-sm font-semibold text-primary cursor-pointer hover:bg-primary/20 transition-colors">
          DS
        </div>
      </div>
    </header>
  );
}
