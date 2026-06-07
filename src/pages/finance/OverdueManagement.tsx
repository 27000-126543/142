import { useState, useEffect } from 'react';
import {
  AlertTriangle, Lock, Unlock, Calendar, DollarSign,
  Search, Filter, Download, Send, Clock, X, CheckCircle
} from 'lucide-react';
import { api } from '../../services/api';
import type { RentBill } from '/shared/types';
import { cn } from '../../lib/utils';

export function OverdueManagement() {
  const [overdueBills, setOverdueBills] = useState<RentBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [minOverdueDays, setMinOverdueDays] = useState('0');
  const [selectedBill, setSelectedBill] = useState<RentBill | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'lock' | 'applyFee' | 'sendNotice' | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchOverdueBills();
  }, []);

  const fetchOverdueBills = async () => {
    try {
      setLoading(true);
      const bills = await api.getBills('overdue', '2024-05');
      const filtered = bills.filter(b => b.overdueDays >= parseInt(minOverdueDays));
      setOverdueBills(filtered);
    } catch (error) {
      console.error('Failed to fetch overdue bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = overdueBills.filter(b =>
    b.shopName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLock = (bill: RentBill) => {
    setSelectedBill(bill);
    setConfirmAction('lock');
    setShowConfirm(true);
  };

  const handleApplyLateFee = (bill: RentBill) => {
    setSelectedBill(bill);
    setConfirmAction('applyFee');
    setShowConfirm(true);
  };

  const handleSendNotice = (bill: RentBill) => {
    setSelectedBill(bill);
    setConfirmAction('sendNotice');
    setShowConfirm(true);
  };

  const confirmActionExecute = async () => {
    if (!selectedBill || !confirmAction) return;

    try {
      setActionLoading(selectedBill.id);
      if (confirmAction === 'lock') {
        await api.lockBill(selectedBill.id);
      } else if (confirmAction === 'applyFee') {
        await api.applyLateFee(selectedBill.id);
      } else if (confirmAction === 'sendNotice') {
        await api.sendPaymentNotice(selectedBill.id);
      }
      fetchOverdueBills();
      setShowConfirm(false);
      setSelectedBill(null);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const totalOverdue = filteredBills.reduce((sum, b) => sum + b.totalAmount + b.lateFee, 0);
  const totalLateFee = filteredBills.reduce((sum, b) => sum + b.lateFee, 0);
  const over30Days = filteredBills.filter(b => b.overdueDays >= 30).length;
  const lockedShops = filteredBills.filter(b => b.accessLocked).length;

  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

  const getOverdueSeverity = (days: number) => {
    if (days >= 60) return { label: '严重逾期', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
    if (days >= 30) return { label: '重度逾期', color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' };
    if (days >= 15) return { label: '中度逾期', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
    return { label: '轻度逾期', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' };
  };

  const getConfirmText = () => {
    if (confirmAction === 'lock') return { title: '确认锁定门禁', desc: '锁定后该店铺将无法正常营业，请谨慎操作。' };
    if (confirmAction === 'applyFee') return { title: '确认收取滞纳金', desc: '将按照每日0.05%的利率计算并收取滞纳金。' };
    if (confirmAction === 'sendNotice') return { title: '确认发送催缴通知', desc: '将向商户发送短信和系统消息提醒缴费。' };
    return { title: '', desc: '' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            逾期租金管理
          </h1>
          <p className="text-gray-500">管理逾期租金账单，执行滞纳金收取和门禁锁定</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverdueBills}
            className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm"
          >
            刷新数据
          </button>
          <button className="btn-danger !px-4 !py-2 flex items-center gap-2 !text-sm">
            <Send className="w-4 h-4" />
            批量发送催缴
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">逾期账单总数</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {filteredBills.length} 笔
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">逾期总额</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {formatCurrency(totalOverdue)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">滞纳金总额</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {formatCurrency(totalLateFee)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">已锁定店铺</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {lockedShops} / {over30Days} 家
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800">重要提醒</h4>
            <p className="text-sm text-red-700 mt-1">
              根据《商户管理协议》，逾期超过30天的商户系统将自动加收滞纳金（每日0.05%），并有权锁定店铺门禁直至缴清所有费用。
              目前有 <span className="font-bold">{over30Days}</span> 家店铺逾期超过30天，请及时处理。
            </p>
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
            value={minOverdueDays}
            onChange={(e) => setMinOverdueDays(e.target.value)}
            className="input-field w-auto min-w-[180px]"
          >
            <option value="0">全部逾期</option>
            <option value="15">逾期15天以上</option>
            <option value="30">逾期30天以上</option>
            <option value="60">逾期60天以上</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="skeleton h-32 w-full rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="card text-center py-16">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 opacity-50" />
          <p className="text-gray-500 text-lg">太棒了！当前没有逾期账单</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBills.map(bill => {
            const severity = getOverdueSeverity(bill.overdueDays);
            return (
              <div
                key={bill.id}
                className={cn(
                  'card p-6 border-l-4',
                  severity.border,
                  bill.accessLocked && 'opacity-75'
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl">
                        🏢
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">{bill.shopName}</h4>
                        <p className="text-sm text-gray-500">账单编号：{bill.id} | 账期：{bill.billMonth}</p>
                      </div>
                      <span className={cn('status-badge', severity.bg, severity.color)}>
                        {severity.label}
                      </span>
                      {bill.accessLocked && (
                        <span className="status-badge bg-red-100 text-red-700 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          门禁已锁定
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">逾期天数</p>
                        <p className="font-bold text-lg text-red-600">{bill.overdueDays} 天</p>
                      </div>
                      <div>
                        <p className="text-gray-500">欠缴本金</p>
                        <p className="font-bold text-lg text-gray-800">{formatCurrency(bill.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">滞纳金</p>
                        <p className="font-bold text-lg text-orange-600">{formatCurrency(bill.lateFee)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">应缴总额</p>
                        <p className="font-bold text-xl text-red-600">{formatCurrency(bill.totalAmount + bill.lateFee)}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>截止日期：{bill.dueDate} | 滞纳金计算：每日 {(bill.totalAmount * 0.0005).toFixed(2)} 元</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-2">
                    <button
                      onClick={() => handleSendNotice(bill)}
                      disabled={actionLoading === bill.id}
                      className="btn-secondary !px-4 !py-2 !text-sm flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      发送催缴
                    </button>
                    {bill.overdueDays >= 30 && bill.lateFee === 0 && (
                      <button
                        onClick={() => handleApplyLateFee(bill)}
                        disabled={actionLoading === bill.id}
                        className="btn-primary !px-4 !py-2 !text-sm flex items-center justify-center gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        收滞纳金
                      </button>
                    )}
                    {bill.overdueDays >= 30 && !bill.accessLocked && (
                      <button
                        onClick={() => handleLock(bill)}
                        disabled={actionLoading === bill.id}
                        className="btn-danger !px-4 !py-2 !text-sm flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        锁定门禁
                      </button>
                    )}
                    {bill.accessLocked && (
                      <button
                        onClick={async () => {
                          try {
                            setActionLoading(bill.id);
                            await api.unlockBill(bill.id);
                            fetchOverdueBills();
                          } finally {
                            setActionLoading(null);
                          }
                        }}
                        disabled={actionLoading === bill.id}
                        className="btn-gold !px-4 !py-2 !text-sm flex items-center justify-center gap-2"
                      >
                        <Unlock className="w-4 h-4" />
                        解锁门禁
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showConfirm && selectedBill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">{getConfirmText().title}</h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">{getConfirmText().desc}</p>
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">店铺</span>
                  <span className="font-medium">{selectedBill.shopName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">逾期天数</span>
                  <span className="font-medium text-red-600">{selectedBill.overdueDays} 天</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">应缴总额</span>
                  <span className="font-medium text-red-600">{formatCurrency(selectedBill.totalAmount + selectedBill.lateFee)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary !px-5 !py-2.5"
              >
                取消
              </button>
              {confirmAction === 'lock' ? (
                <button
                  onClick={confirmActionExecute}
                  disabled={actionLoading === selectedBill.id}
                  className="btn-danger !px-5 !py-2.5 flex items-center gap-2"
                >
                  {actionLoading === selectedBill.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  确认锁定
                </button>
              ) : (
                <button
                  onClick={confirmActionExecute}
                  disabled={actionLoading === selectedBill.id}
                  className="btn-primary !px-5 !py-2.5 flex items-center gap-2"
                >
                  {actionLoading === selectedBill.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  确认执行
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
