import { useState, useEffect } from 'react';
import {
  FileText, Calendar, Download, TrendingUp, Users,
  DollarSign, Building2, Target, Send, CheckCircle,
  Clock, ArrowUpRight, BarChart3, PieChart,
  RefreshCw, Bell, Smartphone
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, AreaChart, Area,
  PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';
import { api } from '../../services/api';
import type { OperationReport } from '/shared/types';
import { cn } from '../../lib/utils';

export function OperationReports() {
  const [reports, setReports] = useState<OperationReport[]>([]);
  const [latestReport, setLatestReport] = useState<OperationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('2024-05');
  const [showReport, setShowReport] = useState(false);
  const [viewingReport, setViewingReport] = useState<OperationReport | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reportsData = await api.getReports(selectedMonth);
      setReports(reportsData);
      if (reportsData.length > 0) {
        setLatestReport(reportsData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setActionLoading('generate');
      await api.generateReport(selectedMonth);
      fetchData();
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAutoGenerateMonthly = async () => {
    try {
      setActionLoading('auto');
      await api.autoGenerateMonthlyReport();
      fetchData();
    } catch (error) {
      console.error('Failed to auto generate monthly report:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePushReport = async (reportId: string) => {
    try {
      setActionLoading(reportId);
      await api.pushReport(reportId);
      fetchData();
    } catch (error) {
      console.error('Failed to push report:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      setActionLoading(reportId);
      await api.downloadReport(reportId);
    } catch (error) {
      console.error('Failed to download report:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const openReport = (report: OperationReport) => {
    setViewingReport(report);
    setShowReport(true);
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      return `¥${(value / 10000).toFixed(1)}万`;
    }
    return `¥${value.toLocaleString()}`;
  };

  const floorPerformance = latestReport?.floorBreakdown || [];

  const rentCollectionData = [
    { name: 'F1', 收缴率: 98.5, 目标: 100 },
    { name: 'F2', 收缴率: 95.2, 目标: 100 },
    { name: 'F3', 收缴率: 92.8, 目标: 100 },
    { name: 'F4', 收缴率: 88.5, 目标: 100 },
    { name: 'F5', 收缴率: 96.3, 目标: 100 },
    { name: 'B1', 收缴率: 94.7, 目标: 100 },
  ];

  const passengerTrend = [
    { month: '1月', 客流: 28.5, 销售: 1820 },
    { month: '2月', 客流: 31.2, 销售: 1980 },
    { month: '3月', 客流: 35.8, 销售: 2150 },
    { month: '4月', 客流: 33.2, 销售: 2080 },
    { month: '5月', 客流: 38.6, 销售: 2380 },
  ];

  const activityROI = [
    { name: '春节促销', ROI: 3.8, 投入: 50, 产出: 190 },
    { name: '情人节活动', ROI: 4.2, 投入: 30, 产出: 126 },
    { name: '会员日', ROI: 5.1, 投入: 20, 产出: 102 },
    { name: '五一狂欢', ROI: 4.5, 投入: 60, 产出: 270 },
  ];

  const pieData = [
    { name: '零售', value: 45, color: '#1e3a8a' },
    { name: '餐饮', value: 30, color: '#10b981' },
    { name: '娱乐', value: 15, color: '#d4af37' },
    { name: '服务', value: 10, color: '#8b5cf6' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <span className="status-badge bg-blue-100 text-blue-700 flex items-center gap-1"><FileText className="w-3 h-3" />已生成</span>;
      case 'pushed':
        return <span className="status-badge bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" />已推送</span>;
      case 'draft':
        return <span className="status-badge bg-gray-100 text-gray-700 flex items-center gap-1"><Clock className="w-3 h-3" />草稿</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary-600" />
            运营报告中心
          </h1>
          <p className="text-gray-500">每月1号自动统计上月数据，生成运营报告推送到总经理手机端</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field !py-2 !pl-9 !text-sm w-40"
            />
          </div>
          <button
            onClick={fetchData}
            className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
          <button
            onClick={handleAutoGenerateMonthly}
            disabled={actionLoading === 'auto'}
            className="btn-gold !px-4 !py-2 flex items-center gap-2 !text-sm"
          >
            {actionLoading === 'auto' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Bell className="w-4 h-4" />
            )}
            模拟每月1号自动生成
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={actionLoading === 'generate'}
            className="btn-primary !px-4 !py-2 flex items-center gap-2 !text-sm"
          >
            {actionLoading === 'generate' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FileText className="w-4 h-4" />
            )}
            生成报告
          </button>
        </div>
      </div>

      {latestReport && (
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-gold-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl">
                📊
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{latestReport.reportMonth} 运营报告</h2>
                  {getStatusBadge(latestReport.status)}
                </div>
                <p className="text-white/70 mt-1">
                  报告编号：{latestReport.id} | 生成时间：{new Date(latestReport.generatedAt).toLocaleString('zh-CN')}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-sm">
                    <Smartphone className="w-4 h-4" />
                    {latestReport.pushedAt ? `已推送 ${latestReport.pushCount} 次` : '待推送'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => openReport(latestReport)}
                className="px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
              >
                查看详情
              </button>
              {latestReport.status !== 'pushed' && (
                <button
                  onClick={() => handlePushReport(latestReport.id)}
                  disabled={actionLoading === latestReport.id}
                  className="px-5 py-2.5 bg-white text-primary-700 hover:bg-white/90 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  推送总经理
                </button>
              )}
              <button
                onClick={() => handleDownloadReport(latestReport.id)}
                disabled={actionLoading === latestReport.id}
                className="px-5 py-2.5 bg-white text-primary-700 hover:bg-white/90 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                下载PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
            <div>
              <p className="text-white/70 text-sm">租金收缴率</p>
              <p className="text-2xl font-bold mt-1">{latestReport.collectionRate.toFixed(1)}%</p>
              <p className={cn(
                'text-sm mt-1 flex items-center gap-1',
                latestReport.collectionRate >= 95 ? 'text-green-300' : 'text-yellow-300'
              )}>
                {latestReport.collectionRate >= 95 ? '✓ 达标' : '⚠ 需提升'}
              </p>
            </div>
            <div>
              <p className="text-white/70 text-sm">客流总量</p>
              <p className="text-2xl font-bold mt-1">{latestReport.totalPassengers.toLocaleString()}</p>
              <p className="text-sm text-green-300 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                +{(latestReport.passengerGrowth * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-white/70 text-sm">活动投入产出比</p>
              <p className="text-2xl font-bold mt-1">1 : {latestReport.activityROI.toFixed(1)}</p>
              <p className="text-sm text-green-300 mt-1">优秀水平</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">月营业额</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(latestReport.totalSales)}</p>
              <p className="text-sm text-green-300 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                +12.5%
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="section-title">客流与销售趋势</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={passengerTrend}>
                  <defs>
                    <linearGradient id="colorPassenger" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#9ca3af" fontSize={11} unit="万" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={11} unit="万" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="客流"
                    stroke="#1e3a8a"
                    strokeWidth={2}
                    fill="url(#colorPassenger)"
                    name="客流(万人次)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="销售"
                    stroke="#d4af37"
                    strokeWidth={3}
                    dot={{ fill: '#d4af37', r: 5 }}
                    name="销售额(万元)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="section-title">业态销售占比</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, '占比']} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">活动ROI对比</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityROI}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="ROI" name="投入产出比" radius={[4, 4, 0, 0]}>
                    {activityROI.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.ROI >= 5 ? '#10b981' : entry.ROI >= 4 ? '#1e3a8a' : '#d4af37'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">各楼层收缴率对比</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rentCollectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={[80, 100]} unit="%" />
              <Tooltip formatter={(value: number) => [`${value}%`, '']} />
              <Legend />
              <Bar dataKey="收缴率" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="目标" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="section-title mb-0">历史报告</h3>
          <span className="text-sm text-gray-500">共 {reports.length} 份报告</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">报告月份</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">报告编号</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">生成时间</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">状态</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">推送状态</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">核心指标</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-bold text-gray-800">{report.reportMonth}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm text-gray-500">{report.id}</td>
                  <td className="px-4 py-4 text-gray-600 text-sm">
                    {new Date(report.generatedAt).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(report.status)}</td>
                  <td className="px-4 py-4">
                    {report.pushedAt ? (
                      <span className="status-badge bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" />
                        {report.pushCount} 次推送
                      </span>
                    ) : (
                      <span className="status-badge bg-gray-100 text-gray-500 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
                        待推送
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                        收缴率 {report.collectionRate.toFixed(1)}%
                      </span>
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded">
                        客流 {(report.totalPassengers / 10000).toFixed(1)}万
                      </span>
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                        ROI 1:{report.activityROI.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openReport(report)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="查看"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      {report.status !== 'pushed' && (
                        <button
                          onClick={() => handlePushReport(report.id)}
                          disabled={actionLoading === report.id}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="推送"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadReport(report.id)}
                        disabled={actionLoading === report.id}
                        className="p-2 text-gray-500 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                        title="下载"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showReport && viewingReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-gold-600 text-white">
              <div>
                <h3 className="text-xl font-bold">{viewingReport.reportMonth} 运营报告</h3>
                <p className="text-white/70 text-sm">报告编号：{viewingReport.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePushReport(viewingReport.id)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  推送
                </button>
                <button
                  onClick={() => handleDownloadReport(viewingReport.id)}
                  className="px-4 py-2 bg-white text-primary-700 hover:bg-white/90 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载
                </button>
                <button
                  onClick={() => setShowReport(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-500">租金收缴率</p>
                  <p className="text-2xl font-bold text-blue-600">{viewingReport.collectionRate.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-gray-500">客流总量</p>
                  <p className="text-2xl font-bold text-green-600">{viewingReport.totalPassengers.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-gray-500">活动ROI</p>
                  <p className="text-2xl font-bold text-purple-600">1 : {viewingReport.activityROI.toFixed(1)}</p>
                </div>
                <div className="p-4 bg-gold-50 rounded-xl">
                  <p className="text-sm text-gray-500">总营业额</p>
                  <p className="text-2xl font-bold text-gold-600">{formatCurrency(viewingReport.totalSales)}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">各楼层明细</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold text-gray-600">楼层</th>
                        <th className="text-right px-4 py-2 font-semibold text-gray-600">收缴率</th>
                        <th className="text-right px-4 py-2 font-semibold text-gray-600">客流</th>
                        <th className="text-right px-4 py-2 font-semibold text-gray-600">销售额</th>
                        <th className="text-right px-4 py-2 font-semibold text-gray-600">坪效</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {viewingReport.floorBreakdown.map((floor, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-semibold">{floor.floorName}</td>
                          <td className="px-4 py-2 text-right">{floor.collectionRate.toFixed(1)}%</td>
                          <td className="px-4 py-2 text-right">{(floor.passengers / 10000).toFixed(1)}万</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(floor.sales)}</td>
                          <td className="px-4 py-2 text-right font-medium">¥{floor.efficiency.toLocaleString()}/㎡</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">📈 管理层建议</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 四层餐饮层收缴率较低(88.5%)，建议加强租金催收力度</li>
                  <li>• 本月客流增长显著，建议加大营销投入进一步提升转化率</li>
                  <li>• 活动ROI表现优秀，建议总结经验复制到下月活动</li>
                  <li>• B1层坪效有提升空间，建议调整品牌组合</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
