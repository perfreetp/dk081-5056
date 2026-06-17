import { create } from 'zustand';
import type { CaseInfo, Heir, DisputeRecord, TransferPackage, AcceptanceRecord, StatisticsSummary, MonthlyStats } from '@/types';

interface CaseStore {
  cases: CaseInfo[];
  currentCase: CaseInfo | null;
  heirs: Heir[];
  disputes: DisputeRecord[];
  currentTransfer: TransferPackage | null;
  currentAcceptance: AcceptanceRecord | null;
  statistics: StatisticsSummary | null;
  monthlyStats: MonthlyStats[];
  loading: boolean;
  error: string | null;

  setCases: (cases: CaseInfo[]) => void;
  setCurrentCase: (caseInfo: CaseInfo | null) => void;
  setHeirs: (heirs: Heir[]) => void;
  setDisputes: (disputes: DisputeRecord[]) => void;
  setCurrentTransfer: (transfer: TransferPackage | null) => void;
  setCurrentAcceptance: (acceptance: AcceptanceRecord | null) => void;
  setStatistics: (stats: StatisticsSummary) => void;
  setMonthlyStats: (stats: MonthlyStats[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  addHeir: (heir: Heir) => void;
  updateHeir: (heir: Heir) => void;
  removeHeir: (id: string) => void;
  addDispute: (dispute: DisputeRecord) => void;
  updateDispute: (dispute: DisputeRecord) => void;
  updateCase: (caseInfo: CaseInfo) => void;
}

export const useCaseStore = create<CaseStore>((set) => ({
  cases: [],
  currentCase: null,
  heirs: [],
  disputes: [],
  currentTransfer: null,
  currentAcceptance: null,
  statistics: null,
  monthlyStats: [],
  loading: false,
  error: null,

  setCases: (cases) => set({ cases }),
  setCurrentCase: (currentCase) => set({ currentCase }),
  setHeirs: (heirs) => set({ heirs }),
  setDisputes: (disputes) => set({ disputes }),
  setCurrentTransfer: (currentTransfer) => set({ currentTransfer }),
  setCurrentAcceptance: (currentAcceptance) => set({ currentAcceptance }),
  setStatistics: (statistics) => set({ statistics }),
  setMonthlyStats: (monthlyStats) => set({ monthlyStats }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addHeir: (heir) => set((state) => ({ heirs: [...state.heirs, heir] })),
  updateHeir: (heir) => set((state) => ({
    heirs: state.heirs.map((h) => (h.id === heir.id ? heir : h)),
  })),
  removeHeir: (id) => set((state) => ({
    heirs: state.heirs.filter((h) => h.id !== id),
  })),
  addDispute: (dispute) => set((state) => ({ disputes: [...state.disputes, dispute] })),
  updateDispute: (dispute) => set((state) => ({
    disputes: state.disputes.map((d) => (d.id === dispute.id ? dispute : d)),
  })),
  updateCase: (caseInfo) => set((state) => ({
    currentCase: caseInfo,
    cases: state.cases.map((c) => (c.id === caseInfo.id ? caseInfo : c)),
  })),
}));

interface AuthStore {
  user: { name: string; role: string; org: string } | null;
  login: (user: { name: string; role: string; org: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: { name: '管理员', role: 'admin', org: '县不动产登记中心' },
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
