import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Users, Wallet, Building2, Wrench,
  Calendar, AlertTriangle, ArrowRight, DollarSign, ShoppingBag,
  Footprints, Percent
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';
import type { DashboardStats, Message } from '/shared/types';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { user, fetchUnreadMessages } = useAppStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [passengerData, setPassengerData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadMessages]);

  const fetchData = async () => {
    try {
      const [statsData, trendData, passengerData] = await Promise.all([
        api.getDashboardStats(),
        api.getSalesTrend(7),
        api.getPassengerRealtime(24),
      ]);
      setStats(statsData);
      setSalesTrend(trendData);
      setPassengerData(passengerData.slice(-12));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const passengerByHour = passengerData.map(d => ({
    hour: new Date(d.time).getHours() + ':00',
    客流: d.total,
  }));

  const floorData = stats ? [
    { name: 'L1', value: stats.todayPassenger * 0.22, color: '#1e3a8a' },
    { name: 'L2', value: stats.todayPassenger * 0.20, color: '#3b82f6' },
    { name: 'L3', value: stats.todayPassenger * 0.17, color: '#60a5fa' },
    { name: 'L4', value: stats.todayPassenger * 0.25, color: '#d4af37' },
    { name: 'L5', value: stats.todayPassenger * 0.10, color: '#94a3b8' },
    { name: 'B1', value: stats.todayPassenger * 0.06, color: '#cbd5e1' },
  ] : [];

  const rentData = stats ? [
    { name: '已收缴', value: stats.monthRentCollected, color: '#10b981' },
    { name: '待收缴', value: stats.monthRentTarget - stats.monthRentCollected, color: '#f59e0b' },
  ] : [];

  const statCards = stats ? [
    {
      title: '今日客流',
      value: stats.todayPassenger.toLocaleString(),
      change: ((stats.todayPassenger - stats.yesterdayPassenger) / stats.yesterdayPassenger * 100).toFixed(1),
      icon: Footprints,
      color: 'from-blue-500 to-blue-600',
      trend: stats.todayPassenger >= stats.yesterdayPassenger ? 'up' : 'down',
    },
    {
      title: '租金收缴率',
      value: stats.rentCollectionRate + '%',
      change: '2.3',
      icon: Percent,
      color: 'from-green-500 to-green-600',
      trend: 'up',
    },
    {
      title: '待审核申请',
      value: stats.pendingApplications,
      change: '+3',
      icon: Building2,
      color: 'from-gold-500 to-gold-600',
      trend: 'up',
    },
    {
      title: '待处理工单',
      value: stats.pendingTickets,
      change: '-2',
      icon: Wrench,
      color: 'from-purple-500 to-purple-600',
      trend: 'down',
    },
    {
      title: '进行中活动',
      value: stats.activeActivities,
      change: '0',
      icon: Calendar,
      color: 'from-pink-500 to-pink-600',
      trend: 'up',
    },
    {
      title: '逾期账单',
      value: stats.overdueBills,
      change: '+1',
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      trend: 'up',
    },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card h-32">
              <div className="skeleton h-4 w-24 mb-2"></div>
              <div className="skeleton h-8 w-32 mb-2"></div>
              <div className="skeleton h-3 w-20"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card h-80">
            <div className="skeleton h-full w-full"></div>
          </div>
          <div className="card h-80">
            <div className="skeleton h-full w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const getMessageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      application: 'bg-blue-100 text-blue-700',
      activity: 'bg-green-100 text-green-700',
      finance: 'bg-yellow-100 text-yellow-700',
      property: 'bg-purple-100 text-purple-700',
      warning: 'bg-red-100 text-red-700',
      report: 'bg-indigo-100 text-indigo-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-sm">欢迎回来，{user?.name}</p>
            <h2 className="text-2xl font-display font-bold mt-1">
              今日运营概览
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gold-400">
                ¥{stats?.monthRentCollected.toLocaleString()}
              </p>
              <p className="text-xs text-white/60">本月已收租金</p>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {stats?.todayPassenger.toLocaleString()}
              </p>
              <p className="text-xs text-white/60">今日客流</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="stat-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold text-dark-800 mt-1">{card.value}</p>
                </div>
                <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center', card.color)}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {card.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={cn('text-sm font-medium', card.trend === 'up' ? 'text-green-600' : 'text-red-600')}>
                  {card.trend === 'up' ? '+' : ''}{card.change}%
                </span>
                <span className="text-gray-400 text-xs">较昨日</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="section-title mb-0">销售趋势</h3>
              <p className="text-sm text-gray-500">近7天销售额与客流对比</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                <span className="text-sm text-gray-600">销售额</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold-500"></div>
                <span className="text-sm text-gray-600">客流</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="passengerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalSales"
                  name="销售额"
                  stroke="#1e3a8a"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="passengerFlow"
                  name="客流"
                  stroke="#d4af37"
                  strokeWidth={2}
                  fill="url(#passengerGradient)"
                  yAxisId={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">楼层客流分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={floorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {floorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {floorData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="section-title">租金收缴进度</h3>
          <div className="flex items-center justify-center h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                >
                  {rentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{stats?.rentCollectionRate}%</p>
            <p className="text-sm text-gray-500">收缴率</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">月度目标</span>
              <span className="font-semibold">¥{stats?.monthRentTarget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">已收缴</span>
              <span className="font-semibold text-green-600">¥{stats?.monthRentCollected.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${stats?.rentCollectionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">24小时客流趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={passengerByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="客流" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">待办事项</h3>
            <span className="text-sm text-primary-600 cursor-pointer hover:underline">查看全部</span>
          </div>
          <div className="space-y-3">
            {stats?.todoList.slice(0, 5).map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  item.priority === 'urgent' ? 'bg-red-500 animate-pulse' :
                  item.priority === 'high' ? 'bg-orange-500' :
                  'bg-primary-500'
                )}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary-600">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400">{item.type}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="section-title mb-0">最新消息</h3>
          <span className="text-sm text-primary-600 cursor-pointer hover:underline">查看全部</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.recentMessages.slice(0, 6).map((message: Message) => (
            <div
              key={message.id}
              className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <span className={cn('status-badge flex-shrink-0', getMessageTypeColor(message.type))}>
                  {message.type}
                </span>
                {!message.isRead && (
                  <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1"></span>
                )}
              </div>
              <h4 className="font-semibold text-gray-800 mt-2 line-clamp-1">{message.title}</h4>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{message.content}</p>
              <p className="text-xs text-gray-400 mt-3">
                {new Date(message.createdAt).toLocaleString('zh-CN')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
