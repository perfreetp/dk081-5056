import { useEffect, useState } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  AlertTriangle,
  Download,
  Calendar,
} from 'lucide-react';
import { api } from '@/services/api';
import type { StatisticsSummary, MonthlyStats, CaseInfo } from '@/types';
import { CASE_TYPE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

export default function Statistics() {
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [overdueCases, setOverdueCases] = useState<CaseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6m');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, monthlyRes, overdueRes] = await Promise.all([
        api.statistics.summary(),
        api.statistics.monthly(),
        api.statistics.overdue(),
      ]);
      setSummary(summaryRes.data as StatisticsSummary);
      setMonthlyStats(monthlyRes.data as MonthlyStats[]);
      setOverdueCases(overdueRes.data as CaseInfo[]);
    } catch (error) {
      console.error('加载统计数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const maxMonthlyValue = Math.max(...monthlyStats.flatMap((m) => [m.notaryCount, m.mediationCount, m.completedCount]), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">统计分析</h1>
          <p className="text-sm text-slate-500 mt-1">联办业务统计、超期预警、办理时限分析</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Calendar size={16} />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="1m">近1个月</option>
              <option value="3m">近3个月</option>
              <option value="6m">近6个月</option>
              <option value="1y">近1年</option>
            </select>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
            <Download size={16} />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm opacity-90">案件总数</span>
            <BarChart3 size={22} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">{summary?.totalCases || 0}</p>
          <p className="text-xs opacity-80 mt-1 flex items-center gap-1">
            <TrendingUp size={12} />
            本月 +12%
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm opacity-90">办理中</span>
            <Clock size={22} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">{summary?.inProgressCases || 0}</p>
          <p className="text-xs opacity-80 mt-1">
            平均办理时长 {summary?.avgProcessingDays || 0} 天
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm opacity-90">已完成</span>
            <PieChart size={22} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">{summary?.completedCases || 0}</p>
          <p className="text-xs opacity-80 mt-1">
            办结率 {summary ? ((summary.completedCases / summary.totalCases) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-lg p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm opacity-90">超期预警</span>
            <AlertTriangle size={22} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">{summary?.overdueCases || 0}</p>
          <p className="text-xs opacity-80 mt-1">
            需及时督办处理
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">月度办理趋势</h2>
            <p className="text-xs text-slate-500 mt-0.5">近6个月案件办理数量统计</p>
          </div>
          <div className="p-5">
            <div className="flex items-end justify-between h-56 gap-4">
              {monthlyStats.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-48">
                    <div
                      className="w-6 bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                      style={{ height: `${(m.notaryCount / maxMonthlyValue) * 100}%` }}
                      title={`公证继承: ${m.notaryCount}件`}
                    />
                    <div
                      className="w-6 bg-yellow-400 rounded-t transition-all hover:bg-yellow-500"
                      style={{ height: `${(m.mediationCount / maxMonthlyValue) * 100}%` }}
                      title={`诉调确认: ${m.mediationCount}件`}
                    />
                    <div
                      className="w-6 bg-green-500 rounded-t transition-all hover:bg-green-600"
                      style={{ height: `${(m.completedCount / maxMonthlyValue) * 100}%` }}
                      title={`已完成: ${m.completedCount}件`}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{m.month.slice(5)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary-500" />
                <span className="text-xs text-slate-600">公证继承</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-yellow-400" />
                <span className="text-xs text-slate-600">诉调确认</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className="text-xs text-slate-600">已完成</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">案件类型占比</h2>
            <p className="text-xs text-slate-500 mt-0.5">按案件来源分类统计</p>
          </div>
          <div className="p-5">
            <div className="relative w-40 h-40 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="20"
                />
                {summary && (
                  <>
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="20"
                      strokeDasharray={`${(summary.notaryCases / summary.totalCases) * 251.2} 251.2`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#facc15"
                      strokeWidth="20"
                      strokeDasharray={`${(summary.mediationCases / summary.totalCases) * 251.2} 251.2`}
                      strokeDashoffset={`${-(summary.notaryCases / summary.totalCases) * 251.2}`}
                    />
                  </>
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">{summary?.totalCases || 0}</span>
                <span className="text-xs text-slate-500">案件总数</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-500" />
                  <span className="text-sm text-slate-600">公证继承</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-slate-700">{summary?.notaryCases || 0} 件</span>
                  <span className="text-xs text-slate-400 ml-2">
                    {summary ? ((summary.notaryCases / summary.totalCases) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-sm text-slate-600">诉调确认</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-slate-700">{summary?.mediationCases || 0} 件</span>
                  <span className="text-xs text-slate-400 ml-2">
                    {summary ? ((summary.mediationCases / summary.totalCases) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">超期案件预警</h2>
            <p className="text-xs text-slate-500 mt-0.5">超过办理时限的案件，请及时督办处理</p>
          </div>
          <span className="text-sm text-danger-600 bg-danger-50 px-3 py-1 rounded-full font-medium">
            {overdueCases.length} 件超期
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">案件编号</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">被继承人</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">类型</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">当前状态</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">申请日期</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">经办机构</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">超期天数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overdueCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    暂无超期案件
                  </td>
                </tr>
              ) : (
                overdueCases.map((c) => (
                  <tr key={c.id} className="hover:bg-red-50/30">
                    <td className="px-5 py-3 text-sm font-medium text-slate-700">{c.caseNo}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{c.deceasedName}</td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        c.caseType === 'notary' ? 'bg-primary-50 text-primary-700' : 'bg-yellow-50 text-yellow-700'
                      )}>
                        {CASE_TYPE_LABELS[c.caseType]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">超期</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{c.applyDate}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{c.source}</td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-red-600">+5 天</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
