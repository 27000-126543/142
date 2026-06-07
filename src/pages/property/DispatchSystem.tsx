import { useState, useEffect } from 'react';
import {
  Wrench, Users, MapPin, Clock, Star, TrendingUp,
  RefreshCw, Filter, Send, Phone, Navigation,
  AlertCircle, CheckCircle, Zap, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { api } from '../../services/api';
import type { RepairWorker, WorkTicket } from '/shared/types';
import { cn } from '../../lib/utils';

export function DispatchSystem() {
  const [workers, setWorkers] = useState<RepairWorker[]>([]);
  const [pendingTickets, setPendingTickets] = useState<WorkTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<RepairWorker | null>(null);
  const [showWorkerDetail, setShowWorkerDetail] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  useEffect(() => {
    fetchData();
  }, [selectedSpecialty]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workersData, ticketsData] = await Promise.all([
        api.getWorkers(),
        api.getTickets('pending'),
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

      let filtered = convertedWorkers;
      if (selectedSpecialty !== 'all') {
        filtered = convertedWorkers.filter(w => w.specialty === selectedSpecialty || w.specialty === 'all');
      }

      setWorkers(filtered);
      setPendingTickets(convertedTickets);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDispatchAll = async () => {
    try {
      for (const ticket of pendingTickets) {
        await api.autoDispatch(ticket.id);
      }
      fetchData();
    } catch (error) {
      console.error('Failed to auto dispatch:', error);
    }
  };

  const onlineWorkers = workers.filter(w => w.status === 'online');
  const avgRating = workers.length > 0
    ? (workers.reduce((sum, w) => sum + w.rating, 0) / workers.length).toFixed(1)
    : '0';
  const avgDistance = workers.length > 0
    ? Math.round(workers.reduce((sum, w) => sum + w.distance, 0) / workers.length)
    : 0;

  const specialtyData = [
    { name: '电气故障', value: workers.filter(w => w.specialty === 'electrical').length, color: '#f59e0b' },
    { name: '水电故障', value: workers.filter(w => w.specialty === 'plumbing').length, color: '#3b82f6' },
    { name: '空调故障', value: workers.filter(w => w.specialty === 'hvac').length, color: '#8b5cf6' },
    { name: '结构维修', value: workers.filter(w => w.specialty === 'structure').length, color: '#10b981' },
    { name: '全能维修', value: workers.filter(w => w.specialty === 'all').length, color: '#ec4899' },
  ].filter(d => d.value > 0);

  const performanceData = workers.slice(0, 6).map(w => ({
    name: w.name,
    orders: w.totalOrders,
    rating: w.rating * 10,
  }));

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={cn(
          'w-3 h-3',
          i < Math.round(rating) ? 'text-gold-500 fill-gold-500' : 'text-gray-300'
        )}
      />
    ));
  };

  const getSpecialtyLabel = (specialty: string) => {
    const labels: Record<string, string> = {
      electrical: '电气故障',
      plumbing: '水电故障',
      hvac: '空调故障',
      structure: '结构维修',
      cleaning: '清洁服务',
      all: '全能维修',
    };
    return labels[specialty] || specialty;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-3">
            <Navigation className="w-8 h-8 text-primary-600" />
            智能派单系统
          </h1>
          <p className="text-gray-500">实时监控维修工位置，根据故障类型自动派单给最近维修工</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            刷新位置
          </button>
          {pendingTickets.length > 0 && (
            <button
              onClick={handleAutoDispatchAll}
              className="btn-primary !px-4 !py-2 flex items-center gap-2 !text-sm"
            >
              <Zap className="w-4 h-4" />
              一键智能派单 ({pendingTickets.length})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">维修工总数</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{workers.length} 人</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">在线人数</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {onlineWorkers.length} / {workers.length}
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
              <p className="text-gray-500 text-sm">平均评分</p>
              <p className="text-2xl font-bold text-gold-600 mt-1">{avgRating} 分</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">平均距离</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{avgDistance}m</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {pendingTickets.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800">待派单提醒</h4>
              <p className="text-sm text-yellow-700 mt-1">
                当前有 <span className="font-bold">{pendingTickets.length}</span> 个工单等待派单，请及时处理。
              </p>
            </div>
            <div className="flex gap-2">
              {pendingTickets.slice(0, 3).map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => api.autoDispatch(ticket.id).then(fetchData)}
                  className="btn-primary !px-3 !py-1.5 !text-sm"
                >
                  派单 {ticket.shopName.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="section-title mb-0">维修工列表</h3>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="input-field !py-2 !text-sm w-auto"
                >
                  <option value="all">全部工种</option>
                  <option value="electrical">电气故障</option>
                  <option value="plumbing">水电故障</option>
                  <option value="hvac">空调故障</option>
                  <option value="structure">结构维修</option>
                  <option value="cleaning">清洁服务</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="skeleton h-24 w-full rounded-lg"></div>
                ))}
              </div>
            ) : workers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无维修工数据</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workers.map((worker, index) => (
                  <div
                    key={worker.id}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all cursor-pointer',
                      worker.status === 'online'
                        ? 'border-green-200 bg-green-50/50 hover:border-green-400'
                        : 'border-gray-200 bg-gray-50/50 hover:border-gray-400',
                      index === 0 && 'border-gold-300 bg-gold-50/50'
                    )}
                    onClick={() => {
                      setSelectedWorker(worker);
                      setShowWorkerDetail(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-gold-100 flex items-center justify-center text-2xl">
                            👨‍🔧
                          </div>
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1">
                              <Award className="w-5 h-5 text-gold-500 fill-gold-500" />
                            </div>
                          )}
                          <div className={cn(
                            'absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white',
                            worker.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          )}></div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800">{worker.name}</h4>
                            {index === 0 && (
                              <span className="status-badge bg-gold-100 text-gold-700 text-xs">
                                金牌师傅
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {getSpecialtyLabel(worker.specialty)} | {worker.phone}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-0.5">
                              {renderStars(worker.rating)}
                            </div>
                            <span className="text-xs text-gray-400">
                              {worker.rating.toFixed(1)} ({worker.totalOrders}单)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Navigation className="w-4 h-4 text-primary-500" />
                          <span className="font-bold text-primary-600">{worker.distance}m</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">距故障点</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            className="btn-secondary !px-3 !py-1.5 !text-xs flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone className="w-3 h-3" />
                            联系
                          </button>
                          {pendingTickets.length > 0 && (
                            <button
                              className="btn-primary !px-3 !py-1.5 !text-xs flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                api.dispatchTicket(pendingTickets[0].id, worker.id).then(fetchData);
                              }}
                            >
                              <Send className="w-3 h-3" />
                              派单
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="section-title">工种分布</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={specialtyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    dataKey="value"
                  >
                    {specialtyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {specialtyData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value} 人</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">业绩排行</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={60} />
                  <Tooltip />
                  <Bar dataKey="orders" name="接单量" fill="#1e3a8a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI 智能派单算法
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs">1</div>
                <div>
                  <p className="font-medium">距离优先</p>
                  <p className="text-white/70">优先选择距离故障点最近的维修工</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs">2</div>
                <div>
                  <p className="font-medium">技能匹配</p>
                  <p className="text-white/70">匹配维修工技能与故障类型</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs">3</div>
                <div>
                  <p className="font-medium">工作负荷</p>
                  <p className="text-white/70">考虑当前未完成工单数量</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs">4</div>
                <div>
                  <p className="font-medium">历史评分</p>
                  <p className="text-white/70">高评分维修工优先获得派单</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showWorkerDetail && selectedWorker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg animate-slide-up">
            <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl">
                    👨‍🔧
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedWorker.name}</h3>
                    <p className="text-white/80">{getSpecialtyLabel(selectedWorker.specialty)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        {Array(5).fill(0).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-4 h-4',
                              i < Math.round(selectedWorker.rating) ? 'text-gold-400 fill-gold-400' : 'text-white/30'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm">{selectedWorker.rating.toFixed(1)} 分</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowWorkerDetail(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-primary-600">{selectedWorker.totalOrders}</p>
                  <p className="text-sm text-gray-500">累计接单</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedWorker.distance}m</p>
                  <p className="text-sm text-gray-500">当前距离</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gold-600">98%</p>
                  <p className="text-sm text-gray-500">好评率</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-purple-600">42分钟</p>
                  <p className="text-sm text-gray-500">平均耗时</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">联系电话</span>
                  <span className="font-medium">{selectedWorker.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">工作状态</span>
                  <span className={cn(
                    'font-medium',
                    selectedWorker.status === 'online' ? 'text-green-600' : 'text-gray-500'
                  )}>
                    {selectedWorker.status === 'online' ? '在线可接单' : '离线'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button className="btn-secondary flex-1 !py-2.5 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                拨打电话
              </button>
              <button className="btn-primary flex-1 !py-2.5 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                派单给他
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
