import { useState, useEffect } from 'react';
import {
  Gift, Star, Car, ShoppingBag, Coins,
  Search, Filter, Download, History,
  ArrowRight, CheckCircle, X, Gift as GiftIcon,
  Clock, Users, TrendingUp, Zap
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { api } from '../../services/api';
import type { Customer, GiftItem, PointsRecord } from '/shared/types';
import { cn } from '../../lib/utils';

export function PointsMall() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [records, setRecords] = useState<PointsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showExchange, setShowExchange] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customersData, giftsData, recordsData] = await Promise.all([
        api.getCustomers(),
        api.getGifts(),
        api.getPointsRecords(),
      ]);
      setCustomers(customersData);
      setGifts(giftsData);
      setRecords(recordsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGifts = gifts.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || g.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
  const totalCustomers = customers.length;
  const todayExchange = records.filter(r => r.type === 'exchange' &&
    new Date(r.createdAt).toDateString() === new Date().toDateString()).length;
  const totalValue = gifts.filter(g => g.stock > 0).reduce((sum, g) => sum + g.value, 0);

  const handleExchange = (gift: GiftItem) => {
    if (!selectedCustomer) return;
    setSelectedGift(gift);
    setShowExchange(true);
  };

  const confirmExchange = async () => {
    if (!selectedCustomer || !selectedGift) return;
    
    try {
      setActionLoading(selectedGift.id);
      await api.exchangePoints(selectedCustomer.id, selectedGift.id);
      fetchData();
      setShowExchange(false);
      setSelectedGift(null);
    } catch (error) {
      console.error('Exchange failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleParkingDiscount = async (customer: Customer, hours: number) => {
    const pointsNeeded = hours * 50;
    try {
      setActionLoading('parking');
      await api.deductParkingPoints(customer.id, pointsNeeded);
      fetchData();
    } catch (error) {
      console.error('Parking discount failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const categoryStats = [
    { name: '实物礼品', value: gifts.filter(g => g.category === 'physical').length, color: '#1e3a8a' },
    { name: '优惠券', value: gifts.filter(g => g.category === 'coupon').length, color: '#10b981' },
    { name: '停车券', value: gifts.filter(g => g.category === 'parking').length, color: '#d4af37' },
    { name: '服务', value: gifts.filter(g => g.category === 'service').length, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  const monthlyData = [
    { month: '1月', 获得积分: 125000, 消耗积分: 85000 },
    { month: '2月', 获得积分: 132000, 消耗积分: 92000 },
    { month: '3月', 获得积分: 145000, 消耗积分: 108000 },
    { month: '4月', 获得积分: 138000, 消耗积分: 98000 },
    { month: '5月', 获得积分: 162000, 消耗积分: 125000 },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical': return '🎁';
      case 'coupon': return '🎫';
      case 'parking': return '🚗';
      case 'service': return '💎';
      default: return '🎁';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      physical: '实物礼品',
      coupon: '优惠券',
      parking: '停车券',
      service: '服务',
    };
    return labels[category] || category;
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-3">
            <Gift className="w-8 h-8 text-gold-500" />
            积分管理系统
          </h1>
          <p className="text-gray-500">顾客消费积分自动累积，可在线抵扣停车费或兑换礼品</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm"
          >
            刷新
          </button>
          <button className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm">
            <Download className="w-4 h-4" />
            导出报表
          </button>
          <button className="btn-primary !px-4 !py-2 flex items-center gap-2 !text-sm">
            <Gift className="w-4 h-4" />
            新增礼品
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">积分会员</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {totalCustomers.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1">+128 本周新增</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">积分总额</p>
              <p className="text-2xl font-bold text-gold-600 mt-1">
                {formatPoints(totalPoints)}
              </p>
              <p className="text-sm text-green-600 mt-1">+12,580 今日新增</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">今日兑换</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {todayExchange} 次
              </p>
              <p className="text-sm text-gray-500 mt-1">消耗积分 8,520</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <GiftIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">礼品价值</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                ¥{totalValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">共 {gifts.length} 种礼品</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <div className="bg-gradient-to-r from-primary-600 to-gold-600 rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                👤
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                <p className="text-white/80">
                  {selectedCustomer.phone} | 会员等级：{selectedCustomer.level}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-2xl">{formatPoints(selectedCustomer.points)}</span>
                    <span className="text-white/70">积分</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleParkingDiscount(selectedCustomer, 1)}
                  disabled={selectedCustomer.points < 50 || actionLoading === 'parking'}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  🚗 抵扣1小时 (50分)
                </button>
                <button
                  onClick={() => handleParkingDiscount(selectedCustomer, 3)}
                  disabled={selectedCustomer.points < 150 || actionLoading === 'parking'}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  🚗 抵扣3小时 (150分)
                </button>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
              >
                切换会员
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="section-title mb-0">积分商城</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索礼品..."
                    className="input-field !py-2 !pl-9 !text-sm w-48"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="input-field !py-2 !text-sm w-auto"
                  >
                    <option value="all">全部分类</option>
                    <option value="physical">实物礼品</option>
                    <option value="coupon">优惠券</option>
                    <option value="parking">停车券</option>
                    <option value="service">服务</option>
                  </select>
                </div>
              </div>
            </div>

            {!selectedCustomer && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    请先选择一位会员，然后点击礼品进行积分兑换。
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <div key={i} className="skeleton h-48 w-full rounded-xl"></div>
                ))
              ) : filteredGifts.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <GiftIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无礼品</p>
                </div>
              ) : (
                filteredGifts.map(gift => (
                  <div
                    key={gift.id}
                    className={cn(
                      'group p-4 border-2 border-gray-200 rounded-xl hover:border-primary-400 hover:shadow-lg transition-all cursor-pointer',
                      gift.stock === 0 && 'opacity-50 cursor-not-allowed',
                      selectedCustomer && selectedCustomer.points < gift.points && 'opacity-70'
                    )}
                    onClick={() => gift.stock > 0 && selectedCustomer && handleExchange(gift)}
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-3 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">
                      {getCategoryIcon(gift.category)}
                    </div>
                    <h4 className="font-semibold text-gray-800 text-sm truncate">{gift.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{getCategoryLabel(gift.category)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-gold-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
                        {formatPoints(gift.points)}
                      </span>
                      <span className="text-xs text-gray-400">库存 {gift.stock}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">价值 ¥{gift.value}</p>
                    {selectedCustomer && selectedCustomer.points < gift.points && gift.stock > 0 && (
                      <p className="text-xs text-red-500 mt-1">积分不足</p>
                    )}
                    {gift.stock === 0 && (
                      <p className="text-xs text-gray-500 mt-1">已兑完</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="section-title">会员列表</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {customers.slice(0, 8).map(customer => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
                    selectedCustomer?.id === customer.id
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gold-600">{formatPoints(customer.points)}</p>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      customer.level === '钻石' ? 'bg-purple-100 text-purple-700' :
                      customer.level === '黄金' ? 'bg-gold-100 text-gold-700' :
                      customer.level === '白银' ? 'bg-gray-200 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    )}>
                      {customer.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">礼品分类</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    dataKey="value"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {categoryStats.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value} 种</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">积分月度趋势</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip formatter={(value: number) => [formatPoints(value), '']} />
                  <Legend />
                  <Bar dataKey="获得积分" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="消耗积分" fill="#d4af37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          积分兑换记录
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">时间</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">会员</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">类型</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">礼品/项目</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">积分</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.slice(0, 10).map(record => {
                const customer = customers.find(c => c.id === record.customerId);
                const gift = gifts.find(g => g.id === record.giftId);
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {new Date(record.createdAt).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">👤</span>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{customer?.name}</p>
                          <p className="text-xs text-gray-500">{customer?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'status-badge text-xs',
                        record.type === 'earn' ? 'bg-green-100 text-green-700' :
                        record.type === 'exchange' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      )}>
                        {record.type === 'earn' ? '获得' : record.type === 'exchange' ? '兑换' : '抵扣'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 text-sm">
                      {record.description || gift?.name || '-'}
                    </td>
                    <td className={cn(
                      'px-4 py-3 text-right font-semibold text-sm',
                      record.type === 'earn' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {record.type === 'earn' ? '+' : '-'}{formatPoints(record.points)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="status-badge bg-green-100 text-green-700 text-xs flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" />
                        已完成
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showExchange && selectedCustomer && selectedGift && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gold-100 flex items-center justify-center text-5xl mb-4">
                {getCategoryIcon(selectedGift.category)}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">确认兑换</h3>
              <p className="text-gray-600 mb-6">
                确定要用 <span className="font-bold text-gold-600">{formatPoints(selectedGift.points)} 积分</span> 兑换
                <span className="font-bold text-primary-600"> {selectedGift.name}</span> 吗？
              </p>
              <div className="p-4 bg-gray-50 rounded-xl space-y-2 mb-6 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">会员</span>
                  <span className="font-medium">{selectedCustomer.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">当前积分</span>
                  <span className="font-medium text-gold-600">{formatPoints(selectedCustomer.points)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">消耗积分</span>
                  <span className="font-medium text-red-600">-{formatPoints(selectedGift.points)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2">
                  <span className="text-gray-700">剩余积分</span>
                  <span className="text-primary-600">{formatPoints(selectedCustomer.points - selectedGift.points)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowExchange(false)}
                  className="btn-secondary flex-1 !py-3"
                >
                  取消
                </button>
                <button
                  onClick={confirmExchange}
                  disabled={actionLoading === selectedGift.id}
                  className="btn-primary flex-1 !py-3 flex items-center justify-center gap-2"
                >
                  {actionLoading === selectedGift.id ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <GiftIcon className="w-5 h-5" />
                  )}
                  确认兑换
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertCircle({ className }: { className?: string }) {
  return <div className={cn('w-5 h-5', className)}>⚠️</div>;
}
