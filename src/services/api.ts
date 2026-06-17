const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }
  return data;
}

export const api = {
  cases: {
    list: (params?: Record<string, string | number | undefined>) => {
      const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return request(`/cases${query}`);
    },
    get: (id: string) => request(`/cases/${id}`),
    create: (data: unknown) => request('/cases', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) => request(`/cases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) => 
      request(`/cases/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getDuplicates: (id: string) => request(`/cases/${id}/duplicates`),
    getHeirs: (caseId: string) => request(`/cases/${caseId}/heirs`),
    addHeir: (caseId: string, data: unknown) => 
      request(`/cases/${caseId}/heirs`, { method: 'POST', body: JSON.stringify(data) }),
    updateHeir: (id: string, data: unknown) =>
      request(`/cases/heirs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteHeir: (id: string) =>
      request(`/cases/heirs/${id}`, { method: 'DELETE' }),
    getAttachments: (caseId: string) => request(`/cases/${caseId}/attachments`),
    addAttachment: (caseId: string, data: unknown) =>
      request(`/cases/${caseId}/attachments`, { method: 'POST', body: JSON.stringify(data) }),
    getDisputes: (caseId: string) => request(`/cases/${caseId}/disputes`),
    addDispute: (caseId: string, data: unknown) =>
      request(`/cases/${caseId}/disputes`, { method: 'POST', body: JSON.stringify(data) }),
    updateDispute: (id: string, data: unknown) =>
      request(`/cases/disputes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  transfers: {
    pending: () => request('/transfers/pending'),
    getByCaseId: (caseId: string) => request(`/transfers/case/${caseId}`),
    generate: (caseId: string) => 
      request('/transfers/generate', { method: 'POST', body: JSON.stringify({ caseId }) }),
    create: (caseId: string, handler: string) =>
      request('/transfers', { method: 'POST', body: JSON.stringify({ caseId, handler }) }),
    send: (id: string) =>
      request(`/transfers/${id}/send`, { method: 'PUT' }),
  },
  acceptances: {
    list: () => request('/acceptances'),
    getByCaseId: (caseId: string) => request(`/acceptances/case/${caseId}`),
    create: (data: unknown) =>
      request('/acceptances', { method: 'POST', body: JSON.stringify(data) }),
    addCorrection: (id: string, opinions: unknown[]) =>
      request(`/acceptances/${id}/correction`, { method: 'PUT', body: JSON.stringify({ opinions }) }),
    confirmSupplement: (id: string, opinionIds: string[]) =>
      request(`/acceptances/${id}/supplement`, { method: 'POST', body: JSON.stringify({ opinionIds }) }),
  },
  statistics: {
    summary: () => request('/statistics/summary'),
    monthly: () => request('/statistics/monthly'),
    overdue: () => request('/statistics/overdue'),
    search: (keyword: string) => request(`/statistics/search?keyword=${encodeURIComponent(keyword)}`),
  },
};
