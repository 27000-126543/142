import { useState, useEffect } from 'react';
import {
  TrendingUp, Trophy, BarChart3, ArrowUpRight,
  Search, Filter, Download, Calendar, DollarSign, Users
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts';
import { api } from '../../services/api';
import type { SalesRank } from '/shared/types';
import { cn } from '../../lib/utils';

export function SalesRanking() {
  const [salesRanks, setSalesRanks] = useState<SalesRank[]>([]);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'increment' | 'incrementRate'>('incrementRate');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  useEffect(() => {
    fetchData();
  }, [sortBy, selectedPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ranks, trend] = await Promise.all([
        api.getSalesRanking(sortBy),
        api.getSalesTrend(parseInt(selectedPeriod)),
      ]);
      setSalesRanks(ranks);
      setSalesTrend(trend);
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRanks = salesRanks.filter(r =>
    r.shopName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = filteredRanks.slice(0, 3);
  const totalIncrement = filteredRanks.reduce((sum, r) => sum + r.increment, 0);
  const avgIncrementRate = filteredRanks.length > 0
    ? (filteredRanks.reduce((sum, r) => sum + r.incrementRate, 0) / filteredRanks.length).toFixed(1)
    : '0';

  const pieData = filteredRanks.slice(0, 8).map((r, i) => ({
    name: r.shopName,
    value: r.increment,
    color: ['#1e3a8a', '#3b82f6', '#60a5fa', '#d4af37', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'][i % 8],
  }));

  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      return `¥${(value / 10000).toFixed(1)}万`;
    }
    return `¥${value.toLocaleString()}`;
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
    if (index === 1) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
    if (index === 2) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white';
    return 'bg-gray-100 text-gray-600';
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return index + 1;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">销售统计排行</h1>
          <p className="text-gray-500">活动结束后自动统计各店铺销售额增量，生成排行榜</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm">
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">活动销售总额</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {formatCurrency(salesRanks.reduce((sum, r) => sum + r.activitySales, 0))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">销售增量</p>
              <p className="text-2xl font-bold text-green-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-5 h-5" />
                {formatCurrency(totalIncrement)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">平均增长率</p>
              <p className="text-2xl font-bold text-gold-600 mt-1">
                +{avgIncrementRate}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">参与品牌</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {filteredRanks.length} 家
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 className="section-title mb-0">销售趋势</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-field !py-2 !text-sm w-auto"
              >
                <option value="7">近7天</option>
                <option value="14">近14天</option>
                <option value="30">近30天</option>
              </select>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrend}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [`¥${value.toLocaleString()}`, '销售额']}
              />
              <Area
                type="monotone"
                dataKey="totalSales"
                name="销售额"
                stroke="#1e3a8a"
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="section-title mb-0 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold-500" />
                销售额增量排行榜
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索品牌..."
                    className="input-field !py-2 !pl-9 !text-sm w-48"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="input-field !py-2 !text-sm w-auto"
                  >
                    <option value="incrementRate">按增长率</option>
                    <option value="increment">按增长额</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array(10).fill(0).map((_, i) => (
                  <div key={i} className="skeleton h-20 w-full rounded-lg"></div>
                ))
              ) : filteredRanks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无销售数据</p>
                </div>
              ) : (
                filteredRanks.map((rank, index) => (
                  <div
                    key={rank.shopId}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl transition-all',
                      index < 3 ? 'bg-gradient-to-r from-primary-50/80 to-transparent border border-primary-100' : 'bg-gray-50 hover:bg-gray-100'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0',
                      getRankStyle(index)
                    )}>
                      {getRankIcon(index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-800 truncate">{rank.shopName}</h4>
                        <span className={cn(
                          'flex items-center gap-1 font-semibold',
                          rank.incrementRate >= 50 ? 'text-green-600' : rank.incrementRate >= 30 ? 'text-primary-600' : 'text-gold-600'
                        )}>
                          <ArrowUpRight className="w-4 h-4" />
                          +{rank.incrementRate.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          活动销售额：<span className="text-gray-800 font-medium">{formatCurrency(rank.activitySales)}</span>
                        </span>
                        <span className="text-green-600 font-medium">
                          +{formatCurrency(rank.increment)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={cn(
                            'h-2 rounded-full transition-all duration-1000',
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                            index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800' :
                            'bg-gradient-to-r from-primary-500 to-primary-600'
                          )}
                          style={{ width: `${Math.min(100, (rank.increment / filteredRanks[0].increment) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="section-title">🏆 冠亚季军</h3>
            <div className="space-y-4">
              {top3.map((rank, index) => (
                <div
                  key={rank.shopId}
                  className={cn(
                    'p-4 rounded-xl text-center',
                    index === 0 ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200' :
                    index === 1 ? 'bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200' :
                    'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200'
                  )}
                >
                  <div className="text-4xl mb-2">{getRankIcon(index)}</div>
                  <p className="font-bold text-gray-800">{rank.shopName}</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    +{rank.incrementRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    增量 {formatCurrency(rank.increment)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">增量占比</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '增量']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <h3 className="font-semibold mb-4">📊 活动效果总结</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70">总销售增长</span>
                <span className="font-bold text-gold-400">{formatCurrency(totalIncrement)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">最高增长品牌</span>
                <span className="font-bold">{filteredRanks[0]?.shopName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">增长率超50%品牌</span>
                <span className="font-bold text-green-400">
                  {filteredRanks.filter(r => r.incrementRate >= 50).length} 家
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">平均客单价</span>
                <span className="font-bold">¥328</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
