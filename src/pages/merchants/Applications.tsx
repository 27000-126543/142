import { useState, useEffect } from 'react';
import {
  Search, Filter, Eye, CheckCircle, XCircle, Clock,
  Building2, Phone, MapPin, FileText, Send, X
} from 'lucide-react';
import { api } from '../../services/api';
import type { Application } from '/shared/types';
import { cn } from '../../lib/utils';

const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'reviewing', label: '审核中' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  reviewing: { label: '审核中', color: 'bg-blue-100 text-blue-700', icon: Eye },
  approved: { label: '已通过', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  useEffect(() => {
    let result = applications;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.brandName.toLowerCase().includes(query) ||
        a.brandType.toLowerCase().includes(query) ||
        a.contactName.toLowerCase().includes(query)
      );
    }
    setFilteredApps(result);
  }, [applications, searchQuery]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getApplications(statusFilter);
      setApplications(data);
      setFilteredApps(data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    try {
      setActionLoading(true);
      await api.approveApplication(selectedApp.id, reviewNote);
      await fetchApplications();
      setShowDetail(false);
      setSelectedApp(null);
      setReviewNote('');
    } catch (error) {
      console.error('Failed to approve application:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    try {
      setActionLoading(true);
      await api.rejectApplication(selectedApp.id, reviewNote);
      await fetchApplications();
      setShowDetail(false);
      setSelectedApp(null);
      setReviewNote('');
    } catch (error) {
      console.error('Failed to reject application:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const openDetail = (app: Application) => {
    setSelectedApp(app);
    setShowDetail(true);
    setReviewNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">入驻申请管理</h1>
          <p className="text-gray-500">审核品牌方入驻申请，管理招商流程</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-gradient-to-r from-primary-50 to-gold-50 text-primary-700 rounded-full text-sm font-medium">
            共 {filteredApps.length} 条申请
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索品牌名称、类型、联系人..."
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
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusOptions.filter(o => o.value !== 'all').map(status => {
          const count = applications.filter(a => a.status === status.value).length;
          const config = statusConfig[status.value];
          const Icon = config.icon;
          return (
            <div
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={cn(
                'card cursor-pointer transition-all',
                statusFilter === status.value ? 'ring-2 ring-primary-500' : ''
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{status.label}</p>
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
        <div className="card">
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="skeleton h-20 w-full rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">品牌信息</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">业态类型</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">需求面积</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">联系人</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">申请时间</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">状态</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无申请记录</p>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map(app => {
                    const config = statusConfig[app.status];
                    const StatusIcon = config.icon;
                    return (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl">
                              🏢
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{app.brandName}</p>
                              <p className="text-sm text-gray-500">{app.brandType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{app.brandType}</td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-800">{app.requiredArea}㎡</span>
                          {app.preferredFloor && (
                            <p className="text-xs text-gray-400">首选 {app.preferredFloor}楼</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-gray-800">{app.contactName}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {app.contactPhone}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(app.submittedAt).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('status-badge flex items-center gap-1', config.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openDetail(app)}
                            className="btn-secondary !px-4 !py-2 !text-sm"
                          >
                            查看详情
                          </button>
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

      {showDetail && selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">入驻申请详情</h3>
                <p className="text-sm text-gray-500">申请编号：{selectedApp.id}</p>
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
                    <p className="text-sm text-gray-500">品牌名称</p>
                    <p className="font-semibold text-gray-800 text-lg">{selectedApp.brandName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">业态类型</p>
                    <p className="font-medium text-gray-800">{selectedApp.brandType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">需求面积</p>
                    <p className="font-medium text-gray-800">{selectedApp.requiredArea} 平方米</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">首选楼层</p>
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedApp.preferredFloor ? `${selectedApp.preferredFloor}楼` : '无偏好'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">联系人</p>
                    <p className="font-medium text-gray-800">{selectedApp.contactName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">联系电话</p>
                    <p className="font-medium text-gray-800">{selectedApp.contactPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">申请时间</p>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedApp.submittedAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">当前状态</p>
                    <span className={cn('status-badge mt-1', statusConfig[selectedApp.status].color)}>
                      {statusConfig[selectedApp.status].label}
                    </span>
                  </div>
                </div>
              </div>

              {selectedApp.reviewNote && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">审核意见</p>
                  <p className="text-gray-700">{selectedApp.reviewNote}</p>
                  {selectedApp.reviewerName && (
                    <p className="text-sm text-gray-500 mt-2">
                      —— {selectedApp.reviewerName}，{new Date(selectedApp.reviewedAt!).toLocaleString('zh-CN')}
                    </p>
                  )}
                </div>
              )}

              {selectedApp.status === 'pending' || selectedApp.status === 'reviewing' ? (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    审核意见
                  </label>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="请输入审核意见（选填）"
                    className="input-field min-h-[100px]"
                  />
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDetail(false)}
                className="btn-secondary !px-5 !py-2.5"
              >
                关闭
              </button>
              {(selectedApp.status === 'pending' || selectedApp.status === 'reviewing') && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="btn-danger !px-5 !py-2.5 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    {actionLoading ? '处理中...' : '拒绝申请'}
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="btn-primary !px-5 !py-2.5 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {actionLoading ? '处理中...' : '通过申请'}
                  </button>
                </>
              )}
              {selectedApp.status === 'approved' && (
                <button
                  onClick={() => {
                    setShowDetail(false);
                  }}
                  className="btn-gold !px-5 !py-2.5 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  生成合同
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
