import { useState } from 'react';
import {
  Search as SearchIcon,
  Filter,
  MapPin,
  Clock,
  ChevronRight,
  FileText,
  Building2,
  Users,
  Send,
  FileCheck,
  CheckCircle,
} from 'lucide-react';
import { api } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import type { CaseInfo } from '@/types';
import { CASE_TYPE_LABELS, CASE_STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';

const steps = [
  { key: 'pending', label: '案件接入', icon: FileText },
  { key: 'verified', label: '关系核对', icon: Users },
  { key: 'transferring', label: '待移交', icon: Clock },
  { key: 'transferred', label: '已移交', icon: Send },
  { key: 'accepted', label: '受理中', icon: FileCheck },
  { key: 'completed', label: '已完成', icon: CheckCircle },
];

export default function Search() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<CaseInfo[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseInfo | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    try {
      const res = await api.statistics.search(keyword);
      setResults(res.data as CaseInfo[]);
      setSearched(true);
      setSelectedCase(null);
    } catch (error) {
      console.error('搜索失败', error);
    }
  };

  const getStepIndex = (status: string) => {
    const idx = steps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">案件查询</h1>
        <p className="text-sm text-slate-500 mt-1">跨部门办理进展查询、案件追踪</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <div className="flex-1 relative">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="输入案件编号、被继承人姓名、身份证号或房产地址进行查询..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg text-base focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            查询
          </button>
        </form>

        <div className="flex items-center gap-2 mt-4">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs text-slate-500">热门搜索：</span>
          {['张三', 'GZJ2025001', '人民中路', '公证继承'].map((tag) => (
            <button
              key={tag}
              onClick={() => setKeyword(tag)}
              className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {searched && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-4 py-3 border-b border-slate-200">
                <p className="text-sm font-medium text-slate-700">
                  搜索结果 <span className="text-slate-400">({results.length})</span>
                </p>
              </div>
              <div className="divide-y divide-slate-100 max-h-[calc(100vh-320px)] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="py-12 text-center">
                    <SearchIcon size={40} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-sm text-slate-400">未找到相关案件</p>
                    <p className="text-xs text-slate-300 mt-1">请尝试其他关键词</p>
                  </div>
                ) : (
                  results.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={cn(
                        'p-4 cursor-pointer transition-colors',
                        selectedCase?.id === c.id
                          ? 'bg-primary-50 border-l-4 border-primary-500'
                          : 'hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{c.deceasedName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{c.caseNo}</p>
                        </div>
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                        <Building2 size={12} />
                        <span className="truncate">{c.propertyAddress}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="col-span-2">
            {selectedCase ? (
              <div className="bg-white rounded-lg border border-slate-200">
                <div className="px-5 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-800">{selectedCase.deceasedName} 继承案</h2>
                      <p className="text-sm text-slate-500 mt-0.5">{selectedCase.caseNo}</p>
                    </div>
                    <span className={cn(
                      'text-xs px-2.5 py-1 rounded-full',
                      selectedCase.caseType === 'notary'
                        ? 'bg-primary-50 text-primary-700'
                        : 'bg-yellow-50 text-yellow-700'
                    )}>
                      {CASE_TYPE_LABELS[selectedCase.caseType]}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-sm font-medium text-slate-700 mb-4">办理进度</h3>
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      {steps.map((step, index) => {
                        const isActive = index <= getStepIndex(selectedCase.status);
                        const isCurrent = steps[getStepIndex(selectedCase.status)]?.key === step.key;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.key} className="flex flex-col items-center relative z-10">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                                isActive
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-slate-100 text-slate-400',
                                isCurrent && 'ring-4 ring-primary-100'
                              )}
                            >
                              <StepIcon size={18} />
                            </div>
                            <p
                              className={cn(
                                'text-xs mt-2 font-medium',
                                isActive ? 'text-slate-700' : 'text-slate-400'
                              )}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <span className="text-xs text-primary-600 mt-1 bg-primary-50 px-1.5 py-0.5 rounded">
                                当前
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 -z-0">
                      <div
                        className="h-full bg-primary-500 transition-all"
                        style={{
                          width: `${(getStepIndex(selectedCase.status) / (steps.length - 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">被继承人</p>
                      <p className="text-sm font-medium text-slate-700">{selectedCase.deceasedName}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">身份证号</p>
                      <p className="text-sm font-mono text-slate-700">{selectedCase.deceasedIdCard}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">死亡日期</p>
                      <p className="text-sm text-slate-700">{selectedCase.deceasedDate}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">申请日期</p>
                      <p className="text-sm text-slate-700">{selectedCase.applyDate}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <MapPin size={12} />
                      房产地址
                    </p>
                    <p className="text-sm text-slate-700">{selectedCase.propertyAddress}</p>
                    <p className="text-xs text-slate-500 mt-1">建筑面积 {selectedCase.propertyArea} ㎡</p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">经办机构</p>
                      <p className="text-sm text-slate-700">{selectedCase.handlerOrg}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">经办人</p>
                      <p className="text-sm text-slate-700">{selectedCase.handler}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 border border-dashed border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">当前状态</p>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedCase.status} />
                      <span className="text-xs text-slate-400">
                        {CASE_STATUS_LABELS[selectedCase.status]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                  <button className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded hover:bg-white transition-colors">
                    查看详情
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">
                    追踪办理
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 h-full flex flex-col items-center justify-center py-16">
                <SearchIcon size={48} className="text-slate-200 mb-3" />
                <p className="text-slate-400">选择左侧案件查看详情</p>
                <p className="text-xs text-slate-300 mt-1">或输入关键词进行搜索</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!searched && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <SearchIcon size={56} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500">输入关键词查询案件办理进度</p>
          <p className="text-sm text-slate-400 mt-1">支持案件编号、姓名、身份证号、地址等多维度检索</p>
        </div>
      )}
    </div>
  );
}
