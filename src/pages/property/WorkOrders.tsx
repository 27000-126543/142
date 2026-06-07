import { useState, useEffect } from 'react';
import {
  Wrench, Clock, CheckCircle, AlertCircle, Star,
  Search, Filter, Download, Phone, MapPin, User,
  Send, X, MessageSquare, ThumbsUp, ThumbsDown,
  QrCode, ScanFace
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { api } from '../../services/api';
import type { WorkTicket, RepairWorker } from '/shared/types';
import { cn } from '../../lib/utils';

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  pending: { label: '待派单', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Clock },
  dispatched: { label: '已派单', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Send },
  in_progress: { label: '维修中', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Wrench },
  completed: { label: '已完成', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  cancelled: { label: '已取消', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: X },
};

const faultTypeLabels: Record<string, string> = {
  electrical: '电气故障',
  plumbing: '水电故障',
  hvac: '空调故障',
  structure: '结构维修',
  cleaning: '清洁服务',
  other: '其他',
};

const faultTypeColors: Record<string, string> = {
  electrical: '#f59e0b',
  plumbing: '#3b82f6',
  hvac: '#8b5cf6',
  structure: '#10b981',
  cleaning: '#ec4899',
  other: '#6b7280',
};

export function WorkOrders() {
  const [tickets, setTickets] = useState<WorkTicket[]>([]);
  const [workers, setWorkers] = useState<RepairWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<WorkTicket | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showDispatch, setShowDispatch] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter, typeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsData, workersData] = await Promise.all([
        api.getTickets(statusFilter, typeFilter),
        api.getWorkers(),
      ]);
      
      const convertedWorkers = workersData.map(w => ({
        id: w.id,
        name: w.name,
        phone: w.phone,
        specialty: w.skill,
        status: w.status === 'available' ? 'online' : w.status === 'busy' ? 'busy' : 'offline',
        currentLocation: w.currentZoneName || '',
        distance: Math.floor(Math.random() * 500) + 50,
        rating: 4 + Math.random(),
        totalOrders: Math.floor(Math.random() * 200) + 50,
      } as RepairWorker));

      const convertedTickets = ticketsData.map(t => ({
        id: t.id,
        shopId: t.shopId,
        shopName: t.shopName,
        faultType: t.faultType,
        description: t.description,
        priority: t.priority === 'high' || t.priority === 'urgent' ? 'high' : 'normal',
        status: t.status === 'pending' ? 'pending' : t.status === 'assigned' ? 'dispatched' : t.status === 'in_progress' ? 'in_progress' : t.status === 'completed' ? 'completed' : 'cancelled',
        location: t.shopName,
        workerId: t.workerId,
        rating: t.rating,
        review: t.reviewComment,
        createdAt: t.createdAt,
        dispatchedAt: t.assignedAt,
        startedAt: null,
        completedAt: t.completedAt,
      } as WorkTicket));

      setTickets(convertedTickets);
      setWorkers(convertedWorkers);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t =>
    t.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDispatch = async (ticketId: string, workerId: string) => {
    try {
      setActionLoading(ticketId);
      await api.dispatchTicket(ticketId, workerId);
      fetchData();
      setShowDispatch(false);
    } catch (error) {
      console.error('Failed to dispatch:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAutoDispatch = async (ticketId: string) => {
    try {
      setActionLoading(ticketId);
      await api.autoDispatch(ticketId);
      fetchData();
    } catch (error) {
      console.error('Failed to auto dispatch:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const openDetail = (ticket: WorkTicket) => {
    setSelectedTicket(ticket);
    setShowDetail(true);
  };

  const handleShowQRCode = (ticket: WorkTicket) => {
    setSelectedTicket(ticket);
    setShowQRCode(true);
  };

  const handleOpenRating = (ticket: WorkTicket) => {
    setSelectedTicket(ticket);
    setRatingValue(5);
    setRatingComment('');
    setShowRating(true);
  };

  const handleSubmitRating = async () => {
    if (!selectedTicket) return;
    try {
      setActionLoading(selectedTicket.id);
      await api.rateTicket(selectedTicket.id, ratingValue, ratingComment);
      fetchData();
      setShowRating(false);
      setSelectedTicket(null);
      setRatingValue(5);
      setRatingComment('');
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const statusCounts = [
    { name: '待派单', count: tickets.filter(t => t.status === 'pending').length, color: '#f59e0b' },
    { name: '已派单', count: tickets.filter(t => t.status === 'dispatched').length, color: '#3b82f6' },
    { name: '维修中', count: tickets.filter(t => t.status === 'in_progress').length, color: '#8b5cf6' },
    { name: '已完成', count: tickets.filter(t => t.status === 'completed').length, color: '#10b981' },
  ];

  const typeData = Object.keys(faultTypeLabels).map(type => ({
    name: faultTypeLabels[type],
    value: tickets.filter(t => t.faultType === type).length,
    color: faultTypeColors[type],
  })).filter(d => d.value > 0);

  const avgResponseTime = '15';
  const avgCompletionTime = '45';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={cn(
          'w-4 h-4',
          i < rating ? 'text-gold-500 fill-gold-500' : 'text-gray-300'
        )}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">报修工单管理</h1>
          <p className="text-gray-500">处理店铺报修工单，智能派单给最近维修工</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm">
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">今日工单</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {tickets.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">待处理</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {tickets.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">平均响应</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {avgResponseTime} 分钟
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">平均完成</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {avgCompletionTime} 分钟
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="section-title">工单状态统计</h3>
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
          <h3 className="section-title">故障类型分布</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {typeData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value} 件</span>
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
            placeholder="搜索店铺或故障描述..."
            className="input-field pl-12"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto min-w-[140px]"
          >
            <option value="all">全部状态</option>
            <option value="pending">待派单</option>
            <option value="dispatched">已派单</option>
            <option value="in_progress">维修中</option>
            <option value="completed">已完成</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field w-auto min-w-[140px]"
          >
            <option value="all">全部类型</option>
            {Object.entries(faultTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
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
      ) : filteredTickets.length === 0 ? (
        <div className="card text-center py-16">
          <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">暂无工单记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map(ticket => {
            const config = statusConfig[ticket.status];
            const StatusIcon = config.icon;
            const worker = workers.find(w => w.id === ticket.workerId);

            return (
              <div
                key={ticket.id}
                className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openDetail(ticket)}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                        ticket.status === 'completed' ? 'bg-green-100' :
                        ticket.status === 'pending' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      )}>
                        {ticket.status === 'completed' ? '✅' : ticket.status === 'pending' ? '⏳' : '🔧'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{ticket.shopName}</h4>
                        <p className="text-sm text-gray-500">
                          {faultTypeLabels[ticket.faultType]} | 工单号：{ticket.id}
                        </p>
                      </div>
                      <span className={cn('status-badge flex items-center gap-1', config.bgColor, config.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                      {ticket.priority === 'high' && (
                        <span className="status-badge bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          紧急
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{ticket.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{ticket.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>提交：{formatDate(ticket.createdAt)}</span>
                      </div>
                      {worker && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <User className="w-4 h-4" />
                          <span>维修工：{worker.name} ({worker.phone})</span>
                        </div>
                      )}
                      {ticket.completedAt && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <CheckCircle className="w-4 h-4" />
                          <span>完成：{formatDate(ticket.completedAt)}</span>
                        </div>
                      )}
                    </div>
                    {ticket.rating && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-gray-500">评分：</span>
                        <div className="flex items-center gap-0.5">
                          {renderStars(ticket.rating)}
                        </div>
                        {ticket.review && (
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 lg:min-w-[150px]" onClick={e => e.stopPropagation()}>
                    {ticket.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAutoDispatch(ticket.id)}
                          disabled={actionLoading === ticket.id}
                          className="btn-primary !px-4 !py-2 !text-sm flex items-center justify-center gap-2"
                        >
                          {actionLoading === ticket.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Wrench className="w-4 h-4" />
                          )}
                          智能派单
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowDispatch(true);
                          }}
                          className="btn-secondary !px-4 !py-2 !text-sm flex items-center justify-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          手动派单
                        </button>
                      </>
                    )}
                    {ticket.status === 'dispatched' && (
                      <button className="btn-secondary !px-4 !py-2 !text-sm flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" />
                        联系工人
                      </button>
                    )}
                    {ticket.status === 'completed' && !ticket.rating && (
                      <>
                        <button
                          onClick={() => handleShowQRCode(ticket)}
                          className="btn-secondary !px-4 !py-2 !text-sm flex items-center justify-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          扫码确认
                        </button>
                        <button
                          onClick={() => handleOpenRating(ticket)}
                          className="btn-primary !px-4 !py-2 !text-sm flex items-center justify-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          服务评价
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showDispatch && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">选择维修工</h3>
                <p className="text-sm text-gray-500">
                  为 {selectedTicket.shopName} 的 {faultTypeLabels[selectedTicket.faultType]} 选择维修工
                </p>
              </div>
              <button
                onClick={() => setShowDispatch(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {workers
                  .filter(w => w.specialty === selectedTicket.faultType || w.specialty === 'all')
                  .sort((a, b) => a.distance - b.distance)
                  .map(worker => (
                    <div
                      key={worker.id}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer"
                      onClick={() => handleDispatch(selectedTicket.id, worker.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-gold-100 flex items-center justify-center text-2xl">
                            👨‍🔧
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{worker.name}</h4>
                            <p className="text-sm text-gray-500">
                              {worker.specialty === 'all' ? '全能维修' : faultTypeLabels[worker.specialty]} | {worker.phone}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-0.5">
                                {renderStars(Math.round(worker.rating))}
                              </div>
                              <span className="text-xs text-gray-400">({worker.totalOrders}单)</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                            {worker.status === 'online' ? '在线' : '离线'}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">距离 {worker.distance}m</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDispatch(false)}
                className="btn-secondary !px-5 !py-2.5"
              >
                取消
              </button>
              <button
                onClick={() => handleAutoDispatch(selectedTicket.id)}
                className="btn-primary !px-5 !py-2.5 flex items-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                AI智能派单
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">工单详情</h3>
                <p className="text-sm text-gray-500">工单号：{selectedTicket.id}</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">店铺名称</p>
                  <p className="font-semibold text-gray-800">{selectedTicket.shopName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">故障类型</p>
                  <p className="font-semibold text-gray-800">{faultTypeLabels[selectedTicket.faultType]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">位置</p>
                  <p className="font-semibold text-gray-800">{selectedTicket.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">优先级</p>
                  <p className={cn(
                    'font-semibold',
                    selectedTicket.priority === 'high' ? 'text-red-600' : 'text-gray-800'
                  )}>
                    {selectedTicket.priority === 'high' ? '紧急' : '普通'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">故障描述</p>
                <p className="text-gray-800">{selectedTicket.description}</p>
              </div>

              {selectedTicket.images && selectedTicket.images.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">现场照片</p>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedTicket.images.map((img, i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        📷
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTicket.workerId && (
                <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                  <p className="text-sm text-gray-500 mb-2">维修人员</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center text-xl">
                      👨‍🔧
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {workers.find(w => w.id === selectedTicket.workerId)?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {workers.find(w => w.id === selectedTicket.workerId)?.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTicket.rating && (
                <div className="p-4 bg-gold-50 rounded-xl border border-gold-200">
                  <p className="text-sm text-gray-500 mb-2">店铺评价</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {renderStars(selectedTicket.rating)}
                    </div>
                    {selectedTicket.rating >= 4 ? (
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  {selectedTicket.review && (
                    <p className="text-gray-700 text-sm">"{selectedTicket.review}"</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-gray-500">处理时间线</p>
                <div className="border-l-2 border-gray-200 pl-4 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[22px] w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                    <p className="text-sm text-gray-800">工单创建</p>
                    <p className="text-xs text-gray-500">{formatDate(selectedTicket.createdAt)}</p>
                  </div>
                  {selectedTicket.dispatchedAt && (
                    <div className="relative">
                      <div className="absolute -left-[22px] w-4 h-4 rounded-full bg-purple-500 border-2 border-white"></div>
                      <p className="text-sm text-gray-800">已派单</p>
                      <p className="text-xs text-gray-500">{formatDate(selectedTicket.dispatchedAt)}</p>
                    </div>
                  )}
                  {selectedTicket.startedAt && (
                    <div className="relative">
                      <div className="absolute -left-[22px] w-4 h-4 rounded-full bg-yellow-500 border-2 border-white"></div>
                      <p className="text-sm text-gray-800">开始维修</p>
                      <p className="text-xs text-gray-500">{formatDate(selectedTicket.startedAt)}</p>
                    </div>
                  )}
                  {selectedTicket.completedAt && (
                    <div className="relative">
                      <div className="absolute -left-[22px] w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                      <p className="text-sm text-gray-800">维修完成</p>
                      <p className="text-xs text-gray-500">{formatDate(selectedTicket.completedAt)}</p>
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
              {selectedTicket?.status === 'completed' && !selectedTicket?.rating && (
                <>
                  <button
                    onClick={() => {
                      setShowDetail(false);
                      handleShowQRCode(selectedTicket);
                    }}
                    className="btn-secondary !px-5 !py-2.5 flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    扫码确认
                  </button>
                  <button
                    onClick={() => {
                      setShowDetail(false);
                      handleOpenRating(selectedTicket);
                    }}
                    className="btn-primary !px-5 !py-2.5 flex items-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    服务评价
                  </button>
                </>
              )}
              <button className="btn-secondary !px-5 !py-2.5 flex items-center gap-2">
                <Download className="w-4 h-4" />
                下载凭证
              </button>
            </div>
          </div>
        </div>
      )}

      {showQRCode && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-primary-600" />
                  扫码确认完工
                </h3>
                <p className="text-sm text-gray-500 mt-1">工单号：{selectedTicket.id}</p>
              </div>
              <button
                onClick={() => setShowQRCode(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <div className="text-center">
                  <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">模拟二维码</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">请使用店铺管理员账号扫描二维码确认维修完工</p>
              <div className="p-4 bg-blue-50 rounded-xl text-left mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">工单信息</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <p>店铺：{selectedTicket.shopName}</p>
                  <p>故障类型：{faultTypeLabels[selectedTicket.faultType]}</p>
                  <p>维修工：{workers.find(w => w.id === selectedTicket.workerId)?.name || '未分配'}</p>
                  <p>完成时间：{selectedTicket.completedAt ? formatDate(selectedTicket.completedAt) : '未完成'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQRCode(false)}
                  className="flex-1 btn-secondary !py-2.5"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowQRCode(false);
                    handleOpenRating(selectedTicket);
                  }}
                  className="flex-1 btn-primary !py-2.5 flex items-center justify-center gap-2"
                >
                  <ScanFace className="w-4 h-4" />
                  模拟扫码确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRating && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Star className="w-6 h-6 text-gold-500" />
                  服务评价
                </h3>
                <p className="text-sm text-gray-500 mt-1">请为本次维修服务打分</p>
              </div>
              <button
                onClick={() => setShowRating(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-4">{selectedTicket.shopName}</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          'w-10 h-10 transition-colors',
                          star <= ratingValue
                            ? 'text-gold-500 fill-gold-500'
                            : 'text-gray-300 hover:text-gold-300'
                        )}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-lg font-bold text-gold-600">
                  {ratingValue === 1 && '非常不满意'}
                  {ratingValue === 2 && '不满意'}
                  {ratingValue === 3 && '一般'}
                  {ratingValue === 4 && '满意'}
                  {ratingValue === 5 && '非常满意'}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评价内容（选填）
                </label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="请描述您的服务体验..."
                  className="input-field min-h-[100px]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRating(false)}
                  className="flex-1 btn-secondary !py-2.5"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={actionLoading === selectedTicket.id}
                  className="flex-1 btn-primary !py-2.5 flex items-center justify-center gap-2"
                >
                  {actionLoading === selectedTicket.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  提交评价
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
