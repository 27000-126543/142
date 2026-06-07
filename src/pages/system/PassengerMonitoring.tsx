import { useState, useEffect } from 'react';
import {
  Users, AlertTriangle, RefreshCw, MapPin,
  TrendingUp, Clock, Settings, Bell,
  Shield, AlertCircle, CheckCircle, XCircle,
  Thermometer, Wind, ArrowUpRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { api } from '../../services/api';
import type { PassengerFlow, ZoneFlow } from '/shared/types';
import { cn } from '../../lib/utils';

export function PassengerMonitoring() {
  const [passengerData, setPassengerData] = useState<PassengerFlow | null>(null);
  const [zoneData, setZoneData] = useState<ZoneFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [threshold, setThreshold] = useState(80);

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, threshold]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [data, zones] = await Promise.all([
        api.getPassengerFlow(),
        api.getZoneFlow(threshold),
      ]);
      setPassengerData(data);
      setZoneData(zones);
    } catch (error) {
      console.error('Failed to fetch passenger data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hourlyData = passengerData?.hourlyTrend || [];
  const warningZones = zoneData.filter(z => z.status === 'warning');
  const normalZones = zoneData.filter(z => z.status === 'normal');

  const getDensityColor = (density: number) => {
    if (density >= threshold) return 'text-red-600 bg-red-100';
    if (density >= threshold * 0.8) return 'text-orange-600 bg-orange-100';
    if (density >= threshold * 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getHeatColor = (density: number) => {
    if (density >= threshold) return 'bg-red-500';
    if (density >= threshold * 0.8) return 'bg-orange-500';
    if (density >= threshold * 0.6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getHeatOpacity = (density: number) => {
    return Math.max(0.4, density / 100);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'warning') return <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
    if (status === 'normal') return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">客流密度监控</h1>
          <p className="text-gray-500">实时统计各区域客流密度，超过安全阈值自动预警</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">阈值：</span>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 80)}
              className="input-field !w-20 !py-1.5 !text-sm text-center"
              min="50"
              max="120"
            />
            <span className="text-sm text-gray-500">人/100㎡</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className={cn('w-4 h-4', autoRefresh && 'animate-spin text-primary-500')} />
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                autoRefresh ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
              )}
            >
              {autoRefresh ? '自动刷新中' : '手动刷新'}
            </button>
          </div>
          <button
            onClick={fetchData}
            className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>
      </div>

      {warningZones.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800">客流预警</h4>
              <p className="text-sm text-red-700 mt-1">
                当前有 <span className="font-bold">{warningZones.length}</span> 个区域客流密度超过安全阈值，
                请及时采取限流措施。
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {warningZones.map(zone => (
                  <button
                    key={zone.zoneId}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full hover:bg-red-200 transition-colors"
                  >
                    {zone.zoneName} ({zone.currentCount}人)
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-danger !px-4 !py-2 !text-sm">
              启动限流
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">当前客流</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {passengerData?.currentTotal?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                +12.5% 较上小时
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">今日累计</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {passengerData?.dailyTotal?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                +8.3% 较昨日
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
              <p className="text-gray-500 text-sm">预警区域</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {warningZones.length} / {zoneData.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {normalZones.length} 个区域正常
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">平均密度</p>
              <p className="text-2xl font-bold text-gold-600 mt-1">
                {passengerData?.avgDensity?.toFixed(1) || 0} 人/100㎡
              </p>
              <p className="text-sm text-gray-500 mt-1">
                阈值 {threshold} 人/100㎡
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="section-title">客流热力图</h3>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {zoneData.map(zone => (
                <div
                  key={zone.zoneId}
                  className={cn(
                    'relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-105',
                    zone.status === 'warning'
                      ? 'border-red-300 animate-pulse'
                      : zone.density >= threshold * 0.8
                      ? 'border-orange-300'
                      : 'border-gray-200 hover:border-primary-300'
                  )}
                >
                  <div className="relative h-24 mb-3">
                    <div className="absolute inset-0 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className={cn('absolute inset-0 transition-all', getHeatColor(zone.density))}
                        style={{ opacity: getHeatOpacity(zone.density) }}
                      ></div>
                      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-px p-2">
                        {[...Array(16)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              'rounded transition-all',
                              Math.random() < zone.density / 100 ? getHeatColor(zone.density) : 'bg-white/30'
                            )}
                            style={{ opacity: Math.random() * 0.5 + 0.3 }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      {getStatusIcon(zone.status)}
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-800 text-sm">{zone.zoneName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{zone.floorName}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className={cn(
                        'text-xs font-bold px-2 py-0.5 rounded',
                        getDensityColor(zone.density)
                      )}>
                        {zone.currentCount} 人
                      </span>
                      <span className="text-xs text-gray-400">
                        {zone.density.toFixed(0)}人/100㎡
                      </span>
                    </div>
                    {zone.status === 'warning' && (
                      <button className="mt-2 w-full py-1 bg-red-500 text-white text-xs font-semibold rounded hover:bg-red-600 transition-colors">
                        限流建议
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="h-64">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">今日客流趋势</h4>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="passengerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="客流"
                    stroke="#1e3a8a"
                    strokeWidth={2}
                    fill="url(#passengerGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="section-title">各楼层客流</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneData.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                  <YAxis type="category" dataKey="zoneName" stroke="#9ca3af" fontSize={11} width={70} />
                  <Tooltip />
                  <Bar dataKey="currentCount" name="客流" radius={[0, 4, 4, 0]}>
                    {zoneData.slice(0, 6).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.status === 'warning' ? '#ef4444' : '#1e3a8a'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">环境监测</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                    <Wind className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">空气质量</p>
                    <p className="text-sm text-gray-500">PM2.5: 28 μg/m³</p>
                  </div>
                </div>
                <span className="status-badge bg-green-100 text-green-700">优</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">温度湿度</p>
                    <p className="text-sm text-gray-500">24°C / 55%RH</p>
                  </div>
                </div>
                <span className="status-badge bg-blue-100 text-blue-700">舒适</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">安全状态</p>
                    <p className="text-sm text-gray-500">安防系统正常</p>
                  </div>
                </div>
                <span className="status-badge bg-purple-100 text-purple-700">安全</span>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              预警建议
            </h3>
            <div className="space-y-3 text-sm">
              {warningZones.length > 0 ? (
                warningZones.slice(0, 3).map(zone => (
                  <div key={zone.zoneId} className="p-3 bg-white/10 rounded-lg">
                    <p className="font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      {zone.zoneName}
                    </p>
                    <p className="text-white/70 mt-1 text-xs">
                      建议：增加安保人员引导客流，临时关闭该区域入口，启动分流广播。
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    所有区域正常
                  </p>
                  <p className="text-white/70 mt-1 text-xs">
                    当前各区域客流密度均在安全范围内，无需特殊措施。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">预警记录</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">时间</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">区域</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">楼层</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">峰值客流</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">密度</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">状态</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">处理措施</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { time: '14:32', zone: '中庭区域', floor: 'F1', peak: 328, density: 92, status: 'resolved', action: '增派安保、分流引导' },
                { time: '13:15', zone: '餐饮区B', floor: 'F4', peak: 256, density: 85, status: 'resolved', action: '开启备用通道' },
                { time: '12:08', zone: '品牌街', floor: 'F1', peak: 412, density: 103, status: 'resolved', action: '临时限流、广播提醒' },
                { time: '11:22', zone: '儿童乐园', floor: 'F3', peak: 189, density: 78, status: 'resolved', action: '增加工作人员' },
                { time: '10:15', zone: '影院入口', floor: 'F5', peak: 234, density: 72, status: 'resolved', action: '无' },
              ].map((record, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 font-mono text-sm">{record.time}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{record.zone}</td>
                  <td className="px-4 py-3 text-gray-600">{record.floor}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">{record.peak} 人</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-0.5 rounded text-sm font-semibold',
                      record.density >= threshold ? 'bg-red-100 text-red-700' :
                      record.density >= threshold * 0.8 ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    )}>
                      {record.density} 人/100㎡
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="status-badge bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3" />
                      已解除
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Circle({ className }: { className?: string }) {
  return <div className={cn('w-5 h-5 rounded-full border-2', className)}></div>;
}
