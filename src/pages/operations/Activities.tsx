import { useState, useEffect } from 'react';
import {
  Plus, Calendar, Clock, Users, DollarSign, TrendingUp,
  Search, Filter, Eye, Play, CheckCircle, FileText, X,
  Sparkles, Target, BarChart3, ShoppingBag, Zap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Cell
} from 'recharts';
import { api } from '../../services/api';
import type { Activity } from '/shared/types';
import { cn } from '../../lib/utils';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-700', icon: FileText },
  approved: { label: '已审批', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  active: { label: '进行中', color: 'bg-green-100 text-green-700', icon: Play },
  completed: { label: '已结束', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
};

const activityTypes = [
  { value: '节日促销', label: '节日促销' },
  { value: '新品推广', label: '新品推广' },
  { value: '店庆活动', label: '店庆活动' },
  { value: '会员日', label: '会员日' },
  { value: '换季清仓', label: '换季清仓' },
];

export function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '节日促销',
    startDate: '',
    endDate: '',
    actualBudget: 0,
  });

  useEffect(() => {
    fetchActivities();
  }, [statusFilter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await api.getActivities(statusFilter);
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.createActivity(formData);
      fetchActivities();
      setShowCreate(false);
      setFormData({
        name: '',
        type: '节日促销',
        startDate: '',
        endDate: '',
        actualBudget: 0,
      });
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approveActivity(id);
      fetchActivities();
    } catch (error) {
      console.error('Failed to approve activity:', error);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await api.startActivity(id);
      fetchActivities();
    } catch (error) {
      console.error('Failed to start activity:', error);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.completeActivity(id);
      fetchActivities();
    } catch (error) {
      console.error('Failed to complete activity:', error);
    }
  };

  const filteredActivities = activities.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const radarData = [
    { subject: '客流预期', A: 85, fullMark: 100 },
    { subject: '销售预期', A: 90, fullMark: 100 },
    { subject: '品牌参与', A: 75, fullMark: 100 },
    { subject: '预算合理', A: 88, fullMark: 100 },
    { subject: '执行难度', A: 70, fullMark: 100 },
    { subject: 'ROI预期', A: 92, fullMark: 100 },
  ];

  const budgetComparison = selectedActivity ? [
    { name: '推荐预算', value: selectedActivity.recommendedBudget, color: '#1e3a8a' },
    { name: '实际预算', value: selectedActivity.actualBudget || selectedActivity.recommendedBudget, color: '#d4af37' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">促销活动管理</h1>
          <p className="text-gray-500">创建和管理营销活动，系统智能推荐预算和参与品牌</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建活动
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索活动名称、类型..."
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
            <option value="draft">草稿</option>
            <option value="approved">已审批</option>
            <option value="active">进行中</option>
            <option value="completed">已结束</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = activities.filter(a => a.status === key).length;
          return (
            <div key={key} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{config.label}</p>
                  <p className="text-3xl font-bold text-dark-800 mt-1">{count}</p>
                </div>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.color)}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card h-64">
              <div className="skeleton h-full w-full rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.length === 0 ? (
            <div className="col-span-full card text-center py-12 text-gray-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">暂无活动记录</p>
            </div>
          ) : (
            filteredActivities.map(activity => {
              const config = statusConfig[activity.status];
              const StatusIcon = config.icon;
              const daysLeft = Math.ceil(
                (new Date(activity.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              const isActive = activity.status === 'active';
              const progress = isActive ? Math.min(100, Math.max(0,
                ((new Date().getTime() - new Date(activity.startDate).getTime()) /
                (new Date(activity.endDate).getTime() - new Date(activity.startDate).getTime())) * 100
              )) : activity.status === 'completed' ? 100 : 0;

              return (
                <div
                  key={activity.id}
                  className="card hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedActivity(activity);
                    setShowDetail(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={cn('status-badge flex items-center gap-1', config.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                      <h3 className="text-lg font-bold text-gray-800 mt-2 group-hover:text-primary-600 transition-colors">
                        {activity.name}
                      </h3>
                      <p className="text-sm text-gray-500">{activity.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">推荐预算</p>
                      <p className="text-xl font-bold text-primary-600">
                        ¥{(activity.recommendedBudget / 10000).toFixed(0)}万
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        活动时间
                      </span>
                      <span className="font-medium text-gray-700">
                        {activity.startDate} ~ {activity.endDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        参与品牌
                      </span>
                      <span className="font-medium text-gray-700">
                        {activity.participants.length} 家
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        推荐品牌
                      </span>
                      <span className="font-medium text-gold-600">
                        {activity.recommendedBrands.slice(0, 2).join('、')}
                        {activity.recommendedBrands.length > 2 && `等${activity.recommendedBrands.length}家`}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>活动进度</span>
                        <span>{daysLeft > 0 ? `剩余${daysLeft}天` : '即将结束'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      创建人：{activity.creatorName}
                    </p>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showDetail && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">活动详情</h3>
                <p className="text-sm text-gray-500">活动编号：{selectedActivity.id}</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="glass-card p-6 bg-gradient-to-r from-primary-50 to-gold-50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className={cn('status-badge', statusConfig[selectedActivity.status].color)}>
                          {statusConfig[selectedActivity.status].label}
                        </span>
                        <h2 className="text-2xl font-bold text-gray-800 mt-2">{selectedActivity.name}</h2>
                        <p className="text-gray-600">{selectedActivity.type}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">活动时间</p>
                        <p className="font-semibold text-gray-800">{selectedActivity.startDate}</p>
                        <p className="text-sm text-gray-500">至 {selectedActivity.endDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">创建时间</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(selectedActivity.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                        <p className="text-sm text-gray-500">by {selectedActivity.creatorName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-gold-500" />
                      预算分析
                    </h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={budgetComparison} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={80} />
                          <Tooltip formatter={(value) => [`¥${value.toLocaleString()}`, '']} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {budgetComparison.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-primary-50 rounded-lg text-center">
                        <p className="text-xs text-gray-500">推荐预算</p>
                        <p className="text-xl font-bold text-primary-600">
                          ¥{selectedActivity.recommendedBudget.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gold-50 rounded-lg text-center">
                        <p className="text-xs text-gray-500">实际预算</p>
                        <p className="text-xl font-bold text-gold-600">
                          ¥{(selectedActivity.actualBudget || selectedActivity.recommendedBudget).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-gold-500" />
                      智能推荐评分
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name="评分"
                            dataKey="A"
                            stroke="#1e3a8a"
                            fill="#1e3a8a"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="card">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary-600" />
                      系统推荐参与品牌
                    </h4>
                    <div className="space-y-2">
                      {selectedActivity.recommendedBrands.map((brand, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-transparent rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 text-white text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="font-medium text-gray-800">{brand}</span>
                          </div>
                          <Zap className="w-4 h-4 text-gold-500" />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      * 推荐基于各店铺历史客流和销售额数据分析得出
                    </p>
                  </div>

                  <div className="card">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      已确认参与
                    </h4>
                    {selectedActivity.participants.length === 0 ? (
                      <p className="text-center py-8 text-gray-400">暂无品牌确认参与</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedActivity.participants.map((p, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="font-medium text-gray-800">{p.shopName}</span>
                            </div>
                            {p.isRecommended && (
                              <span className="text-xs px-2 py-1 bg-gold-100 text-gold-700 rounded-full">
                                推荐品牌
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      预期效果
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center">
                        <p className="text-3xl font-bold text-green-600">+35%</p>
                        <p className="text-sm text-gray-500 mt-1">预期客流增长</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-center">
                        <p className="text-3xl font-bold text-blue-600">+45%</p>
                        <p className="text-sm text-gray-500 mt-1">预期销售增长</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-gold-50 to-yellow-50 rounded-xl text-center">
                        <p className="text-3xl font-bold text-gold-600">3.2</p>
                        <p className="text-sm text-gray-500 mt-1">预期ROI</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center">
                        <p className="text-3xl font-bold text-purple-600">20+</p>
                        <p className="text-sm text-gray-500 mt-1">参与品牌数</p>
                      </div>
                    </div>
                  </div>
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
              {selectedActivity.status === 'draft' && (
                <button
                  onClick={() => {
                    handleApprove(selectedActivity.id);
                    setShowDetail(false);
                  }}
                  className="btn-primary !px-5 !py-2.5"
                >
                  确认审批
                </button>
              )}
              {selectedActivity.status === 'approved' && (
                <button
                  onClick={() => {
                    handleStart(selectedActivity.id);
                    setShowDetail(false);
                  }}
                  className="btn-gold !px-5 !py-2.5 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  启动活动
                </button>
              )}
              {selectedActivity.status === 'active' && (
                <button
                  onClick={() => {
                    handleComplete(selectedActivity.id);
                    setShowDetail(false);
                  }}
                  className="btn-primary !px-5 !py-2.5 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  结束活动
                </button>
              )}
              {selectedActivity.status === 'completed' && (
                <button
                  className="btn-secondary !px-5 !py-2.5 flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  查看效果报告
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">创建新活动</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活动名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：618年中大促"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活动类型
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                >
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    开始日期
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    结束日期
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预算金额（元）
                </label>
                <input
                  type="number"
                  value={formData.actualBudget || ''}
                  onChange={(e) => setFormData({ ...formData, actualBudget: parseInt(e.target.value) || 0 })}
                  placeholder="系统将根据历史数据推荐预算"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 留空将使用系统推荐预算
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowCreate(false)}
                className="btn-secondary !px-5 !py-2.5"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                className="btn-primary !px-5 !py-2.5 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                AI智能创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
