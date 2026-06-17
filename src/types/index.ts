export type CaseStatus =
  | 'pending'
  | 'verified'
  | 'disputed'
  | 'transferring'
  | 'transferred'
  | 'accepted'
  | 'correction'
  | 'completed'
  | 'merged';

export type CaseType = 'notary' | 'mediation';

export type AttachmentType =
  | 'death_cert'
  | 'will'
  | 'notarial_cert'
  | 'mediation_agreement'
  | 'renounce_declaration'
  | 'property_cert'
  | 'id_card'
  | 'other';

export type DisputeType =
  | 'heir_dispute'
  | 'share_dispute'
  | 'will_dispute'
  | 'property_dispute'
  | 'other';

export type DisputeStatus = 'pending' | 'processing' | 'resolved';

export type TransferStatus = 'pending' | 'sent' | 'received';

export type AcceptanceStatus = 'accepted' | 'correction' | 'completed';

export interface CaseInfo {
  id: string;
  caseNo: string;
  caseType: CaseType;
  source: string;
  status: CaseStatus;
  deceasedName: string;
  deceasedIdCard: string;
  deceasedDate: string;
  propertyAddress: string;
  propertyArea: number;
  applyDate: string;
  handler: string;
  handlerOrg: string;
  remark?: string;
  isOverdue?: boolean;
  mergedInto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Heir {
  id: string;
  caseId: string;
  name: string;
  idCard: string;
  relationship: string;
  phone: string;
  shareRatio: string;
  isRenounced: boolean;
  renounceDocUrl?: string;
  remark?: string;
  order: number;
}

export interface Attachment {
  id: string;
  caseId: string;
  type: AttachmentType;
  name: string;
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DisputeRecord {
  id: string;
  caseId: string;
  type: DisputeType;
  description: string;
  status: DisputeStatus;
  isSuspended: boolean;
  suspendReason?: string;
  handler: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferPackage {
  id: string;
  caseId: string;
  transferNo: string;
  materialCatalog: MaterialItem[];
  transferredBy: string;
  transferredAt: string;
  status: TransferStatus;
}

export interface MaterialItem {
  id: string;
  name: string;
  type: string;
  count: number;
  isRequired: boolean;
  hasProvided: boolean;
  remark?: string;
}

export interface AcceptanceRecord {
  id: string;
  caseId: string;
  transferId: string;
  acceptanceNo: string;
  acceptedBy: string;
  acceptedAt: string;
  status: AcceptanceStatus;
  correctionOpinions?: CorrectionOpinion[];
}

export interface CorrectionOpinion {
  id: string;
  itemName: string;
  opinion: string;
  isSupplied: boolean;
  suppliedAt?: string;
}

export interface StatisticsSummary {
  totalCases: number;
  pendingCases: number;
  inProgressCases: number;
  completedCases: number;
  notaryCases: number;
  mediationCases: number;
  overdueCases: number;
  avgProcessingDays: number;
}

export interface MonthlyStats {
  month: string;
  notaryCount: number;
  mediationCount: number;
  completedCount: number;
}

export interface CaseQueryParams {
  keyword?: string;
  status?: CaseStatus;
  caseType?: CaseType;
  source?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  pending: '待核对',
  verified: '已核对',
  disputed: '争议中',
  transferring: '待移交',
  transferred: '已移交',
  accepted: '已受理',
  correction: '需补正',
  completed: '已完成',
  merged: '已归并',
};

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  notary: '公证继承',
  mediation: '诉调确认',
};

export const ATTACHMENT_TYPE_LABELS: Record<AttachmentType, string> = {
  death_cert: '死亡证明',
  will: '遗嘱',
  notarial_cert: '公证书',
  mediation_agreement: '调解协议',
  renounce_declaration: '放弃继承声明',
  property_cert: '产权证明',
  id_card: '身份证明',
  other: '其他材料',
};

export const DISPUTE_TYPE_LABELS: Record<DisputeType, string> = {
  heir_dispute: '继承人争议',
  share_dispute: '份额争议',
  will_dispute: '遗嘱争议',
  property_dispute: '产权争议',
  other: '其他争议',
};
