import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={`${inter.className} bg-[#0e0e10] text-[#f9f5f8] antialiased selection:bg-primary/30`}>
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
