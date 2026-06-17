import type {
  CaseInfo,
  Heir,
  Attachment,
  DisputeRecord,
  TransferPackage,
  AcceptanceRecord,
  MaterialItem,
} from '../../shared';

class MemoryStore {
  private cases: CaseInfo[] = [];
  private heirs: Heir[] = [];
  private attachments: Attachment[] = [];
  private disputes: DisputeRecord[] = [];
  private transfers: TransferPackage[] = [];
  private acceptances: AcceptanceRecord[] = [];
  private nextId = 1;

  constructor() {
    this.seedMockData();
  }

  private generateId(prefix: string): string {
    return `${prefix}_${this.nextId++}`;
  }

  private seedMockData() {
    const now = new Date();
    const daysAgo = (days: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      return d.toISOString();
    };

    this.cases = [
      {
        id: 'case_1',
        caseNo: 'GZJ2025001',
        caseType: 'notary',
        source: '县公证处',
        status: 'verified',
        deceasedName: '张三',
        deceasedIdCard: '320101195001011234',
        deceasedDate: '2025-01-15',
        propertyAddress: '县城关镇人民中路88号1栋302室',
        propertyArea: 120.5,
        applyDate: '2025-02-10',
        handler: '李公证员',
        handlerOrg: '县公证处',
        createdAt: daysAgo(15),
        updatedAt: daysAgo(10),
      },
      {
        id: 'case_2',
        caseNo: 'GZJ2025002',
        caseType: 'notary',
        source: '县公证处',
        status: 'transferring',
        deceasedName: '王五',
        deceasedIdCard: '320101194505055678',
        deceasedDate: '2025-02-20',
        propertyAddress: '县城南新区幸福路15号5栋101室',
        propertyArea: 88.0,
        applyDate: '2025-03-01',
        handler: '赵公证员',
        handlerOrg: '县公证处',
        createdAt: daysAgo(8),
        updatedAt: daysAgo(3),
      },
      {
        id: 'case_3',
        caseNo: 'SDQ2025001',
        caseType: 'mediation',
        source: '县人民调解委员会',
        status: 'disputed',
        deceasedName: '陈六',
        deceasedIdCard: '320101195512129012',
        deceasedDate: '2025-01-08',
        propertyAddress: '县东城区建设路22号2栋405室',
        propertyArea: 95.8,
        applyDate: '2025-02-01',
        handler: '王调解员',
        handlerOrg: '县人民调解委员会',
        isOverdue: true,
        createdAt: daysAgo(30),
        updatedAt: daysAgo(5),
      },
      {
        id: 'case_4',
        caseNo: 'GZJ2025003',
        caseType: 'notary',
        source: '县公证处',
        status: 'transferred',
        deceasedName: '刘七',
        deceasedIdCard: '320101194808083456',
        deceasedDate: '2025-02-28',
        propertyAddress: '县西城区永安街5号附1号',
        propertyArea: 110.2,
        applyDate: '2025-03-10',
        handler: '李公证员',
        handlerOrg: '县公证处',
        createdAt: daysAgo(5),
        updatedAt: daysAgo(1),
      },
      {
        id: 'case_5',
        caseNo: 'GZJ2025004',
        caseType: 'notary',
        source: '县公证处',
        status: 'accepted',
        deceasedName: '孙八',
        deceasedIdCard: '320101195203037890',
        deceasedDate: '2025-01-20',
        propertyAddress: '县城关镇解放大道120号3栋203室',
        propertyArea: 78.5,
        applyDate: '2025-02-15',
        handler: '张公证员',
        handlerOrg: '县公证处',
        createdAt: daysAgo(20),
        updatedAt: daysAgo(6),
      },
      {
        id: 'case_6',
        caseNo: 'SDQ2025002',
        caseType: 'mediation',
        source: '镇人民调解室',
        status: 'pending',
        deceasedName: '周九',
        deceasedIdCard: '320101196006062345',
        deceasedDate: '2025-03-05',
        propertyAddress: '镇文化街18号',
        propertyArea: 135.0,
        applyDate: '2025-03-15',
        handler: '陈调解员',
        handlerOrg: '镇人民调解室',
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      {
        id: 'case_7',
        caseNo: 'GZJ2025005',
        caseType: 'notary',
        source: '县公证处',
        status: 'completed',
        deceasedName: '吴十',
        deceasedIdCard: '320101193511116789',
        deceasedDate: '2025-01-10',
        propertyAddress: '县城北环路25号1栋602室',
        propertyArea: 65.0,
        applyDate: '2025-02-01',
        handler: '王公证员',
        handlerOrg: '县公证处',
        createdAt: daysAgo(40),
        updatedAt: daysAgo(12),
      },
      {
        id: 'case_8',
        caseNo: 'GZJ2025006',
        caseType: 'notary',
        source: '县公证处',
        status: 'correction',
        deceasedName: '郑十一',
        deceasedIdCard: '320101195009090123',
        deceasedDate: '2025-02-10',
        propertyAddress: '县开发区科技路8号',
        propertyArea: 150.0,
        applyDate: '2025-02-28',
        handler: '李公证员',
        handlerOrg: '县公证处',
        createdAt: daysAgo(12),
        updatedAt: daysAgo(4),
      },
    ];

    this.nextId = 10;

    this.heirs = [
      {
        id: 'heir_1',
        caseId: 'case_1',
        name: '张小明',
        idCard: '320101197501011234',
        relationship: '儿子',
        phone: '13800138001',
        shareRatio: '50%',
        isRenounced: false,
        order: 1,
      },
      {
        id: 'heir_2',
        caseId: 'case_1',
        name: '张小红',
        idCard: '320101197802025678',
        relationship: '女儿',
        phone: '13900139002',
        shareRatio: '50%',
        isRenounced: false,
        order: 2,
      },
      {
        id: 'heir_3',
        caseId: 'case_2',
        name: '王大强',
        idCard: '320101197003039012',
        relationship: '儿子',
        phone: '13700137003',
        shareRatio: '100%',
        isRenounced: false,
        order: 1,
      },
      {
        id: 'heir_4',
        caseId: 'case_3',
        name: '陈建国',
        idCard: '320101197504043456',
        relationship: '长子',
        phone: '13600136004',
        shareRatio: '40%',
        isRenounced: false,
        order: 1,
      },
      {
        id: 'heir_5',
        caseId: 'case_3',
        name: '陈建华',
        idCard: '320101197805057890',
        relationship: '次子',
        phone: '13500135005',
        shareRatio: '40%',
        isRenounced: false,
        order: 2,
      },
      {
        id: 'heir_6',
        caseId: 'case_3',
        name: '陈秀英',
        idCard: '320101198206062345',
        relationship: '女儿',
        phone: '13400134006',
        shareRatio: '20%',
        isRenounced: true,
        order: 3,
      },
      {
        id: 'heir_7',
        caseId: 'case_4',
        name: '刘军',
        idCard: '320101197207076789',
        relationship: '儿子',
        phone: '13300133007',
        shareRatio: '70%',
        isRenounced: false,
        order: 1,
      },
      {
        id: 'heir_8',
        caseId: 'case_4',
        name: '刘芳',
        idCard: '320101197508080123',
        relationship: '女儿',
        phone: '13200132008',
        shareRatio: '30%',
        isRenounced: false,
        order: 2,
      },
      {
        id: 'heir_9',
        caseId: 'case_5',
        name: '孙伟',
        idCard: '320101198009094567',
        relationship: '孙子',
        phone: '13100131009',
        shareRatio: '100%',
        isRenounced: false,
        order: 1,
      },
    ];

    this.attachments = [
      {
        id: 'att_1',
        caseId: 'case_1',
        type: 'death_cert',
        name: '死亡证明.pdf',
        url: '/files/death_cert_1.pdf',
        size: 245760,
        uploadedBy: '李公证员',
        uploadedAt: daysAgo(14),
      },
      {
        id: 'att_2',
        caseId: 'case_1',
        type: 'notarial_cert',
        name: '继承权公证书.pdf',
        url: '/files/notarial_1.pdf',
        size: 512000,
        uploadedBy: '李公证员',
        uploadedAt: daysAgo(10),
      },
      {
        id: 'att_3',
        caseId: 'case_1',
        type: 'property_cert',
        name: '不动产权证.pdf',
        url: '/files/property_1.pdf',
        size: 389120,
        uploadedBy: '李公证员',
        uploadedAt: daysAgo(13),
      },
      {
        id: 'att_4',
        caseId: 'case_2',
        type: 'death_cert',
        name: '死亡医学证明.pdf',
        url: '/files/death_cert_2.pdf',
        size: 266240,
        uploadedBy: '赵公证员',
        uploadedAt: daysAgo(7),
      },
      {
        id: 'att_5',
        caseId: 'case_3',
        type: 'death_cert',
        name: '死亡证明.pdf',
        url: '/files/death_cert_3.pdf',
        size: 233472,
        uploadedBy: '王调解员',
        uploadedAt: daysAgo(25),
      },
      {
        id: 'att_6',
        caseId: 'case_3',
        type: 'renounce_declaration',
        name: '放弃继承声明书.pdf',
        url: '/files/renounce_3.pdf',
        size: 194560,
        uploadedBy: '王调解员',
        uploadedAt: daysAgo(20),
      },
    ];

    this.disputes = [
      {
        id: 'dispute_1',
        caseId: 'case_3',
        type: 'share_dispute',
        description: '陈建国与陈建华对房产份额分配存在异议，双方均主张应多分',
        status: 'processing',
        isSuspended: false,
        handler: '王调解员',
        createdAt: daysAgo(18),
        updatedAt: daysAgo(5),
      },
      {
        id: 'dispute_2',
        caseId: 'case_3',
        type: 'will_dispute',
        description: '陈建华称存在口头遗嘱，但无书面证据',
        status: 'pending',
        isSuspended: true,
        suspendReason: '需补充遗嘱相关证据材料',
        handler: '王调解员',
        createdAt: daysAgo(10),
        updatedAt: daysAgo(7),
      },
    ];

    const defaultMaterials: MaterialItem[] = [
      { id: 'mat_1', name: '死亡证明', type: 'death_cert', count: 1, isRequired: true, hasProvided: true },
      { id: 'mat_2', name: '身份证明（所有继承人）', type: 'id_card', count: 2, isRequired: true, hasProvided: true },
      { id: 'mat_3', name: '不动产权证书', type: 'property_cert', count: 1, isRequired: true, hasProvided: true },
      { id: 'mat_4', name: '继承权公证书', type: 'notarial_cert', count: 1, isRequired: true, hasProvided: true },
      { id: 'mat_5', name: '放弃继承声明', type: 'renounce_declaration', count: 0, isRequired: false, hasProvided: false },
    ];

    this.transfers = [
      {
        id: 'transfer_1',
        caseId: 'case_2',
        transferNo: 'YD2025001',
        materialCatalog: JSON.parse(JSON.stringify(defaultMaterials)),
        transferredBy: '赵公证员',
        transferredAt: daysAgo(1),
        status: 'pending',
      },
      {
        id: 'transfer_2',
        caseId: 'case_4',
        transferNo: 'YD2025002',
        materialCatalog: JSON.parse(JSON.stringify(defaultMaterials)).map((m: MaterialItem) => 
          m.id === 'mat_4' ? { ...m, name: '调解协议书', type: 'mediation_agreement' } : m
        ),
        transferredBy: '王调解员',
        transferredAt: daysAgo(2),
        status: 'sent',
      },
      {
        id: 'transfer_3',
        caseId: 'case_5',
        transferNo: 'YD2025003',
        materialCatalog: JSON.parse(JSON.stringify(defaultMaterials)),
        transferredBy: '张公证员',
        transferredAt: daysAgo(8),
        status: 'received',
      },
    ];

    this.acceptances = [
      {
        id: 'accept_1',
        caseId: 'case_5',
        transferId: 'transfer_3',
        acceptanceNo: 'BDCDJ20250001',
        acceptedBy: '登记员小李',
        acceptedAt: daysAgo(6),
        status: 'accepted',
      },
      {
        id: 'accept_2',
        caseId: 'case_8',
        transferId: 'transfer_4',
        acceptanceNo: 'BDCDJ20250002',
        acceptedBy: '登记员小王',
        acceptedAt: daysAgo(5),
        status: 'correction',
        correctionOpinions: [
          {
            id: 'corr_1',
            itemName: '死亡证明',
            opinion: '死亡证明上身份证号码与户口簿不一致，需补充派出所证明',
            isSupplied: false,
          },
          {
            id: 'corr_2',
            itemName: '亲属关系证明',
            opinion: '缺少被继承人父母的死亡情况说明',
            isSupplied: false,
          },
        ],
      },
    ];
  }

  getCases(): CaseInfo[] {
    return [...this.cases];
  }

  getCaseById(id: string): CaseInfo | undefined {
    return this.cases.find((c) => c.id === id);
  }

  addCase(caseData: Omit<CaseInfo, 'id' | 'createdAt' | 'updatedAt'>): CaseInfo {
    const newCase: CaseInfo = {
      ...caseData,
      id: this.generateId('case'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.cases.unshift(newCase);
    return newCase;
  }

  updateCase(id: string, updates: Partial<CaseInfo>): CaseInfo | undefined {
    const index = this.cases.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    this.cases[index] = {
      ...this.cases[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.cases[index];
  }

  findDuplicateCases(deceasedIdCard: string, excludeId?: string): CaseInfo[] {
    return this.cases.filter(
      (c) => c.deceasedIdCard === deceasedIdCard && c.id !== excludeId
    );
  }

  getHeirsByCaseId(caseId: string): Heir[] {
    return this.heirs.filter((h) => h.caseId === caseId).sort((a, b) => a.order - b.order);
  }

  addHeir(heirData: Omit<Heir, 'id'>): Heir {
    const newHeir: Heir = {
      ...heirData,
      id: this.generateId('heir'),
    };
    this.heirs.push(newHeir);
    return newHeir;
  }

  updateHeir(id: string, updates: Partial<Heir>): Heir | undefined {
    const index = this.heirs.findIndex((h) => h.id === id);
    if (index === -1) return undefined;
    this.heirs[index] = { ...this.heirs[index], ...updates };
    return this.heirs[index];
  }

  deleteHeir(id: string): boolean {
    const index = this.heirs.findIndex((h) => h.id === id);
    if (index === -1) return false;
    this.heirs.splice(index, 1);
    return true;
  }

  getAttachmentsByCaseId(caseId: string): Attachment[] {
    return this.attachments.filter((a) => a.caseId === caseId);
  }

  addAttachment(attData: Omit<Attachment, 'id'>): Attachment {
    const newAtt: Attachment = {
      ...attData,
      id: this.generateId('att'),
    };
    this.attachments.push(newAtt);
    return newAtt;
  }

  getDisputesByCaseId(caseId: string): DisputeRecord[] {
    return this.disputes.filter((d) => d.caseId === caseId);
  }

  addDispute(disputeData: Omit<DisputeRecord, 'id' | 'createdAt' | 'updatedAt'>): DisputeRecord {
    const newDispute: DisputeRecord = {
      ...disputeData,
      id: this.generateId('dispute'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.disputes.push(newDispute);
    return newDispute;
  }

  updateDispute(id: string, updates: Partial<DisputeRecord>): DisputeRecord | undefined {
    const index = this.disputes.findIndex((d) => d.id === id);
    if (index === -1) return undefined;
    this.disputes[index] = {
      ...this.disputes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.disputes[index];
  }

  getTransfers(): TransferPackage[] {
    return [...this.transfers];
  }

  getTransferById(id: string): TransferPackage | undefined {
    return this.transfers.find((t) => t.id === id);
  }

  getTransferByCaseId(caseId: string): TransferPackage | undefined {
    return this.transfers.find((t) => t.caseId === caseId);
  }

  addTransfer(transferData: Omit<TransferPackage, 'id'>): TransferPackage {
    const newTransfer: TransferPackage = {
      ...transferData,
      id: this.generateId('transfer'),
    };
    this.transfers.push(newTransfer);
    return newTransfer;
  }

  updateTransfer(id: string, updates: Partial<TransferPackage>): TransferPackage | undefined {
    const index = this.transfers.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    this.transfers[index] = { ...this.transfers[index], ...updates };
    return this.transfers[index];
  }

  getAcceptances(): AcceptanceRecord[] {
    return [...this.acceptances];
  }

  getAcceptanceByCaseId(caseId: string): AcceptanceRecord | undefined {
    return this.acceptances.find((a) => a.caseId === caseId);
  }

  addAcceptance(acceptData: Omit<AcceptanceRecord, 'id'>): AcceptanceRecord {
    const newAccept: AcceptanceRecord = {
      ...acceptData,
      id: this.generateId('accept'),
    };
    this.acceptances.push(newAccept);
    return newAccept;
  }

  updateAcceptance(id: string, updates: Partial<AcceptanceRecord>): AcceptanceRecord | undefined {
    const index = this.acceptances.findIndex((a) => a.id === id);
    if (index === -1) return undefined;
    this.acceptances[index] = { ...this.acceptances[index], ...updates };
    return this.acceptances[index];
  }

  getStatisticsSummary() {
    const total = this.cases.length;
    const pending = this.cases.filter((c) => c.status === 'pending').length;
    const inProgress = this.cases.filter(
      (c) => ['verified', 'disputed', 'transferring', 'transferred', 'accepted', 'correction'].includes(c.status)
    ).length;
    const completed = this.cases.filter((c) => c.status === 'completed').length;
    const notary = this.cases.filter((c) => c.caseType === 'notary').length;
    const mediation = this.cases.filter((c) => c.caseType === 'mediation').length;
    const overdue = this.cases.filter((c) => c.isOverdue).length;

    return {
      totalCases: total,
      pendingCases: pending,
      inProgressCases: inProgress,
      completedCases: completed,
      notaryCases: notary,
      mediationCases: mediation,
      overdueCases: overdue,
      avgProcessingDays: 12.5,
    };
  }

  getMonthlyStats() {
    return [
      { month: '2025-01', notaryCount: 12, mediationCount: 5, completedCount: 15 },
      { month: '2025-02', notaryCount: 18, mediationCount: 8, completedCount: 20 },
      { month: '2025-03', notaryCount: 15, mediationCount: 6, completedCount: 16 },
      { month: '2025-04', notaryCount: 22, mediationCount: 10, completedCount: 25 },
      { month: '2025-05', notaryCount: 20, mediationCount: 7, completedCount: 22 },
      { month: '2025-06', notaryCount: 25, mediationCount: 12, completedCount: 28 },
    ];
  }

  getOverdueCases(): CaseInfo[] {
    return this.cases.filter((c) => c.isOverdue);
  }

  searchCases(keyword: string): CaseInfo[] {
    const kw = keyword.toLowerCase();
    return this.cases.filter(
      (c) =>
        c.caseNo.toLowerCase().includes(kw) ||
        c.deceasedName.toLowerCase().includes(kw) ||
        c.deceasedIdCard.includes(kw) ||
        c.propertyAddress.toLowerCase().includes(kw)
    );
  }
}

export const store = new MemoryStore();
