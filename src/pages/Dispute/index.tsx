import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  MessageSquare,
  X,
} from 'lucide-react';
import { api } from '@/services/api';
import { useCaseStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import type { CaseInfo, DisputeRecord, DisputeType } from '@/types';
import { DISPUTE_TYPE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

export default function Dispute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateCase } = useCaseStore();
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDispute, setNewDispute] = useState({
    type: 'heir_dispute' as DisputeType,
    description: '',
    isSuspended: false,
    suspendReason: '',
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [caseRes, disputeRes] = await Promise.all([
        api.cases.get(id!),
        api.cases.getDisputes(id!),
      ]);
      setCaseInfo(caseRes.data as CaseInfo);
      setDisputes(disputeRes.data as DisputeRecord[]);
    } catch (error) {
      console.error('加载数据失败', error);
    }
  };

  const handleAddDispute = async () => {
    try {
      await api.cases.addDispute(id!, {
        ...newDispute,
        status: 'pending',
        handler: '当前用户',
      });
      setShowAddModal(false);
      setNewDispute({
        type: 'heir_dispute',
        description: '',
        isSuspended: false,
        suspendReason: '',
      });
      loadData();

      if (caseInfo && caseInfo.status !== 'disputed') {
        const updated = await api.cases.updateStatus(id!, 'disputed');
        updateCase(updated.data as CaseInfo);
        setCaseInfo(updated.data as CaseInfo);
      }
    } catch (error) {
      console.error('添加争议失败', error);
    }
  };

  const handleUpdateStatus = async (disputeId: string, status: 'processing' | 'resolved') => {
    try {
      await api.cases.updateDispute(disputeId, { status });
      loadData();

      if (status === 'resolved') {
        const allResolved = disputes.every(
          (d) => d.id === disputeId || d.status === 'resolved'
        );
        if (allResolved && caseInfo?.status === 'disputed') {
          const updated = await api.cases.updateStatus(id!, 'verified');
          updateCase(updated.data as CaseInfo);
          setCaseInfo(updated.data as CaseInfo);
        }
      }
    } catch (error) {
      console.error('更新争议状态失败', error);
    }
  };

  const handleToggleSuspend = async (disputeId: string, isSuspended: boolean, suspendReason?: string) => {
    try {
      await api.cases.updateDispute(disputeId, { isSuspended, suspendReason });
      loadData();
    } catch (error) {
      console.error('更新暂缓状态失败', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'processing':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'resolved':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Clock size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/cases/${id}`)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">争议标注</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {caseInfo?.deceasedName} 继承案 · {caseInfo?.caseNo}
          </p>
        </div>
        {caseInfo && <StatusBadge status={caseInfo.status} />}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          新增争议
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Clock size={18} />
            <span className="text-sm font-medium">待处理</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {disputes.filter((d) => d.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <MessageSquare size={18} />
            <span className="text-sm font-medium">处理中</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {disputes.filter((d) => d.status === 'processing').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">已解决</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {disputes.filter((d) => d.status === 'resolved').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning-500" />
            争议记录
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {disputes.length === 0 ? (
            <div className="py-12 text-center">
              <AlertTriangle size={48} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400">暂无争议记录</p>
              <p className="text-sm text-slate-300 mt-1">如存在争议情形，请点击上方"新增争议"按钮登记</p>
            </div>
          ) : (
            disputes.map((dispute, index) => (
              <div key={dispute.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      dispute.status === 'resolved' ? 'bg-green-100' : 'bg-yellow-100'
                    )}>
                      <span className="text-sm font-medium text-slate-700">{index + 1}</span>
                    </div>
                    {index < disputes.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 mt-2" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">
                            {DISPUTE_TYPE_LABELS[dispute.type]}
                          </span>
                          {getStatusIcon(dispute.status)}
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded',
                            dispute.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            dispute.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          )}>
                            {dispute.status === 'pending' ? '待处理' :
                             dispute.status === 'processing' ? '处理中' : '已解决'}
                          </span>
                          {dispute.isSuspended && (
                            <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 flex items-center gap-1">
                              <PauseCircle size={12} />
                              暂缓
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          登记时间：{dispute.createdAt} · 处理人：{dispute.handler}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {dispute.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(dispute.id, 'processing')}
                            className="text-xs px-3 py-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            <PlayCircle size={12} />
                            开始处理
                          </button>
                        )}
                        {dispute.status === 'processing' && (
                          <button
                            onClick={() => handleUpdateStatus(dispute.id, 'resolved')}
                            className="text-xs px-3 py-1 text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle size={12} />
                            标记解决
                          </button>
                        )}
                        {!dispute.isSuspended ? (
                          <button
                            onClick={() => handleToggleSuspend(dispute.id, true, '需补充材料')}
                            className="text-xs px-3 py-1 text-orange-600 bg-orange-50 rounded hover:bg-orange-100 transition-colors flex items-center gap-1"
                          >
                            <PauseCircle size={12} />
                            暂缓
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleSuspend(dispute.id, false)}
                            className="text-xs px-3 py-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            <PlayCircle size={12} />
                            恢复
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">{dispute.description}</p>
                    </div>

                    {dispute.isSuspended && dispute.suspendReason && (
                      <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs text-orange-600 font-medium mb-1">暂缓原因</p>
                        <p className="text-sm text-orange-700">{dispute.suspendReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新增争议记录"
        footer={
          <>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={handleAddDispute}
              className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              确认添加
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">争议类型</label>
            <select
              value={newDispute.type}
              onChange={(e) => setNewDispute({ ...newDispute, type: e.target.value as DisputeType })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            >
              {Object.entries(DISPUTE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">争议描述</label>
            <textarea
              value={newDispute.description}
              onChange={(e) => setNewDispute({ ...newDispute, description: e.target.value })}
              rows={4}
              placeholder="请详细描述争议情况..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newDispute.isSuspended}
                onChange={(e) => setNewDispute({ ...newDispute, isSuspended: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600">标记为暂缓</span>
            </label>
          </div>

          {newDispute.isSuspended && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">暂缓原因</label>
              <textarea
                value={newDispute.suspendReason}
                onChange={(e) => setNewDispute({ ...newDispute, suspendReason: e.target.value })}
                rows={2}
                placeholder="请说明暂缓原因..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
