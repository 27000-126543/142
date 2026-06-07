import { useState } from 'react';
import {
  LayoutDashboard, Building2, Calendar, Wallet,
  Wrench, BarChart3, Users, Gift, FileText, Bell,
  ChevronLeft, ChevronRight, LogOut, Settings, Menu
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';
import type { UserRole } from '/shared/types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const roleNavItems: Record<UserRole, { icon: any; label: string; path: string }[]> = {
  merchant: [
    { icon: LayoutDashboard, label: '首页', path: '/dashboard' },
    { icon: Building2, label: '入驻申请', path: '/merchants/applications' },
    { icon: Building2, label: '铺位推荐', path: '/merchants/recommendations' },
    { icon: FileText, label: '合同管理', path: '/merchants/contracts' },
    { icon: Bell, label: '消息中心', path: '/system/messages' },
  ],
  operations: [
    { icon: LayoutDashboard, label: '首页', path: '/dashboard' },
    { icon: Calendar, label: '活动管理', path: '/operations/activities' },
    { icon: BarChart3, label: '销售统计', path: '/operations/sales' },
    { icon: Users, label: '客流监控', path: '/system/passenger' },
    { icon: Bell, label: '消息中心', path: '/system/messages' },
  ],
  finance: [
    { icon: LayoutDashboard, label: '首页', path: '/dashboard' },
    { icon: Wallet, label: '租金账单', path: '/finance/bills' },
    { icon: Wallet, label: '逾期管理', path: '/finance/overdue' },
    { icon: FileText, label: '运营报告', path: '/system/reports' },
    { icon: Bell, label: '消息中心', path: '/system/messages' },
  ],
  property: [
    { icon: LayoutDashboard, label: '首页', path: '/dashboard' },
    { icon: Wrench, label: '报修工单', path: '/property/tickets' },
    { icon: Wrench, label: '智能派单', path: '/property/dispatch' },
    { icon: Bell, label: '消息中心', path: '/system/messages' },
  ],
  executive: [
    { icon: LayoutDashboard, label: '首页', path: '/dashboard' },
    { icon: BarChart3, label: '热力图分析', path: '/executive/heatmap' },
    { icon: Settings, label: '租金调整', path: '/executive/adjustment' },
    { icon: FileText, label: '运营报告', path: '/system/reports' },
    { icon: Users, label: '客流监控', path: '/system/passenger' },
    { icon: Gift, label: '积分商城', path: '/system/points' },
    { icon: Bell, label: '消息中心', path: '/system/messages' },
  ],
};

const roleNames: Record<UserRole, string> = {
  merchant: '招商部',
  operations: '运营部',
  finance: '财务部',
  property: '物业部',
  executive: '总经理',
};

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, unreadCount } = useAppStore();

  const navItems = user ? roleNavItems[user.role] : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-gradient-to-b from-primary-800 to-primary-900 text-white transition-all duration-300 z-40 lg:hidden',
        collapsed ? 'w-20' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex flex-col h-full">
        <div className={cn(
          'flex items-center justify-between p-4 border-b border-white/10',
          collapsed && 'justify-center'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold">MallOS</h1>
                <p className="text-xs text-white/60">智慧运营平台</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden lg:block"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {!collapsed && user && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-gold-400"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.name}</p>
                <p className="text-xs text-white/60">{roleNames[user.role]}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3 scrollbar-hide">
          <div className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              const showBadge = item.path === '/system/messages' && unreadCount > 0;

              return (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {showBadge && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">退出登录</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
