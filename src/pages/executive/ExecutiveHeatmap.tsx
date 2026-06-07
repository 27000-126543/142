import { useState, useEffect } from 'react';
import {
  TrendingUp, Users, AlertTriangle, MapPin,
  Building2, Target, BarChart3, Download,
  RefreshCw, Filter, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Legend
} from 'recharts';
import { api } from '../../services/api';
import type { ExecutiveData, FloorComparison } from '/shared/types';
import { cn } from '../../lib/utils';

const metricConfig = {
  efficiency: { label: '坪效 (元/㎡)', unit: '元/㎡', color: '#1e3a8a' },
  conversion: { label: '客流转化率', unit: '%', color: '#10b981' },
  churn: { label: '店铺流失率', unit: '%', color: '#ef4444' },
  rentPerShop: { label: '单店租金', unit: '元', color: '#d4af37' },
};

export function ExecutiveHeatmap() {
  const [executiveData, setExecutiveData] = useState<ExecutiveData | null>(null);
  const [floorComparison, setFloorComparison] = useState<FloorComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'efficiency' | 'conversion' | 'churn'>('efficiency');
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [data, comparison] = await Promise.all([
        api.getExecutiveData(timeRange),
        api.getComparison(),
      ]);
      setExecutiveData(data);
      setFloorComparison(comparison);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMetricChange = (metric: 'efficiency' | 'conversion' | 'churn') => {
    setSelectedMetric(metric);
    api.getComparison().then(setFloorComparison);
  };

  const getHeatColor = (value: number, metric: string) => {
    let normalized = value;
    if (metric === 'efficiency') {
      normalized = Math.min(100, value / 300);
    } else if (metric === 'conversion') {
      normalized = value;
    } else if (metric === 'churn') {
      normalized = 100 - value;
    }
    
    if (normalized >= 80) return 'bg-green-500';
    if (normalized >= 60) return 'bg-green-400';
    if (normalized >= 40) return 'bg-yellow-400';
    if (normalized >= 20) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getHeatOpacity = (value: number, metric: string) => {
    let normalized = value;
    if (metric === 'efficiency') {
      normalized = Math.min(100, value / 300);
    } else if (metric === 'conversion') {
      normalized = value;
    } else if (metric === 'churn') {
      normalized = 100 - value;
    }
    return Math.max(0.3, normalized / 100);
  };

  const radarData = floorComparison.map(floor => ({
    floor: `F${floor.floorNumber}`,
    坪效: Math.min(100, floor.efficiency / 30),
    转化率: floor.conversion,
    留存率: 100 - floor.churn,
    租金贡献: Math.min(100, floor.rentPerShop / 3000),
    品牌质量: 75 + Math.random() * 20,
  }));

  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      return `¥${(value / 10000).toFixed(1)}万`;
    }
    return `¥${value.toLocaleString()}`;
  };

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />;
  };

  const getTrendColor = (trend: number, metric: string) => {
    if (metric === 'churn') {
      return trend < 0 ? 'text-green-600' : 'text-red-600';
    }
    return trend >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">运营数据分析</h1>
          <p className="text-gray-500">各楼层坪效、客流转化率和店铺流失率对比分析</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-field !py-2 !text-sm w-auto"
            >
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
              <option value="year">本年度</option>
            </select>
          </div>
          <button
            onClick={fetchData}
            className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
          <button className="btn-primary !px-4 !py-2 flex items-center gap-2 !text-sm">
            <Download className="w-4 h-4" />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">综合坪效</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                ¥{executiveData?.overallEfficiency?.toLocaleString() || 0}/㎡
              </p>
              <div className={cn(
                'flex items-center gap-1 text-sm mt-1',
                getTrendColor(executiveData?.efficiencyTrend || 0, 'efficiency')
              )}>
                {getTrendIcon(executiveData?.efficiencyTrend || 0)}
                <span>{Math.abs(executiveData?.efficiencyTrend || 0).toFixed(1)}%</span>
                <span className="text-gray-400">较上月</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">客流转化率</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {executiveData?.overallConversion?.toFixed(1) || 0}%
              </p>
              <div className={cn(
                'flex items-center gap-1 text-sm mt-1',
                getTrendColor(executiveData?.conversionTrend || 0, 'conversion')
              )}>
                {getTrendIcon(executiveData?.conversionTrend || 0)}
                <span>{Math.abs(executiveData?.conversionTrend || 0).toFixed(1)}%</span>
                <span className="text-gray-400">较上月</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">店铺流失率</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {executiveData?.overallChurn?.toFixed(1) || 0}%
              </p>
              <div className={cn(
                'flex items-center gap-1 text-sm mt-1',
                getTrendColor(executiveData?.churnTrend || 0, 'churn')
              )}>
                {getTrendIcon(executiveData?.churnTrend || 0)}
                <span>{Math.abs(executiveData?.churnTrend || 0).toFixed(1)}%</span>
                <span className="text-gray-400">较上月</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-l-gold-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">月租金收入</p>
              <p className="text-2xl font-bold text-gold-600 mt-1">
                {formatCurrency(executiveData?.totalMonthlyRent || 0)}
              </p>
              <div className="flex items-center gap-1 text-sm mt-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span>12.5%</span>
                <span className="text-gray-400">较上月</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="section-title mb-0">楼层对比热力图</h3>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  {(['efficiency', 'conversion', 'churn'] as const).map(metric => (
                    <button
                      key={metric}
                      onClick={() => handleMetricChange(metric)}
                      className={cn(
                        'px-4 py-1.5 text-sm font-medium transition-colors',
                        selectedMetric === metric
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {metricConfig[metric].label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="skeleton h-20 w-full rounded-lg"></div>
                ))
              ) : (
                floorComparison.sort((a, b) => b.floorNumber - a.floorNumber).map((floor, index) => {
                  const metricValue = floor[selectedMetric];
                  const trend = selectedMetric === 'efficiency' ? floor.efficiencyTrend
                    : selectedMetric === 'conversion' ? floor.conversionTrend
                    : floor.churnTrend;
                  
                  return (
                    <div
                      key={floor.floorId}
                      className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl">
                            F{floor.floorNumber}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{floor.floorName}</h4>
                            <p className="text-sm text-gray-500">{floor.shopCount} 家店铺 | {floor.area}㎡</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-800">
                            {selectedMetric === 'churn'
                              ? `${metricValue.toFixed(1)}%`
                              : selectedMetric === 'conversion'
                              ? `${metricValue.toFixed(1)}%`
                              : `¥${metricValue.toLocaleString()}`}
                          </p>
                          <div className={cn(
                            'flex items-center justify-end gap-1 text-sm',
                            getTrendColor(trend, selectedMetric)
                          )}>
                            {getTrendIcon(trend)}
                            <span>{Math.abs(trend).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 flex">
                          {[...Array(10)].map((_, i) => (
                            <div key={i} className="flex-1 border-r border-white last:border-r-0"></div>
                          ))}
                        </div>
                        <div
                          className={cn(
                            'absolute inset-y-0 left-0 rounded-lg transition-all duration-1000',
                            getHeatColor(metricValue, selectedMetric)
                          )}
                          style={{
                            width: `${selectedMetric === 'churn' ? Math.min(100, metricValue * 2) : Math.min(100, metricValue)}%`,
                            opacity: getHeatOpacity(metricValue, selectedMetric),
                          }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-between px-4">
                          <span className="text-sm font-medium text-white drop-shadow-lg">
                            {selectedMetric === 'efficiency'
                              ? `坪效排名第 ${index + 1}`
                              : selectedMetric === 'conversion'
                              ? `转化率排名第 ${index + 1}`
                              : `流失率排名第 ${index + 1}`}
                          </span>
                          <span className="text-xs text-white/80 drop-shadow-lg">
                            月租金 {formatCurrency(floor.rentPerShop * floor.shopCount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-gray-600">较差</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-400"></div>
                <span className="text-gray-600">一般</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-400"></div>
                <span className="text-gray-600">中等</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-400"></div>
                <span className="text-gray-600">良好</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-gray-600">优秀</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="section-title">综合能力雷达图</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="floor" stroke="#6b7280" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#d1d5db" />
                  <Radar name="F1" dataKey="坪效" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.3} />
                  <Radar name="F2" dataKey="转化率" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Radar name="F3" dataKey="留存率" stroke="#d4af37" fill="#d4af37" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">趋势变化</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { month: '1月', 坪效: 210, 转化率: 45, 留存率: 92 },
                    { month: '2月', 坪效: 230, 转化率: 48, 留存率: 90 },
                    { month: '3月', 坪效: 245, 转化率: 52, 留存率: 88 },
                    { month: '4月', 坪效: 260, 转化率: 55, 留存率: 89 },
                    { month: '5月', 坪效: 278, 转化率: 58, 留存率: 91 },
                  ]}
                >
                  <defs>
                    <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="坪效" stroke="#1e3a8a" fillOpacity={1} fill="url(#colorEff)" />
                  <Area type="monotone" dataKey="转化率" stroke="#10b981" fillOpacity={1} fill="url(#colorConv)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              管理层洞察
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-white/10 rounded-lg">
                <p className="font-medium">📈 坪效最佳楼层</p>
                <p className="text-white/80 mt-1">F1 一层品牌旗舰店坪效达 ¥320/㎡，建议扩大该品类占比</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                <p className="font-medium">⚠️ 需关注</p>
                <p className="text-white/80 mt-1">F4 餐饮层流失率达 8.5%，建议调整品牌组合</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                <p className="font-medium">💡 优化建议</p>
                <p className="text-white/80 mt-1">B1 层客流转化率仅 42%，建议增加互动体验区</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
