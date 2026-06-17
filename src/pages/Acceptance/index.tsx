import { useEffect, useState } from 'react';
import {
  FileCheck,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { api } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import type { AcceptanceRecord, TransferPackage, CaseInfo, CorrectionOpinion } from '@/types';
import { cn } from '@/lib/utils';

export default function Acceptance() {
  const [acceptances, setAcceptances] = useState<AcceptanceRecord[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<TransferPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferPackage | null>(null);
  const [selectedAcceptance, setSelectedAcceptance] = useState<AcceptanceRecord | null>(null);
  const [acceptanceForm, setAcceptanceForm] = useState({
    acceptanceNo: '',
    acceptedBy: '',
  });
  const [correctionItems, setCorrectionItems] = useState<{ itemName: string; opinion: string }[]>([
    { itemName: '', opinion: '' },
  ]);
  const [tab, setTab] = useState<'pending' | 'processing' | 'completed'>('pending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transferRes, acceptRes] = await Promise.all([
        api.transfers.pending(),
        api.acceptances.list(),
      ]);
      setPendingTransfers(transferRes.data as TransferPackage[]);
      setAcceptances(acceptRes.data as AcceptanceRecord[]);
    } catch (error) {
      console.error('加载数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (transfer: TransferPackage) => {
    setSelectedTransfer(transfer);
    setAcceptanceForm({
      acceptanceNo: `BDCDJ${new Date().getFullYear()}${String(acceptances.length + 1).padStart(5, '0')}`,
      acceptedBy: '登记员',
    });
    setShowAcceptModal(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedTransfer) return;
    try {
      await api.acceptances.create({
        caseId: selectedTransfer.caseId,
        transferId: selectedTransfer.id,
        ...acceptanceForm,
      });
      setShowAcceptModal(false);
      loadData();
    } catch (error) {
      console.error('受理失败', error);
    }
  };

  const handleCorrection = (acceptance: AcceptanceRecord) => {
    setSelectedAcceptance(acceptance);
    setCorrectionItems([{ itemName: '', opinion: '' }]);
    setShowCorrectionModal(true);
  };

  const handleAddCorrectionItem = () => {
    setCorrectionItems([...correctionItems, { itemName: '', opinion: '' }]);
  };

  const handleRemoveCorrectionItem = (index: number) => {
    setCorrectionItems(correctionItems.filter((_, i) => i !== index));
  };

  const handleUpdateCorrectionItem = (index: number, field: 'itemName' | 'opinion', value: string) => {
    const newItems = [...correctionItems];
    newItems[index][field] = value;
    setCorrectionItems(newItems);
  };

  const handleSubmitCorrection = async () => {
    if (!selectedAcceptance) return;
    try {
      const opinions = correctionItems.filter((item) => item.itemName && item.opinion);
      await api.acceptances.addCorrection(selectedAcceptance.id, opinions);
      setShowCorrectionModal(false);
      loadData();
    } catch (error) {
      console.error('提交补正意见失败', error);
    }
  };

  const handleConfirmSupplement = async (acceptanceId: string, opinionIds: string[]) => {
    try {
      await api.acceptances.confirmSupplement(acceptanceId, opinionIds);
      loadData();
    } catch (error) {
      console.error('确认补充材料失败', error);
    }
  };

  const getFilteredAcceptances = () => {
    switch (tab) {
      case 'pending':
        return acceptances.filter((a) => a.status === 'correction');
      case 'processing':
        return acceptances.filter((a) => a.status === 'accepted');
      case 'completed':
        return acceptances.filter((a) => a.status === 'completed');
      default:
        return acceptances;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">登记受理</h1>
          <p className="text-sm text-slate-500 mt-1">受理登记、补正回传、状态同步</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Clock size={18} />
            <span className="text-sm font-medium">待受理</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {pendingTransfers.filter((t) => t.status === 'sent').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">需补正</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {acceptances.filter((a) => a.status === 'correction').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <FileCheck size={18} />
            <span className="text-sm font-medium">办理中</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {acceptances.filter((a) => a.status === 'accepted').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">已完成</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {acceptances.filter((a) => a.status === 'completed').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">待受理移交</h2>
          <p className="text-xs text-slate-500 mt-1">已推送至登记机构，等待受理的案件</p>
        </div>

        <div className="divide-y divide-slate-100">
          {pendingTransfers.filter((t) => t.status === 'sent').length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              暂无待受理移交
            </div>
          ) : (
            pendingTransfers
              .filter((t) => t.status === 'sent')
              .map((t) => (
                <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Send size={18} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">{t.transferNo}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          材料 {t.materialCatalog.length} 项 · 推送时间：{t.transferredAt}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-400">推送人：{t.transferredBy}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccept(t)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-success-600 text-white rounded hover:bg-success-700 transition-colors"
                      >
                        <FileCheck size={14} />
                        受理登记
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setTab('pending')}
            className={cn(
              'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === 'pending'
                ? 'text-orange-600 border-orange-500 bg-orange-50/50'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            )}
          >
            需补正
            <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
              {acceptances.filter((a) => a.status === 'correction').length}
            </span>
          </button>
          <button
            onClick={() => setTab('processing')}
            className={cn(
              'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === 'processing'
                ? 'text-blue-600 border-blue-500 bg-blue-50/50'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            )}
          >
            办理中
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
              {acceptances.filter((a) => a.status === 'accepted').length}
            </span>
          </button>
          <button
            onClick={() => setTab('completed')}
            className={cn(
              'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === 'completed'
                ? 'text-green-600 border-green-500 bg-green-50/50'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            )}
          >
            已完成
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
              {acceptances.filter((a) => a.status === 'completed').length}
            </span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {getFilteredAcceptances().length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              暂无数据
            </div>
          ) : (
            getFilteredAcceptances().map((a) => (
              <div key={a.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-700">{a.acceptanceNo}</p>
                      <StatusBadge status={a.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      受理人：{a.acceptedBy} · {a.acceptedAt}
                    </p>

                    {a.correctionOpinions && a.correctionOpinions.length > 0 && (
                      <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs font-medium text-orange-700 mb-2 flex items-center gap-1">
                          <AlertCircle size={12} />
                          补正意见 ({a.correctionOpinions.length} 项)
                        </p>
                        <ul className="space-y-1">
                          {a.correctionOpinions.map((op, idx) => (
                            <li key={op.id} className="text-xs text-orange-600 flex items-start gap-1.5">
                              <span>{idx + 1}.</span>
                              <div>
                                <span className="font-medium">{op.itemName}：</span>
                                {op.opinion}
                                {op.isSupplied ? (
                                  <span className="ml-2 text-green-600 flex items-center gap-0.5">
                                    <CheckCircle size={10} /> 已补正
                                  </span>
                                ) : (
                                  <span className="ml-2 text-orange-500">待补充</span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {a.status === 'accepted' && (
                      <button
                        onClick={() => handleCorrection(a)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-orange-600 bg-orange-50 rounded hover:bg-orange-100 transition-colors"
                      >
                        <MessageSquare size={12} />
                        补正通知
                      </button>
                    )}
                    {a.status === 'correction' && (
                      <button
                        onClick={() => {
                          const suppliedIds = a.correctionOpinions
                            ?.filter((o) => !o.isSupplied)
                            .map((o) => o.id) || [];
                          if (confirm('确认所有补正材料已补充完毕？')) {
                            handleConfirmSupplement(a.id, suppliedIds);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle size={12} />
                        确认补正
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="受理登记"
        footer={
          <>
            <button
              onClick={() => setShowAcceptModal(false)}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={handleConfirmAccept}
              className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              确认受理
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">{selectedTransfer?.transferNo}</p>
            <p className="text-xs text-blue-600 mt-0.5">
              共 {selectedTransfer?.materialCatalog.length} 项材料
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">受理编号</label>
              <input
                type="text"
                value={acceptanceForm.acceptanceNo}
                onChange={(e) => setAcceptanceForm({ ...acceptanceForm, acceptanceNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">受理人</label>
              <input
                type="text"
                value={acceptanceForm.acceptedBy}
                onChange={(e) => setAcceptanceForm({ ...acceptanceForm, acceptedBy: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">材料清单核对</p>
            <div className="border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto">
              {selectedTransfer?.materialCatalog.map((item) => (
                <div key={item.id} className="flex items-center gap-2 py-1.5">
                  {item.hasProvided ? (
                    <CheckCircle size={14} className="text-green-500" />
                  ) : (
                    <XCircle size={14} className="text-red-400" />
                  )}
                  <span className="text-sm text-slate-600">{item.name}</span>
                  <span className="text-xs text-slate-400">({item.count}份)</span>
                  {item.isRequired && (
                    <span className="text-xs text-red-500">*必备</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        title="补正通知"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowCorrectionModal(false)}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmitCorrection}
              className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Send size={14} />
              发送补正通知
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-700 flex items-center gap-2">
              <AlertCircle size={16} />
              补正通知将回传至前置机构（公证处/调解组织）
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-700">补正事项</p>
              <button
                onClick={handleAddCorrectionItem}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                + 添加
              </button>
            </div>

            <div className="space-y-3">
              {correctionItems.map((item, index) => (
                <div key={index} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">第 {index + 1} 项</span>
                    {correctionItems.length > 1 && (
                      <button
                        onClick={() => handleRemoveCorrectionItem(index)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="材料/事项名称"
                      value={item.itemName}
                      onChange={(e) => handleUpdateCorrectionItem(index, 'itemName', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                    <textarea
                      placeholder="补正意见说明"
                      value={item.opinion}
                      onChange={(e) => handleUpdateCorrectionItem(index, 'opinion', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
