import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  FileText,
  CheckCircle,
  Clock,
  ChevronRight,
  Package,
  Eye,
  Download,
  X,
} from 'lucide-react';
import { api } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import type { TransferPackage, CaseInfo, MaterialItem } from '@/types';
import { CASE_TYPE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

export default function Transfer() {
  const navigate = useNavigate();
  const [pendingCases, setPendingCases] = useState<CaseInfo[]>([]);
  const [transfers, setTransfers] = useState<TransferPackage[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseInfo | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMaterials, setPreviewMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [casesRes, transfersRes] = await Promise.all([
        api.cases.list({ status: 'verified', pageSize: 20 }),
        api.transfers.pending(),
      ]);
      const casesData = casesRes.data as any;
      setPendingCases(casesData.data || []);
      setTransfers(transfersRes.data as TransferPackage[]);
    } catch (error) {
      console.error('加载数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCatalog = async (caseItem: CaseInfo) => {
    setSelectedCase(caseItem);
    try {
      const res = await api.transfers.generate(caseItem.id);
      setPreviewMaterials(res.data as MaterialItem[]);
      setShowPreview(true);
    } catch (error) {
      console.error('生成材料目录失败', error);
    }
  };

  const handleCreateTransfer = async () => {
    if (!selectedCase) return;
    try {
      await api.transfers.create(selectedCase.id, '当前用户');
      setShowPreview(false);
      loadData();
    } catch (error) {
      console.error('创建移交失败', error);
    }
  };

  const handleSendTransfer = async (transferId: string) => {
    if (confirm('确认推送至不动产登记机构？')) {
      try {
        await api.transfers.send(transferId);
        loadData();
      } catch (error) {
        console.error('推送失败', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">正式移交</h1>
          <p className="text-sm text-slate-500 mt-1">生成移交材料目录，推送标准化受理包至登记机构</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Clock size={18} />
            <span className="text-sm font-medium">待生成</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {pendingCases.filter((c) => c.status === 'verified').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Package size={18} />
            <span className="text-sm font-medium">待推送</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {transfers.filter((t) => t.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Send size={18} />
            <span className="text-sm font-medium">已推送</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {transfers.filter((t) => t.status === 'sent').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">已接收</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {transfers.filter((t) => t.status === 'received').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">待移交案件</h2>
            <span className="text-xs text-slate-500">已完成关系核对</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {pendingCases.filter((c) => c.status === 'verified').length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                暂无待移交案件
              </div>
            ) : (
              pendingCases
                .filter((c) => c.status === 'verified')
                .map((c) => (
                  <div key={c.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-700">{c.deceasedName} 继承案</p>
                        <p className="text-xs text-slate-500 mt-0.5">{c.caseNo}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded',
                            c.caseType === 'notary' ? 'bg-primary-50 text-primary-700' : 'bg-yellow-50 text-yellow-700'
                          )}>
                            {CASE_TYPE_LABELS[c.caseType]}
                          </span>
                          <span className="text-xs text-slate-400">{c.source}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleGenerateCatalog(c)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                        >
                          <FileText size={14} />
                          生成目录
                        </button>
                        <button
                          onClick={() => navigate(`/cases/${c.id}`)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                        >
                          <Eye size={14} />
                          查看详情
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">移交代办</h2>
            <span className="text-xs text-slate-500">待推送至登记机构</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {transfers.filter((t) => t.status === 'pending' || t.status === 'sent').length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                暂无待推送移交
              </div>
            ) : (
              transfers
                .filter((t) => t.status === 'pending' || t.status === 'sent')
                .map((t) => {
                  const caseItem = pendingCases.find((c) => c.id === t.caseId);
                  return (
                    <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-700">{t.transferNo}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {caseItem?.deceasedName || '未知'} · {caseItem?.caseNo || ''}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            共 {t.materialCatalog.length} 项材料
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <StatusBadge status={t.status} size="sm" />
                          {t.status === 'pending' && (
                            <button
                              onClick={() => handleSendTransfer(t.id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-success-600 text-white rounded hover:bg-success-700 transition-colors"
                            >
                              <Send size={14} />
                              推送
                            </button>
                          )}
                          <button className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700">
                            <Download size={12} />
                            下载受理包
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">办理流程示意</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            {[
              { title: '案件接入', icon: FileText, desc: '登记案件信息' },
              { title: '关系核对', icon: CheckCircle, desc: '确认继承人' },
              { title: '生成目录', icon: FileText, desc: '材料清单' },
              { title: '推送移交', icon: Send, desc: '标准化受理包' },
              { title: '登记受理', icon: CheckCircle, desc: '登记机构办理' },
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center mb-2',
                  index <= 2 ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'
                )}>
                  <step.icon size={22} />
                </div>
                <p className="text-sm font-medium text-slate-700">{step.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between -mt-10 px-12 mx-12">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 h-0.5',
                  i < 2 ? 'bg-primary-500' : 'bg-slate-200'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="移交材料目录预览"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={handleCreateTransfer}
              className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Package size={16} />
              生成受理包
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {selectedCase && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700">
                {selectedCase.deceasedName} 继承案
              </p>
              <p className="text-xs text-slate-500">{selectedCase.caseNo}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">材料清单</p>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">序号</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">材料名称</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">份数</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">是否必备</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">提供状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewMaterials.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-sm text-slate-500">{index + 1}</td>
                      <td className="px-3 py-2 text-sm text-slate-700">{item.name}</td>
                      <td className="px-3 py-2 text-sm text-slate-600">{item.count} 份</td>
                      <td className="px-3 py-2">
                        {item.isRequired ? (
                          <span className="text-xs text-red-600">是</span>
                        ) : (
                          <span className="text-xs text-slate-400">否</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {item.hasProvided ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle size={12} />
                            已提供
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <X size={12} />
                            未提供
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 flex items-start gap-2">
              <ChevronRight size={14} className="shrink-0 mt-0.5" />
              系统将自动生成标准化受理包，包含上述全部材料，推送至不动产登记机构。
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
