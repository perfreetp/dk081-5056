import { useEffect, useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Scale,
  Gavel,
  ArrowRight,
  Bell,
  TrendingUp,
} from 'lucide-react';
import { useCaseStore } from '@/store';
import { api } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import type { CaseInfo, StatisticsSummary } from '@/types';

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  trend,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  color: string;
  trend?: string;
}) => (
  <div className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {trend && (
          <p className="text-xs text-success-600 mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { setStatistics, setLoading } = useCaseStore();
  const navigate = useNavigate();
  const [recentCases, setRecentCases] = useState<CaseInfo[]>([]);
  const [overdueCases, setOverdueCases] = useState<CaseInfo[]>([]);
  const [stats, setStats] = useState<StatisticsSummary | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsRes, casesRes, overdueRes] = await Promise.all([
          api.statistics.summary(),
          api.cases.list({ pageSize: 5 }),
          api.statistics.overdue(),
        ]);
        const summary = statsRes.data as unknown as StatisticsSummary;
        setStats(summary);
        setStatistics(summary);
        const casesData = casesRes.data as any;
        setRecentCases(casesData.data || []);
        setOverdueCases(overdueRes.data as CaseInfo[]);
      } catch (error) {
        console.error('加载数据失败', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setStatistics, setLoading]);

  const todoItems = [
    { id: 1, title: '核对张小明继承关系', type: '关系核对', priority: 'high' },
    { id: 2, title: '推送王五案件受理包', type: '正式移交', priority: 'high' },
    { id: 3, title: '处理郑十一补正通知', type: '补正回复', priority: 'medium' },
    { id: 4, title: '确认陈六争议处理', type: '争议标注', priority: 'low' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">工作台</h1>
          <p className="text-sm text-slate-500 mt-1">继承转移登记 · 跨部门联办协同平台</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Bell size={16} />
          <span>今日待办 8 项</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="案件总数"
          value={stats?.totalCases || 0}
          color="bg-primary-600"
          trend="本月 +12%"
        />
        <StatCard
          icon={Clock}
          label="办理中"
          value={stats?.inProgressCases || 0}
          color="bg-yellow-500"
        />
        <StatCard
          icon={CheckCircle}
          label="已完成"
          value={stats?.completedCases || 0}
          color="bg-success-600"
          trend="本月 +8%"
        />
        <StatCard
          icon={AlertTriangle}
          label="超期预警"
          value={stats?.overdueCases || 0}
          color="bg-danger-600"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">最新案件</h2>
            <button
              onClick={() => navigate('/cases')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              查看全部 <ArrowRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentCases.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/cases/${c.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                    <Scale size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{c.deceasedName}</p>
                    <p className="text-xs text-slate-500">{c.caseNo} · {c.source}</p>
                  </div>
                </div>
                <StatusBadge status={c.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">今日待办</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {todoItems.map((item) => (
              <div
                key={item.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.priority === 'high'
                        ? 'bg-red-500'
                        : item.priority === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <div>
                    <p className="text-sm text-slate-700">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.type}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">案件类型分布</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 flex items-center gap-2">
                  <Gavel size={14} className="text-primary-600" />
                  公证继承
                </span>
                <span className="font-medium text-slate-700">{stats?.notaryCases || 0} 件</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: stats && stats.totalCases > 0 ? `${(stats.notaryCases / stats.totalCases) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 flex items-center gap-2">
                  <Scale size={14} className="text-yellow-500" />
                  诉调确认
                </span>
                <span className="font-medium text-slate-700">{stats?.mediationCases || 0} 件</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all"
                  style={{ width: stats && stats.totalCases > 0 ? `${(stats.mediationCases / stats.totalCases) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-lg border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">超期预警</h2>
            <span className="text-xs text-danger-600 bg-danger-50 px-2 py-1 rounded">
              {overdueCases.length} 件超期
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {overdueCases.length > 0 ? (
              overdueCases.map((c) => (
                <div
                  key={c.id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-danger-50/50 cursor-pointer"
                  onClick={() => navigate(`/cases/${c.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={18} className="text-warning-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {c.deceasedName} 继承案
                      </p>
                      <p className="text-xs text-slate-500">{c.caseNo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-danger-600 font-medium">已超期 5 天</p>
                    <p className="text-xs text-slate-400">办理时限 30 天</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">
                暂无超期案件
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
