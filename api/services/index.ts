import { store } from '../store/memoryStore';
import type {
  CaseInfo,
  Heir,
  Attachment,
  DisputeRecord,
  TransferPackage,
  AcceptanceRecord,
  CaseQueryParams,
  PaginatedResponse,
  MaterialItem,
  StatisticsSummary,
  MonthlyStats,
  CaseStatus,
  CorrectionOpinion,
} from '../../shared';

class CaseService {
  getCases(params: CaseQueryParams): PaginatedResponse<CaseInfo> {
    let cases = store.getCases();

    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      cases = cases.filter(
        (c) =>
          c.caseNo.toLowerCase().includes(kw) ||
          c.deceasedName.toLowerCase().includes(kw) ||
          c.deceasedIdCard.includes(kw) ||
          c.propertyAddress.toLowerCase().includes(kw)
      );
    }

    if (params.status) {
      cases = cases.filter((c) => c.status === params.status);
    }

    if (params.caseType) {
      cases = cases.filter((c) => c.caseType === params.caseType);
    }

    if (params.source) {
      cases = cases.filter((c) => c.source === params.source);
    }

    if (params.startDate) {
      cases = cases.filter((c) => c.applyDate >= params.startDate!);
    }

    if (params.endDate) {
      cases = cases.filter((c) => c.applyDate <= params.endDate!);
    }

    const total = cases.length;
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const data = cases.slice(start, start + pageSize);

    return { data, total, page, pageSize };
  }

  getCaseById(id: string): CaseInfo | null {
    return store.getCaseById(id) || null;
  }

  createCase(caseData: Omit<CaseInfo, 'id' | 'createdAt' | 'updatedAt'>): CaseInfo {
    const newCase = store.addCase(caseData);
    return newCase;
  }

  updateCase(id: string, updates: Partial<CaseInfo>): CaseInfo | null {
    return store.updateCase(id, updates) || null;
  }

  findDuplicates(deceasedIdCard: string, excludeId?: string): CaseInfo[] {
    return store.findDuplicateCases(deceasedIdCard, excludeId);
  }

  getHeirs(caseId: string): Heir[] {
    return store.getHeirsByCaseId(caseId);
  }

  addHeir(heir: Omit<Heir, 'id'>): Heir {
    return store.addHeir(heir);
  }

  updateHeir(id: string, updates: Partial<Heir>): Heir | null {
    return store.updateHeir(id, updates) || null;
  }

  deleteHeir(id: string): boolean {
    return store.deleteHeir(id);
  }

  getAttachments(caseId: string): Attachment[] {
    return store.getAttachmentsByCaseId(caseId);
  }

  addAttachment(att: Omit<Attachment, 'id'>): Attachment {
    return store.addAttachment(att);
  }

  getDisputes(caseId: string): DisputeRecord[] {
    return store.getDisputesByCaseId(caseId);
  }

  addDispute(dispute: Omit<DisputeRecord, 'id' | 'createdAt' | 'updatedAt'>): DisputeRecord {
    return store.addDispute(dispute);
  }

  updateDispute(id: string, updates: Partial<DisputeRecord>): DisputeRecord | null {
    return store.updateDispute(id, updates) || null;
  }

  updateCaseStatus(caseId: string, status: CaseStatus): CaseInfo | null {
    return store.updateCase(caseId, { status }) || null;
  }
}

class TransferService {
  getPendingTransfers(): TransferPackage[] {
    return store.getTransfers().filter((t) => t.status === 'pending' || t.status === 'sent');
  }

  getTransferByCaseId(caseId: string): TransferPackage | null {
    return store.getTransferByCaseId(caseId) || null;
  }

  generateMaterialCatalog(caseId: string): MaterialItem[] {
    const caseInfo = store.getCaseById(caseId);
    if (!caseInfo) return [];

    const baseMaterials: MaterialItem[] = [
      { id: 'mat_1', name: '死亡证明', type: 'death_cert', count: 1, isRequired: true, hasProvided: true },
      { id: 'mat_2', name: '继承人身份证明', type: 'id_card', count: 2, isRequired: true, hasProvided: true },
      { id: 'mat_3', name: '不动产权证书', type: 'property_cert', count: 1, isRequired: true, hasProvided: true },
      { id: 'mat_4', name: '亲属关系证明', type: 'other', count: 1, isRequired: true, hasProvided: true },
    ];

    if (caseInfo.caseType === 'notary') {
      baseMaterials.push({
        id: 'mat_5',
        name: '继承权公证书',
        type: 'notarial_cert',
        count: 1,
        isRequired: true,
        hasProvided: true,
      });
    } else {
      baseMaterials.push({
        id: 'mat_5',
        name: '调解协议书',
        type: 'mediation_agreement',
        count: 1,
        isRequired: true,
        hasProvided: true,
      });
    }

    const heirs = store.getHeirsByCaseId(caseId);
    const hasRenounced = heirs.some((h) => h.isRenounced);
    if (hasRenounced) {
      baseMaterials.push({
        id: 'mat_6',
        name: '放弃继承声明书',
        type: 'renounce_declaration',
        count: heirs.filter((h) => h.isRenounced).length,
        isRequired: false,
        hasProvided: true,
      });
    }

    return baseMaterials;
  }

