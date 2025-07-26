// path: src/hooks/index.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import {
  User, UserSchema,
  Software, SoftwareSchema,
  Review, ReviewSchema,
  Request, RequestSchema,
  PurchaseProject, PurchaseProjectSchema,
  Notification, NotificationSchema,
  EconomyItem, EconomyItemSchema,
  DashboardCosts, DashboardCostsSchema,
  ContractAlert, ContractAlertSchema,
  ImportBatch, ImportBatchSchema,
  UserBadge, UserBadgeSchema,
  PaginatedResponseSchema,
  ApiResponseSchema,
} from '../lib/zod-schemas';

// Query Keys
export const queryKeys = {
  me: ['me'] as const,
  notifications: ['notifications'] as const,
  softwares: ['softwares'] as const,
  software: (id: string) => ['software', id] as const,
  requests: ['requests'] as const,
  request: (id: string) => ['request', id] as const,
  purchaseProject: (id: string) => ['purchaseProject', id] as const,
  dashboardCosts: ['dashboardCosts'] as const,
  economies: ['economies'] as const,
  contractAlerts: ['contractAlerts'] as const,
  importBatch: (id: string) => ['importBatch', id] as const,
  userBadges: ['userBadges'] as const,
};

// Auth & User hooks
export const useMe = () => {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const response = await apiFetch<{ data: User }>('/me');
      return UserSchema.parse(response.data);
    },
  });
};

// Notifications hooks
export const useNotifications = (filter?: string) => {
  return useQuery({
    queryKey: [...queryKeys.notifications, filter],
    queryFn: async () => {
      const params = filter ? `?type=${filter}` : '';
      const response = await apiFetch<{ data: Notification[] }>(`/notifications${params}`);
      return response.data.map(n => NotificationSchema.parse(n));
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      return apiFetch(`/notifications/${notificationId}`, { 
        method: 'PATCH', 
        body: JSON.stringify({ readAt: new Date().toISOString() })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};

// Software hooks
export const useSoftwares = (params?: { search?: string; category?: string }) => {
  return useQuery({
    queryKey: [...queryKeys.softwares, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.category) searchParams.set('category', params.category);
      
      const response = await apiFetch<{ data: Software[] }>(`/softwares?${searchParams}`);
      return response.data.map(s => SoftwareSchema.parse(s));
    },
  });
};

export const useSoftware = (id: string) => {
  return useQuery({
    queryKey: queryKeys.software(id),
    queryFn: async () => {
      const response = await apiFetch<{ data: Software }>(`/softwares/${id}`);
      return SoftwareSchema.parse(response.data);
    },
    enabled: !!id,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reviewData: {
      softwareId: string;
      rating: number;
      strengths: string;
      weaknesses: string;
      improvement?: string;
      tags?: string[];
    }) => {
      const response = await apiFetch<{ data: Review }>('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });
      return ReviewSchema.parse(response.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.software(variables.softwareId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
};

// Requests hooks
export const useRequests = (params?: { status?: string; search?: string }) => {
  return useQuery({
    queryKey: [...queryKeys.requests, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.search) searchParams.set('search', params.search);
      
      const response = await apiFetch<{ data: Request[] }>(`/requests?${searchParams}`);
      return response.data.map(r => RequestSchema.parse(r));
    },
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestData: {
      softwareRef?: string;
      descriptionNeed: string;
      urgency: 'IMMEDIATE' | 'LT_3M' | 'GT_3M';
      estBudget?: number;
    }) => {
      const response = await apiFetch<{ data: Request }>('/requests', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      return RequestSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests });
    },
  });
};

export const useVoteRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestId: string) => {
      return apiFetch(`/requests/${requestId}/votes`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests });
    },
  });
};

// Dashboard hooks
export const useDashboardCosts = () => {
  return useQuery({
    queryKey: queryKeys.dashboardCosts,
    queryFn: async () => {
      const response = await apiFetch<{ data: DashboardCosts }>('/dashboard/costs');
      return DashboardCostsSchema.parse(response.data);
    },
  });
};

export const useEconomies = () => {
  return useQuery({
    queryKey: queryKeys.economies,
    queryFn: async () => {
      const response = await apiFetch<{ data: EconomyItem[] }>('/economies');
      return response.data.map(e => EconomyItemSchema.parse(e));
    },
  });
};

export const useContractAlerts = () => {
  return useQuery({
    queryKey: queryKeys.contractAlerts,
    queryFn: async () => {
      const response = await apiFetch<{ data: ContractAlert[] }>('/contracts/alerts');
      return response.data.map(a => ContractAlertSchema.parse(a));
    },
  });
};

// Purchase Project hooks
export const usePurchaseProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.purchaseProject(id),
    queryFn: async () => {
      const response = await apiFetch<{ data: PurchaseProject }>(`/purchase-projects/${id}`);
      return PurchaseProjectSchema.parse(response.data);
    },
    enabled: !!id,
  });
};

export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiFetch(`/purchase-projects/${id}`, { 
        method: 'PATCH', 
        body: JSON.stringify({ status })
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseProject(variables.id) });
    },
  });
};

// Import Wizard hooks
export const useImportWizard = () => {
  const queryClient = useQueryClient();
  
  const createImport = useMutation({
    mutationFn: async (rawData: string) => {
      const response = await apiFetch<{ data: ImportBatch }>('/imports', {
        method: 'POST',
        body: JSON.stringify({ rawData })
      });
      return ImportBatchSchema.parse(response.data);
    },
  });

  const updateMapping = useMutation({
    mutationFn: async ({ id, mapping }: { id: string; mapping: Record<string, string> }) => {
      const response = await apiFetch<{ data: ImportBatch }>(`/imports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ mapping })
      });
      return ImportBatchSchema.parse(response.data);
    },
  });

  const commitImport = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch<{ data: ImportBatch }>(`/imports/${id}/commit`, {
        method: 'POST'
      });
      return ImportBatchSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.softwares });
    },
  });

  const useImportPreview = (id: string) => {
    return useQuery({
      queryKey: queryKeys.importBatch(id),
      queryFn: async () => {
        const response = await apiFetch<{ data: ImportBatch }>(`/imports/${id}`);
        return ImportBatchSchema.parse(response.data);
      },
      enabled: !!id,
    });
  };

  return {
    createImport,
    updateMapping,
    commitImport,
    useImportPreview,
  };
};

// Gamification hooks
export const useUserBadges = () => {
  return useQuery({
    queryKey: queryKeys.userBadges,
    queryFn: async () => {
      const response = await apiFetch<{ data: UserBadge[] }>('/me/badges');
      return response.data.map(b => UserBadgeSchema.parse(b));
    },
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const response = await apiFetch<{ 
        data: {
          softwaresAdded: number;
          reviewsGiven: number;
          votesGiven: number;
          economiesSuggested: number;
          completionPercentage: number;
        }
      }>('/me/stats');
      return response.data;
    },
  });
};