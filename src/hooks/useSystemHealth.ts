'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useSystemHealth() {
  const { data, error, isLoading } = useSWR('/api/health', fetcher, {
    refreshInterval: 30000, // Sync every 30s
    dedupingInterval: 5000,
  });

  const isOperational = data?.status === 'healthy' && !error;
  const isUnstable = (data?.status === 'unstable' || !!error) && !isLoading;

  return {
    status: isOperational ? 'operational' : isUnstable ? 'unstable' : 'checking',
    latency: data?.metrics?.latency || '0ms',
    lastChecked: data?.timestamp,
    isLoading,
  };
}
