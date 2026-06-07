import { useState, useEffect } from 'react';
import {
  Wallet, DollarSign, AlertTriangle, Lock, CheckCircle,
  Clock, Search, Filter, Download, Calendar, CreditCard,
  Unlock, FileText, Send, X
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { api } from '../../services/api';
import type { RentBill } from '/shared/types';
import { cn } from '../../lib/utils';

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  unpaid: { label: '待缴费', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Clock },
  paid: { label: '已缴费', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  overdue: { label: '已逾期', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: AlertTriangle },
  locked: { label: '已锁定', color: 'text-red-700', bgColor: 'bg-red-100', icon: Lock },
};

const rentTypeLabels: Record<string, string> = {
  fixed: '固定租金',
  percentage: '扣点模式',
};

export function RentBills() {
  const [bills, setBills] = useState<RentBill[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('2024-05');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState<RentBill | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter, monthFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsData, statsData] = await Promise.all([
        api.getBills(statusFilter, monthFilter),
        api.getFinanceStats(monthFilter),
      ]);
      setBills(billsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(b =>
    b.shopName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePay = async (bill: RentBill) => {
    try {
      setActionLoading(bill.id);
      await api.payBill(bill.id);
      fetchData();
      setShowDetail(false);
      setSelectedBill(null);
    } catch (error) {
      console.error('Failed to pay bill:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLock = async (bill: RentBill) => {
    try {
      setActionLoading(bill.id);
      await api.lockBill(bill.id);
      fetchData();
    } catch (error) {
      console.error('Failed to lock bill:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlock = async (bill: RentBill) => {
    try {
      setActionLoading(bill.id);
      await api.unlockBill(bill.id);
      fetchData();
    } catch (error) {
      console.error('Failed to unlock bill:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApplyLateFee = async (bill: RentBill) => {
    try {
      setActionLoading(bill.id);
      await api.applyLateFee(bill.id);
      fetchData();
    } catch (error) {
      console.error('Failed to apply late fee:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const pieData = stats ? [
    { name: '已收缴', value: stats.paidAmount, color: '#10b981' },
    { name: '待收缴', value: stats.unpaidAmount, color: '#f59e0b' },
  ] : [];

  const statusCounts = [
    { name: '已缴费', count: stats?.paidBills || 0, color: '#10b981' },
    { name: '待缴费', count: stats?.unpaidBills || 0, color: '#f59e0b' },
    { name: '已逾期', count: stats?.overdueCount || 0, color: '#f97316' },
    { name: '已锁定', count: stats?.lockedCount || 0, color: '#ef4444' },
  ];

  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

  const openDetail = (bill: RentBill) => {
    setSelectedBill(bill);
    setShowDetail(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">租金账单管理</h1>
          <p className="text-gray-500">每月自动计算租金账单，管理收缴和逾期处理</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm">
            <Download className="w-4 h-4" />
            导出账单
          </button>
          <button className="btn-primary !px-4 !py-2 flex items-center gap-2 !text-sm">
            <FileText className="w-4 h-4" />
            生成账单
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">本月应收</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(stats?.totalAmount || 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">已收缴</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(stats?.paidAmount || 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">收缴率</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {stats?.collectionRate || 0}%
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
              <p className="text-gray-500 text-sm">逾期账单</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {stats?.overdueCount || 0} 笔
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="section-title mb-0">租金收缴进度</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="month"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="input-field !py-2 !pl-9 !text-sm w-40"
                  />
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="card">
          <h3 className="section-title">收缴构成</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索店铺名称..."
            className="input-field pl-12"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto min-w-[150px]"
          >
            <option value="all">全部状态</option>
            <option value="unpaid">待缴费</option>
            <option value="paid">已缴费</option>
            <option value="overdue">已逾期</option>
            <option value="locked">已锁定</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="skeleton h-24 w-full rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">账单编号</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">店铺</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">账期</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">租金类型</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">应缴金额</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">滞纳金</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">状态</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无账单记录</p>
                    </td>
                  </tr>
                ) : (
                  filteredBills.map(bill => {
                    const config = statusConfig[bill.status];
                    const StatusIcon = config.icon;
                    return (
                      <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{bill.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-lg">
                              🏢
                            </div>
                            <p className="font-semibold text-gray-800">{bill.shopName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{bill.billMonth}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">
                            {rentTypeLabels[bill.rentType]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">{formatCurrency(bill.totalAmount)}</p>
                          {bill.rentType === 'percentage' && bill.percentageRent && (
                            <p className="text-xs text-gray-500">
                              基础: {formatCurrency(bill.baseRent)} | 扣点: {formatCurrency(bill.percentageRent)}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={bill.lateFee > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}>
                            {bill.lateFee > 0 ? formatCurrency(bill.lateFee) : '-'}
                          </span>
                          {bill.overdueDays > 0 && (
                            <p className="text-xs text-orange-500">逾期 {bill.overdueDays} 天</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('status-badge flex items-center gap-1', config.bgColor, config.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                          {bill.accessLocked && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              门禁已锁定
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetail(bill)}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="查看详情"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            {bill.status === 'unpaid' || bill.status === 'overdue' ? (
                              <button
                                onClick={() => handlePay(bill)}
                                disabled={actionLoading === bill.id}
                                className="btn-gold !px-3 !py-1.5 !text-sm flex items-center gap-1"
                              >
                                {actionLoading === bill.id ? (
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <CreditCard className="w-3 h-3" />
                                )}
                                缴费
                              </button>
                            ) : null}
                            {bill.status === 'overdue' && bill.overdueDays >= 30 && !bill.accessLocked && (
                              <button
                                onClick={() => handleLock(bill)}
                                disabled={actionLoading === bill.id}
                                className="btn-danger !px-3 !py-1.5 !text-sm flex items-center gap-1"
                              >
                                <Lock className="w-3 h-3" />
                                锁定
                              </button>
                            )}
                            {bill.status === 'locked' && (
                              <button
                                onClick={() => handleUnlock(bill)}
                                disabled={actionLoading === bill.id}
                                className="btn-secondary !px-3 !py-1.5 !text-sm flex items-center gap-1"
                              >
                                <Unlock className="w-3 h-3" />
                                解锁
                              </button>
                            )}
                            {bill.status === 'overdue' && bill.overdueDays >= 30 && bill.lateFee === 0 && (
                              <button
                                onClick={() => handleApplyLateFee(bill)}
                                disabled={actionLoading === bill.id}
                                className="btn-primary !px-3 !py-1.5 !text-sm flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                收滞纳金
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
        </div>
      )}

      {showDetail && selectedBill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">账单详情</h3>
                <p className="text-sm text-gray-500">账单编号：{selectedBill.id}</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">店铺名称</p>
                    <p className="font-semibold text-gray-800 text-lg">{selectedBill.shopName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">账期</p>
                    <p className="font-semibold text-gray-800">{selectedBill.billMonth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">租金类型</p>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                      {rentTypeLabels[selectedBill.rentType]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">缴费截止日期</p>
                    <p className="font-semibold text-gray-800">{selectedBill.dueDate}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-primary-50 to-gold-50 rounded-xl">
                    <p className="text-sm text-gray-500">应缴金额</p>
                    <p className="text-3xl font-bold text-primary-600 mt-1">
                      {formatCurrency(selectedBill.totalAmount)}
                    </p>
                  </div>
                  {selectedBill.rentType === 'percentage' && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-2">计算明细</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">基础租金</span>
                          <span className="font-medium">{formatCurrency(selectedBill.baseRent)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">月销售额</span>
                          <span className="font-medium">{formatCurrency(selectedBill.salesAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">扣点租金</span>
                          <span className="font-medium">{formatCurrency(selectedBill.percentageRent || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedBill.overdueDays > 0 && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-semibold">已逾期 {selectedBill.overdueDays} 天</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">滞纳金</span>
                          <span className="font-medium text-red-600">{formatCurrency(selectedBill.lateFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">门禁状态</span>
                          <span className={cn('font-medium', selectedBill.accessLocked ? 'text-red-600' : 'text-green-600')}>
                            {selectedBill.accessLocked ? '已锁定' : '正常'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDetail(false)}
                className="btn-secondary !px-5 !py-2.5"
              >
                关闭
              </button>
              <button
                onClick={() => {}}
                className="btn-secondary !px-5 !py-2.5 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                下载凭证
              </button>
              {(selectedBill.status === 'unpaid' || selectedBill.status === 'overdue') && (
                <button
                  onClick={() => handlePay(selectedBill)}
                  className="btn-gold !px-5 !py-2.5 flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  确认缴费
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