  createTransfer(caseId: string, handler: string): TransferPackage {
    const caseInfo = store.getCaseById(caseId);
    if (!caseInfo) throw new Error('案件不存在');

    const transferNo = `YD${new Date().getFullYear()}${String(store.getTransfers().length + 1).padStart(3, '0')}`;
    const materialCatalog = this.generateMaterialCatalog(caseId);

    const transfer = store.addTransfer({
      caseId,
      transferNo,
      materialCatalog,
      transferredBy: handler,
      transferredAt: new Date().toISOString(),
      status: 'pending',
    });

    store.updateCase(caseId, { status: 'transferring' });

    return transfer;
  }

  sendTransfer(transferId: string): TransferPackage | null {
    const transfer = store.updateTransfer(transferId, { status: 'sent' });
    if (transfer) {
      store.updateCase(transfer.caseId, { status: 'transferred' });
    }
    return transfer;
  }
}

class AcceptanceService {
  getAcceptances(): AcceptanceRecord[] {
    return store.getAcceptances();
  }

  getAcceptanceByCaseId(caseId: string): AcceptanceRecord | null {
    return store.getAcceptanceByCaseId(caseId) || null;
  }

  createAcceptance(data: {
    caseId: string;
    transferId: string;
    acceptanceNo: string;
    acceptedBy: string;
  }): AcceptanceRecord {
    const acceptance = store.addAcceptance({
      ...data,
      acceptedAt: new Date().toISOString(),
      status: 'accepted',
    });

    store.updateCase(data.caseId, { status: 'accepted' });

    const transfer = store.getTransferById(data.transferId);
    if (transfer) {
      store.updateTransfer(transfer.id, { status: 'received' });
    }

    return acceptance;
  }

  addCorrectionOpinion(acceptanceId: string, opinions: Omit<CorrectionOpinion, 'id'>[]): AcceptanceRecord | null {
    const acceptance = store.getAcceptances().find(a => a.id === acceptanceId);
    if (!acceptance) return null;

    const correctionOpinions = opinions.map((o, i) => ({
      ...o,
      id: `corr_${acceptanceId}_${i}`,
    }));

    const updated = store.updateAcceptance(acceptanceId, {
      status: 'correction',
      correctionOpinions,
    });

    if (updated) {
      store.updateCase(acceptance.caseId, { status: 'correction' });
    }

    return updated;
  }

  confirmSupplement(acceptanceId: string, opinionIds: string[]): AcceptanceRecord | null {
    const acceptance = store.getAcceptances().find(a => a.id === acceptanceId);
    if (!acceptance || !acceptance.correctionOpinions) return null;

    const updatedOpinions = acceptance.correctionOpinions.map((o) =>
      opinionIds.includes(o.id)
        ? { ...o, isSupplied: true, suppliedAt: new Date().toISOString() }
        : o
    );

    const allSupplied = updatedOpinions.every((o) => o.isSupplied);
    const status = allSupplied ? 'accepted' : 'correction';

    const updated = store.updateAcceptance(acceptanceId, {
      status,
      correctionOpinions: updatedOpinions,
    });

    if (updated && allSupplied) {
      store.updateCase(acceptance.caseId, { status: 'accepted' });
    }

    return updated;
  }
}

class StatisticsService {
  getSummary(): StatisticsSummary {
    return store.getStatisticsSummary();
  }

  getMonthlyStats(): MonthlyStats[] {
    return store.getMonthlyStats();
  }

  getOverdueCases(): CaseInfo[] {
    return store.getOverdueCases();
  }
}

export const caseService = new CaseService();
export const transferService = new TransferService();
export const acceptanceService = new AcceptanceService();
export const statisticsService = new StatisticsService();
