import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  AlertTriangle,
  Send,
  FileCheck,
  BarChart3,
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '工作台', end: true },
  { to: '/cases', icon: FileText, label: '案件接入' },
  { to: '/transfer', icon: Send, label: '正式移交' },
  { to: '/acceptance', icon: FileCheck, label: '登记受理' },
  { to: '/search', icon: Search, label: '案件查询' },
  { to: '/statistics', icon: BarChart3, label: '统计分析' },
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={cn(
          'bg-primary-800 text-white transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-primary-700">
          {sidebarOpen && (
            <span className="font-bold text-lg whitespace-nowrap">继承转移联办</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-primary-700 transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary-700/50',
                  isActive && 'bg-primary-700 border-r-4 border-yellow-400'
                )
              }
            >
              <item.icon size={20} className="shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-primary-700 text-xs text-primary-200">
            <p>不动产登记 · 协同服务</p>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Users size={18} />
            <span className="text-sm">跨部门联办 · 继承转移登记</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <User size={16} />
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-700">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.org}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
