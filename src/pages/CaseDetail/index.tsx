import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Home,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/services/api';
import { useCaseStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import type { CaseInfo, Heir, Attachment, AttachmentType } from '@/types';
import { ATTACHMENT_TYPE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateCase } = useCaseStore();
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'heirs' | 'attachments'>('heirs');
  const [loading, setLoading] = useState(true);
  const [showHeirModal, setShowHeirModal] = useState(false);
  const [editingHeir, setEditingHeir] = useState<Heir | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [heirForm, setHeirForm] = useState({
    name: '',
    idCard: '',
    relationship: '',
    phone: '',
    shareRatio: '',
    isRenounced: false,
    remark: '',
  });

  useEffect(() => {
    if (id) {
      loadCaseData();
    }
  }, [id]);

  const loadCaseData = async () => {
    setLoading(true);
    try {
      const [caseRes, heirsRes, attRes] = await Promise.all([
        api.cases.get(id!),
        api.cases.getHeirs(id!),
        api.cases.getAttachments(id!),
      ]);
      setCaseInfo(caseRes.data as CaseInfo);
      setHeirs(heirsRes.data as Heir[]);
      setAttachments(attRes.data as Attachment[]);
    } catch (error) {
      console.error('加载案件详情失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHeir = () => {
    setEditingHeir(null);
    setHeirForm({
      name: '',
      idCard: '',
      relationship: '',
      phone: '',
      shareRatio: '',
      isRenounced: false,
      remark: '',
    });
    setShowHeirModal(true);
  };

  const handleEditHeir = (heir: Heir) => {
    setEditingHeir(heir);
    setHeirForm({
      name: heir.name,
      idCard: heir.idCard,
      relationship: heir.relationship,
      phone: heir.phone,
      shareRatio: heir.shareRatio,
      isRenounced: heir.isRenounced,
      remark: heir.remark || '',
    });
    setShowHeirModal(true);
  };

  const handleSaveHeir = async () => {
    try {
      if (editingHeir) {
        await api.cases.updateHeir(editingHeir.id, heirForm);
      } else {
        await api.cases.addHeir(id!, {
          ...heirForm,
          order: heirs.length + 1,
        });
      }
      setShowHeirModal(false);
      loadCaseData();
    } catch (error) {
      console.error('保存继承人失败', error);
    }
  };

  const handleDeleteHeir = async (heirId: string) => {
    if (confirm('确定要删除该继承人吗？')) {
      try {
        await api.cases.deleteHeir(heirId);
        loadCaseData();
      } catch (error) {
        console.error('删除继承人失败', error);
      }
    }
  };

  const handleVerify = async () => {
    if (confirm('确认完成关系核对？')) {
      try {
        const updated = await api.cases.updateStatus(id!, 'verified');
        updateCase(updated.data as CaseInfo);
        setCaseInfo(updated.data as CaseInfo);
      } catch (error) {
        console.error('状态更新失败', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">加载中...</div>
      </div>
    );
  }

  if (!caseInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">案件不存在</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/cases')}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">{caseInfo.deceasedName} 继承案</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {caseInfo.caseNo} · {caseInfo.source}
          </p>
        </div>
        <StatusBadge status={caseInfo.status} />
        {caseInfo.status === 'pending' && (
          <button
            onClick={handleVerify}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Check size={16} />
            完成核对
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-primary-600" />
              被继承人信息
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">姓名</span>
                <span className="text-slate-700 font-medium">{caseInfo.deceasedName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">身份证号</span>
                <span className="text-slate-700">{caseInfo.deceasedIdCard}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">死亡日期</span>
                <span className="text-slate-700">{caseInfo.deceasedDate}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Home size={18} className="text-primary-600" />
              房产信息
            </h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-slate-500">坐落地址</span>
                <p className="text-slate-700 mt-1">{caseInfo.propertyAddress}</p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">建筑面积</span>
                <span className="text-slate-700">{caseInfo.propertyArea} ㎡</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary-600" />
              案件信息
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">案件类型</span>
                <span className="text-slate-700">
                  {caseInfo.caseType === 'notary' ? '公证继承' : '诉调确认'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">申请日期</span>
                <span className="text-slate-700">{caseInfo.applyDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">经办人</span>
                <span className="text-slate-700">{caseInfo.handler}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">经办机构</span>
                <span className="text-slate-700">{caseInfo.handlerOrg}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('heirs')}
                className={cn(
                  'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'heirs'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                )}
              >
                继承人名单
                <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  {heirs.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('attachments')}
                className={cn(
                  'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'attachments'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                )}
              >
                材料附件
                <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  {attachments.length}
                </span>
              </button>
              <button
                onClick={() => navigate(`/cases/${id}/dispute`)}
                className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 ml-auto flex items-center gap-1"
              >
                <AlertCircle size={14} />
                争议处理
              </button>
            </div>

            {activeTab === 'heirs' && (
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800">继承人与份额说明</h3>
                  <button
                    onClick={handleAddHeir}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Plus size={14} />
                    添加继承人
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">序号</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">姓名</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">与被继承人关系</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">身份证号</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">继承份额</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">放弃继承</th>
                        <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {heirs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">
                            暂无继承人信息
                          </td>
                        </tr>
                      ) : (
                        heirs.map((heir, index) => (
                          <tr key={heir.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-500">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-700">{heir.name}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{heir.relationship}</td>
                            <td className="px-4 py-3 text-sm text-slate-600 font-mono">{heir.idCard}</td>
                            <td className="px-4 py-3 text-sm text-slate-700 font-medium">{heir.shareRatio}</td>
                            <td className="px-4 py-3">
                              {heir.isRenounced ? (
                                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">已放弃</span>
                              ) : (
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">继承</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleEditHeir(heir)}
                                  className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteHeir(heir.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {heirs.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-700 flex items-start gap-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      份额合计应等于100%，请确认继承人名单与份额分配准确无误后再完成核对。
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attachments' && (
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800">材料附件</h3>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Upload size={14} />
                    上传材料
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {attachments.length === 0 ? (
                    <div className="col-span-2 py-8 text-center text-slate-400 text-sm">
                      暂无材料附件
                    </div>
                  ) : (
                    attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                          <FileText size={20} className="text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{att.name}</p>
                          <p className="text-xs text-slate-400">
                            {ATTACHMENT_TYPE_LABELS[att.type]} · {(att.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button className="p-1.5 text-slate-400 hover:text-primary-600 rounded transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showHeirModal}
        onClose={() => setShowHeirModal(false)}
        title={editingHeir ? '编辑继承人' : '添加继承人'}
        footer={
          <>
            <button
              onClick={() => setShowHeirModal(false)}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={handleSaveHeir}
              className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              保存
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
              <input
                type="text"
                value={heirForm.name}
                onChange={(e) => setHeirForm({ ...heirForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                placeholder="请输入姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">与被继承人关系</label>
              <input
                type="text"
                value={heirForm.relationship}
                onChange={(e) => setHeirForm({ ...heirForm, relationship: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                placeholder="如：儿子、女儿、配偶"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">身份证号</label>
              <input
                type="text"
                value={heirForm.idCard}
                onChange={(e) => setHeirForm({ ...heirForm, idCard: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                placeholder="请输入身份证号"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">联系电话</label>
              <input
                type="text"
                value={heirForm.phone}
                onChange={(e) => setHeirForm({ ...heirForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                placeholder="请输入联系电话"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">继承份额</label>
              <input
                type="text"
                value={heirForm.shareRatio}
                onChange={(e) => setHeirForm({ ...heirForm, shareRatio: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                placeholder="如：50%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">放弃继承</label>
              <div className="flex items-center h-[38px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={heirForm.isRenounced}
                    onChange={(e) => setHeirForm({ ...heirForm, isRenounced: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-600">声明放弃继承</span>
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
            <textarea
              value={heirForm.remark}
              onChange={(e) => setHeirForm({ ...heirForm, remark: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
              placeholder="请输入备注信息"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="上传材料"
        footer={
          <>
            <button
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              上传
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">材料类型</label>
            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500">
              {Object.entries(ATTACHMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">选择文件</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
              <Upload size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-600">点击或拖拽文件到此处上传</p>
              <p className="text-xs text-slate-400 mt-1">支持 PDF、JPG、PNG 格式，单个文件不超过 10MB</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
