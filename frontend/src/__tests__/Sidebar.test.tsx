import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock Zustand Store
jest.mock('@/store/uiStore', () => ({
  useUiStore: () => ({
    sidebarOpen: true,
    toggleSidebar: jest.fn(),
  }),
}));

describe('Sidebar Component', () => {
  it('renders application title', () => {
    render(<Sidebar />);
    expect(screen.getByText('DataSonar')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Sidebar />);
    expect(screen.getByText('Pipelines')).toBeInTheDocument();
    expect(screen.getByText('Anomalies')).toBeInTheDocument();
  });
});
