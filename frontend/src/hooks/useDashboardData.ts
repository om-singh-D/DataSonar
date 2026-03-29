import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { OverviewMetrics, PipelineListItem, PipelineDetail, PaginatedAlerts } from '../lib/types';

export function useOverview() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: async () => {
      const { data } = await api.get<OverviewMetrics>('/metrics/overview');
      return data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}

export function usePipelines() {
  return useQuery({
    queryKey: ['pipelines'],
    queryFn: async () => {
      const { data } = await api.get<PipelineListItem[]>('/pipelines');
      return data;
    },
    refetchInterval: 60000,
  });
}

export function usePipelineDetail(id: string) {
  return useQuery({
    queryKey: ['pipelines', id],
    queryFn: async () => {
      const { data } = await api.get<PipelineDetail>(`/pipelines/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: 60000,
  });
}

export function useAlerts(filters: { severity?: string; status?: string; limit?: number; offset?: number } = {}) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.status) params.append('status', filters.status);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
      
      const { data } = await api.get<PaginatedAlerts>(`/alerts?${params.toString()}`);
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data } = await api.patch(`/alerts/${alertId}/resolve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
    },
  });
}
