import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'DataSonar | Observability Dashboard',
  description: 'Real-time data pipeline observability and anomaly detection.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-[#0e0e10] text-[#f9f5f8] antialiased selection:bg-primary/30">
        <QueryProvider>
          <div className="min-h-screen font-body">
            <Sidebar />
            <Header />
            <main className="ml-64 pt-16 min-h-screen bg-surface">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
