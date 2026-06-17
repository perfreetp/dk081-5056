import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Merge,
  Eye,
  FileText,
  Users,
  Crown,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { api } from '@/services/api';
import { useCaseStore } from '@/store';
import type { CaseInfo, CaseType, CaseStatus } from '@/types';
import { CASE_TYPE_LABELS, CASE_STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';

export default function CaseList() {
  const navigate = useNavigate();
  const { setCurrentCase } = useCaseStore();
  const [cases, setCases] = useState<CaseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<CaseType | ''>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseInfo | null>(null);
  const [duplicateCases, setDuplicateCases] = useState<CaseInfo[]>([]);
  const [mainCaseId, setMainCaseId] = useState<string>('');
  const [caseMap, setCaseMap] = useState<Record<string, CaseInfo>>({});

  const [formData, setFormData] = useState({
    caseNo: '',
    caseType: 'notary' as CaseType,
    source: '',
    deceasedName: '',
    deceasedIdCard: '',
    deceasedDate: '',
    propertyAddress: '',
    propertyArea: '',
    applyDate: '',
    handler: '',
    remark: '',
  });

  useEffect(() => {
    loadCases();
  }, [statusFilter, typeFilter]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (keyword) params.keyword = keyword;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.caseType = typeFilter;
      const res = await api.cases.list(params);
      const data = res.data as any;
      const list = data.data || [];
      setCases(list);
      const allRes = await api.cases.list({ pageSize: 200 });
      const allData = allRes.data as any;
      const allList = allData.data || [];
      const map: Record<string, CaseInfo> = {};
      allList.forEach((c: CaseInfo) => { map[c.id] = c; });
      setCaseMap(map);
    } catch (error) {
      console.error('加载案件失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCases();
  };

  const handleAddCase = async () => {
    try {
      await api.cases.create({
        ...formData,
        status: 'pending',
        propertyArea: parseFloat(formData.propertyArea) || 0,
        handlerOrg: formData.source || (formData.caseType === 'notary' ? '县公证处' : '调解组织'),
      });
      setShowAddModal(false);
      loadCases();
      setFormData({
        caseNo: '',
        caseType: 'notary',
        source: '',
        deceasedName: '',
        deceasedIdCard: '',
        deceasedDate: '',
        propertyAddress: '',
        propertyArea: '',
        applyDate: '',
        handler: '',
        remark: '',
      });
    } catch (error) {
      console.error('创建案件失败', error);
    }
  };

  const handleCheckDuplicates = async (caseItem: CaseInfo) => {
    setSelectedCase(caseItem);
    setMainCaseId(caseItem.id);
    try {
      const res = await api.cases.getDuplicates(caseItem.id);
      setDuplicateCases(res.data as CaseInfo[]);
      setShowMergeModal(true);
    } catch (error) {
      console.error('查询重复案件失败', error);
    }
  };

  const handleMergeCases = async () => {
    if (!mainCaseId) {
      alert('请选择保留的主案件');
      return;
    }
    const allCases = [selectedCase, ...duplicateCases].filter(Boolean) as CaseInfo[];
    const mergeCaseIds = allCases
      .filter((c) => c.id !== mainCaseId)
      .map((c) => c.id);
    if (mergeCaseIds.length === 0) {
      alert('没有需要归并的重复案件');
      return;
    }
    try {
      await api.cases.merge(mainCaseId, mergeCaseIds);
      setShowMergeModal(false);
      loadCases();
    } catch (error) {
      console.error('归并案件失败', error);
      alert('归并失败，请重试');
    }
  };

  const handleViewCase = (caseItem: CaseInfo) => {
    setCurrentCase(caseItem);
    navigate(`/cases/${caseItem.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">案件接入</h1>
          <p className="text-sm text-slate-500 mt-1">登记公证继承与诉调确认案件，归并重复申请</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          新增案件
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索案件编号、被继承人姓名、身份证号、房产地址..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CaseStatus | '')}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="">全部状态</option>
              {Object.entries(CASE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as CaseType | '')}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="">全部类型</option>
              {Object.entries(CASE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
          >
            查询
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">案件编号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">被继承人</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">房产地址</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">来源</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">申请日期</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">加载中...</td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">暂无案件数据</td>
                </tr>
              ) : (
                cases.map((c) => {
                  const mainCase = c.status === 'merged' && c.mergedInto ? caseMap[c.mergedInto] : null;
                  return (
                  <tr key={c.id} className={cn('hover:bg-slate-50 transition-colors', c.status === 'merged' && 'bg-slate-50')}>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-700">{c.caseNo}</span>
                      {mainCase && (
                        <a
                          onClick={(e) => { e.stopPropagation(); handleViewCase(mainCase); }}
                          className="block text-xs text-primary-600 mt-0.5 cursor-pointer hover:underline"
                        >
                          → 归并至 {mainCase.caseNo}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs px-2 py-1 rounded',
                        c.caseType === 'notary' ? 'bg-primary-50 text-primary-700' : 'bg-yellow-50 text-yellow-700'
                      )}>
                        {CASE_TYPE_LABELS[c.caseType]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                          <FileText size={14} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-700">{c.deceasedName}</p>
                          <p className="text-xs text-slate-400">{c.deceasedIdCard}</p>
                          {mainCase && (
                            <p className="text-xs text-slate-400 mt-0.5">主案：{mainCase.deceasedName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{c.propertyAddress}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.handlerOrg || c.source || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.applyDate}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewCase(mainCase || c)}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            mainCase
                              ? 'text-primary-500 hover:text-primary-700 hover:bg-primary-50'
                              : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'
                          )}
                          title={mainCase ? '查看主案件详情' : '查看详情'}
                        >
                          <Eye size={16} />
                        </button>
                        {c.status !== 'merged' && (
                          <button
                            onClick={() => handleCheckDuplicates(c)}
                            className="p-1.5 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                            title="归并核查"
                          >
                            <Merge size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">共 {cases.length} 条记录</span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 text-sm text-slate-500 border border-slate-200 rounded hover:bg-slate-50">
              上一页
            </button>
            <button className="px-3 py-1 text-sm text-white bg-primary-600 rounded">
              1
            </button>
            <button className="px-3 py-1 text-sm text-slate-500 border border-slate-200 rounded hover:bg-slate-50">
              下一页
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新增案件"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={handleAddCase}
              className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700"
            >
              确认添加
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">案件类型</label>
              <select
                value={formData.caseType}
                onChange={(e) => setFormData({ ...formData, caseType: e.target.value as CaseType })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="notary">公证继承</option>
                <option value="mediation">诉调确认</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">案件编号</label>
              <input
                type="text"
                value={formData.caseNo}
                onChange={(e) => setFormData({ ...formData, caseNo: e.target.value })}
                placeholder="请输入案件编号"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">被继承人姓名</label>
              <input
                type="text"
                value={formData.deceasedName}
                onChange={(e) => setFormData({ ...formData, deceasedName: e.target.value })}
                placeholder="请输入姓名"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">身份证号</label>
              <input
                type="text"
                value={formData.deceasedIdCard}
                onChange={(e) => setFormData({ ...formData, deceasedIdCard: e.target.value })}
                placeholder="请输入身份证号"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">死亡日期</label>
              <input
                type="date"
                value={formData.deceasedDate}
                onChange={(e) => setFormData({ ...formData, deceasedDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">申请日期</label>
              <input
                type="date"
                value={formData.applyDate}
                onChange={(e) => setFormData({ ...formData, applyDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">房产地址</label>
            <input
              type="text"
              value={formData.propertyAddress}
              onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
              placeholder="请输入房产地址"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">建筑面积（㎡）</label>
              <input
                type="number"
                value={formData.propertyArea}
                onChange={(e) => setFormData({ ...formData, propertyArea: e.target.value })}
                placeholder="请输入面积"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">来源机构</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="请输入来源机构"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">经办人</label>
            <input
              type="text"
              value={formData.handler}
              onChange={(e) => setFormData({ ...formData, handler: e.target.value })}
              placeholder="请输入经办人姓名"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="请输入备注信息"
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        title="重复申请核查"
        size="xl"
        footer={
          <>
            <button
              onClick={() => setShowMergeModal(false)}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={handleMergeCases}
              disabled={(() => {
                const all = [selectedCase, ...duplicateCases].filter(Boolean) as CaseInfo[];
                return all.filter((c) => c.id !== mainCaseId).length === 0;
              })()}
              className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认归并
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Users size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  同一被继承人申请核查
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  被继承人：<span className="font-medium">{selectedCase?.deceasedName}</span>
                  （身份证号：{selectedCase?.deceasedIdCard}）
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  共发现 {duplicateCases.length + 1} 条申请，请选择保留一条作为主案件，其余将标记为"已归并"。
                </p>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 w-10"></th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500">案件编号</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500">类型</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500">房产地址</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500">来源机构</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500">申请日期</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500">当前状态</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1">
                      <Crown size={12} className="text-amber-500" />
                      保留为主案件
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[selectedCase, ...duplicateCases].filter(Boolean).map((c) => (
                  <tr
                    key={c.id}
                    className={cn(
                      'transition-colors',
                      mainCaseId === c.id ? 'bg-primary-50/70' : 'hover:bg-slate-50'
                    )}
                  >
                    <td className="px-3 py-3 align-top">
                      {mainCaseId === c.id && (
                        <Crown size={16} className="text-amber-500" />
                      )}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="font-medium text-slate-800">{c.caseNo}</div>
                      <div className="text-xs text-slate-400 mt-0.5">经办人：{c.handler || '-'}</div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        c.caseType === 'notary' ? 'bg-primary-50 text-primary-700' : 'bg-yellow-50 text-yellow-700'
                      )}>
                        {CASE_TYPE_LABELS[c.caseType]}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top max-w-[200px]">
                      <div className="text-slate-600 text-xs leading-relaxed">{c.propertyAddress}</div>
                      <div className="text-xs text-slate-400 mt-0.5">面积 {c.propertyArea}㎡</div>
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-slate-600">
                      {c.handlerOrg || c.source || '-'}
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-slate-600">{c.applyDate}</td>
                    <td className="px-3 py-3 align-top">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="px-3 py-3 align-top">
                      <label className="flex items-center justify-center cursor-pointer h-full">
                        <input
                          type="radio"
                          name="mainCase"
                          checked={mainCaseId === c.id}
                          onChange={() => setMainCaseId(c.id)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(() => {
            const allCases = [selectedCase, ...duplicateCases].filter(Boolean) as CaseInfo[];
            const mergedCases = allCases.filter((c) => c.id !== mainCaseId);
            const mainCase = allCases.find((c) => c.id === mainCaseId);
            return mergedCases.length > 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800 font-medium">
                      归并确认
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      保留主案件：<span className="font-semibold">{mainCase?.caseNo}</span>（{mainCase?.handlerOrg || mainCase?.source}）
                    </p>
                    <p className="text-xs text-yellow-700 mt-0.5">
                      标记已归并：{mergedCases.map((c) => ` ${c.caseNo}`).join('、')}
                    </p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      </Modal>
    </div>
  );
}
