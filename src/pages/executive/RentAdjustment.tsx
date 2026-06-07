import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Calculator,
  RefreshCw, Download, Save, AlertTriangle,
  Building2, Percent, ArrowRight, CheckCircle2,
  Info, X, Gauge
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area, Cell
} from 'recharts';
import { api } from '../../services/api';
import type { FloorComparison } from '/shared/types';
import { cn } from '../../lib/utils';

export function RentAdjustment() {
  const [floorData, setFloorData] = useState<FloorComparison[]>([]);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [adjustmentMode, setAdjustmentMode] = useState<'floor' | 'type' | 'global'>('floor');
  const [globalAdjustment, setGlobalAdjustment] = useState(0);
  const [typeAdjustments, setTypeAdjustments] = useState<Record<string, number>>({
    retail: 0,
    food: 0,
    entertainment: 0,
    service: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const rentTypeLabels: Record<string, string> = {
    retail: '零售',
    food: '餐饮',
    entertainment: '娱乐',
    service: '服务业',
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.getComparison();
      setFloorData(data);
      
      const initialAdjustments: Record<string, number> = {};
      data.forEach(floor => {
        initialAdjustments[floor.floorId] = floor.rentAdjustment || 0;
      });
      setAdjustments(initialAdjustments);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFloorAdjustmentChange = (floorId: string, value: number) => {
    setAdjustments(prev => ({
      ...prev,
      [floorId]: value,
    }));
  };

  const handleApplyGlobal = () => {
    const newAdjustments: Record<string, number> = {};
    floorData.forEach(floor => {
      newAdjustments[floor.floorId] = globalAdjustment;
    });
    setAdjustments(newAdjustments);
  };

  const handleApplyPreview = async () => {
    setShowPreview(true);
  };

  const handleSaveAdjustments = async () => {
    try {
      setActionLoading(true);
      const adjustmentsArray = Object.entries(adjustments).map(([floorId, adjustment]) => ({
        floorId,
        adjustment,
        effectiveMonth: '2024-06',
      }));
      
      await api.setRentAdjustment(adjustmentsArray);
      setShowConfirm(false);
      setShowPreview(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save adjustments:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const calculateNewRent = (currentRent: number, adjustment: number) => {
    return currentRent * (1 + adjustment / 100);
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      return `¥${(value / 10000).toFixed(2)}万`;
    }
    return `¥${value.toLocaleString()}`;
  };

  const totalCurrentRent = floorData.reduce((sum, f) => sum + f.rentPerShop * f.shopCount, 0);
  const totalNewRent = floorData.reduce((sum, f) => {
    const adj = adjustments[f.floorId] || 0;
    return sum + calculateNewRent(f.rentPerShop * f.shopCount, adj);
  }, 0);
  const totalIncrease = totalNewRent - totalCurrentRent;
  const totalIncreasePercent = totalCurrentRent > 0 ? (totalIncrease / totalCurrentRent * 100).toFixed(2) : '0';

  const forecastData = [
    { month: '当前', 租金: totalCurrentRent / 10000 },
    { month: '调整后', 租金: totalNewRent / 10000 },
    { month: '1月后', 租金: totalNewRent / 10000 * 1.02 },
    { month: '3月后', 租金: totalNewRent / 10000 * 1.05 },
    { month: '6月后', 租金: totalNewRent / 10000 * 1.08 },
  ];

  const historyData = [
    { month: '1月', 租金: 180, 调整: 0 },
    { month: '2月', 租金: 185, 调整: 2.8 },
    { month: '3月', 租金: 192, 调整: 3.8 },
    { month: '4月', 租金: 198, 调整: 3.1 },
    { month: '5月', 租金: totalCurrentRent / 10000, 调整: 0 },
  ];

  const getAdjustmentColor = (value: number) => {
    if (value > 5) return 'text-red-600 bg-red-100';
    if (value > 0) return 'text-orange-600 bg-orange-100';
    if (value === 0) return 'text-gray-600 bg-gray-100';
    if (value >= -3) return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">租金调整管理</h1>
          <p className="text-gray-500">根据各楼层经营数据手动设置租金调整系数</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            重置
          </button>
          <button
            onClick={handleApplyPreview}
            className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm"
          >
            <Calculator className="w-4 h-4" />
            模拟预览
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="btn-primary !px-4 !py-2 flex items-center gap-2 !text-sm"
          >
            <Save className="w-4 h-4" />
            保存调整
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">当前月租金</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(totalCurrentRent)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">调整后月租金</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {formatCurrency(totalNewRent)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">预计月增收</p>
              <p className={cn(
                'text-2xl font-bold mt-1 flex items-center gap-1',
                totalIncrease >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {totalIncrease >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {formatCurrency(Math.abs(totalIncrease))}
              </p>
            </div>
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              totalIncrease >= 0
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : 'bg-gradient-to-br from-red-500 to-red-600'
            )}>
              {totalIncrease >= 0 ? (
                <TrendingUp className="w-6 h-6 text-white" />
              ) : (
                <TrendingDown className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">整体调整幅度</p>
              <p className={cn(
                'text-2xl font-bold mt-1',
                totalIncrease >= 0 ? 'text-orange-600' : 'text-blue-600'
              )}>
                {totalIncrease >= 0 ? '+' : ''}{totalIncreasePercent}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
              <Percent className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-gold-50 border border-primary-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-primary-800">调整说明</h4>
            <p className="text-sm text-primary-700 mt-1">
              租金调整系数将应用于下一账期的租金计算。正值表示租金上调，负值表示租金优惠/下调。
              请根据各楼层坪效、转化率、流失率等数据综合判断，谨慎设置。调整生效后系统将自动推送消息通知所有商户。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="section-title mb-0">楼层租金调整</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">调整模式：</span>
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  {([
                    { key: 'floor', label: '按楼层' },
                    { key: 'type', label: '按业态' },
                    { key: 'global', label: '全局调整' },
                  ] as const).map(mode => (
                    <button
                      key={mode.key}
                      onClick={() => setAdjustmentMode(mode.key)}
                      className={cn(
                        'px-4 py-1.5 text-sm font-medium transition-colors',
                        adjustmentMode === mode.key
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {adjustmentMode === 'global' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">全局调整系数：</label>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="range"
                      min="-10"
                      max="15"
                      step="0.5"
                      value={globalAdjustment}
                      onChange={(e) => setGlobalAdjustment(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <input
                      type="number"
                      value={globalAdjustment}
                      onChange={(e) => setGlobalAdjustment(parseFloat(e.target.value) || 0)}
                      className="input-field !w-20 !py-1.5 !text-sm text-center"
                    />
                    <span className="text-lg font-bold text-primary-600">%</span>
                  </div>
                  <button
                    onClick={handleApplyGlobal}
                    className="btn-primary !px-4 !py-2 !text-sm"
                  >
                    应用到全部楼层
                  </button>
                </div>
              </div>
            )}

            {adjustmentMode === 'type' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-4">按业态类型调整</p>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(rentTypeLabels).map(([type, label]) => (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-16">{label}：</span>
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="range"
                          min="-10"
                          max="15"
                          step="0.5"
                          value={typeAdjustments[type]}
                          onChange={(e) => setTypeAdjustments(prev => ({
                            ...prev,
                            [type]: parseFloat(e.target.value),
                          }))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                        <span className={cn(
                          'text-sm font-bold w-16 text-center py-0.5 rounded',
                          getAdjustmentColor(typeAdjustments[type])
                        )}>
                          {typeAdjustments[type] >= 0 ? '+' : ''}{typeAdjustments[type]}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="skeleton h-28 w-full rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {floorData.sort((a, b) => b.floorNumber - a.floorNumber).map(floor => {
                  const currentAdj = adjustments[floor.floorId] || 0;
                  const currentTotalRent = floor.rentPerShop * floor.shopCount;
                  const newTotalRent = calculateNewRent(currentTotalRent, currentAdj);
                  const rentIncrease = newTotalRent - currentTotalRent;

                  return (
                    <div
                      key={floor.floorId}
                      className="p-5 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-2xl">
                            F{floor.floorNumber}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg">{floor.floorName}</h4>
                            <p className="text-sm text-gray-500">
                              {floor.shopCount} 家店铺 | {floor.area}㎡ | 坪效 ¥{floor.efficiency.toLocaleString()}/㎡
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-sm">
                              <span className="text-gray-500">
                                当前租金：<span className="font-semibold text-gray-800">{formatCurrency(currentTotalRent)}</span>
                              </span>
                              <ArrowRight className="w-4 h-4 text-gray-300" />
                              <span className="text-gray-500">
                                调整后：<span className="font-semibold text-primary-600">{formatCurrency(newTotalRent)}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className={cn(
                              'text-sm font-medium px-2 py-0.5 rounded',
                              getAdjustmentColor(currentAdj)
                            )}>
                              {currentAdj >= 0 ? '+' : ''}{currentAdj}%
                            </span>
                            <p className={cn(
                              'text-sm font-semibold mt-1',
                              rentIncrease >= 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                              {rentIncrease >= 0 ? '+' : ''}{formatCurrency(rentIncrease)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleFloorAdjustmentChange(floor.floorId, currentAdj - 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600 transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={currentAdj}
                              onChange={(e) => handleFloorAdjustmentChange(floor.floorId, parseFloat(e.target.value) || 0)}
                              className="input-field !w-20 !py-2 !text-center !text-lg font-bold"
                              step="0.5"
                            />
                            <button
                              onClick={() => handleFloorAdjustmentChange(floor.floorId, currentAdj + 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <Gauge className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">建议调整范围：</span>
                          <span className="text-xs text-green-600 font-medium">-3% ~ +8%</span>
                          {currentAdj > 8 && (
                            <span className="text-xs text-red-500 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              调整幅度过高
                            </span>
                          )}
                          {currentAdj < -5 && (
                            <span className="text-xs text-orange-500 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              优惠幅度过大
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="section-title">租金趋势预测</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} unit="万" />
                  <Tooltip formatter={(value: number) => [`¥${value.toFixed(1)}万`, '月租金']} />
                  <Bar dataKey="租金" fill="#1e3a8a" radius={[4, 4, 0, 0]}>
                    {forecastData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#9ca3af' : index === 1 ? '#1e3a8a' : '#3b82f6'}
                        fillOpacity={index > 1 ? 0.6 - (index - 2) * 0.1 : 1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">历史调整记录</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="rentHistory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#9ca3af" fontSize={11} unit="万" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={11} unit="%" />
                  <Tooltip />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="租金"
                    stroke="#d4af37"
                    strokeWidth={2}
                    fill="url(#rentHistory)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="调整"
                    stroke="#1e3a8a"
                    strokeWidth={2}
                    dot={{ fill: '#1e3a8a', r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-gold-50 to-orange-50 border border-gold-200">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gold-600" />
              调整影响评估
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">涉及店铺数</span>
                <span className="font-semibold">{floorData.reduce((sum, f) => sum + f.shopCount, 0)} 家</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">预计年增收</span>
                <span className="font-semibold text-green-600">{formatCurrency(totalIncrease * 12)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">收缴率预估</span>
                <span className="font-semibold text-primary-600">
                  {totalIncrease > 0 ? '可能下降 2-3%' : '可能提升 1-2%'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">商户满意度</span>
                <span className={cn(
                  'font-semibold',
                  totalIncrease > 5 ? 'text-red-600' : totalIncrease > 0 ? 'text-orange-600' : 'text-green-600'
                )}>
                  {totalIncrease > 5 ? '可能显著下降' : totalIncrease > 0 ? '可能小幅下降' : '预计提升'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">租金调整预览</h3>
                <p className="text-sm text-gray-500">以下是调整后的租金明细预览</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">楼层</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">店铺数</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">当前租金</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">调整系数</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">调整后租金</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">增减额</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {floorData.sort((a, b) => b.floorNumber - a.floorNumber).map(floor => {
                      const adj = adjustments[floor.floorId] || 0;
                      const current = floor.rentPerShop * floor.shopCount;
                      const after = calculateNewRent(current, adj);
                      const diff = after - current;

                      return (
                        <tr key={floor.floorId} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary-600">F{floor.floorNumber}</span>
                              <span className="text-gray-800">{floor.floorName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{floor.shopCount} 家</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(current)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={cn(
                              'px-2 py-0.5 rounded font-semibold text-sm',
                              getAdjustmentColor(adj)
                            )}>
                              {adj >= 0 ? '+' : ''}{adj}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-primary-600">{formatCurrency(after)}</td>
                          <td className={cn(
                            'px-4 py-3 text-right font-semibold',
                            diff >= 0 ? 'text-green-600' : 'text-red-600'
                          )}>
                            {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100 font-semibold">
                      <td className="px-4 py-3" colSpan={2}>合计</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(totalCurrentRent)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'px-2 py-0.5 rounded font-semibold',
                          getAdjustmentColor(parseFloat(totalIncreasePercent))
                        )}>
                          {totalIncrease >= 0 ? '+' : ''}{totalIncreasePercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-primary-600">{formatCurrency(totalNewRent)}</td>
                      <td className={cn(
                        'px-4 py-3 text-right',
                        totalIncrease >= 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {totalIncrease >= 0 ? '+' : ''}{formatCurrency(totalIncrease)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                <p>调整生效日期：2024年6月1日</p>
                <p>系统将自动推送消息通知所有商户</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="btn-secondary !px-5 !py-2.5"
                >
                  返回修改
                </button>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="btn-primary !px-5 !py-2.5 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  确认调整
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">确认租金调整</h3>
              <p className="text-gray-600 mb-4">
                您即将对各楼层租金进行调整，调整将于 <span className="font-semibold">2024年6月1日</span> 生效。
                生效后系统将自动推送消息通知所有商户，此操作不可撤销。
              </p>
              <div className="p-4 bg-gray-50 rounded-xl text-left space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">整体调整幅度</span>
                  <span className={cn(
                    'font-semibold',
                    totalIncrease >= 0 ? 'text-orange-600' : 'text-blue-600'
                  )}>
                    {totalIncrease >= 0 ? '+' : ''}{totalIncreasePercent}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">预计月增收</span>
                  <span className="font-semibold text-green-600">{formatCurrency(totalIncrease)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">涉及商户</span>
                  <span className="font-semibold">{floorData.reduce((sum, f) => sum + f.shopCount, 0)} 家</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="btn-secondary flex-1 !py-3"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveAdjustments}
                  disabled={actionLoading}
                  className="btn-primary flex-1 !py-3 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  确认执行
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
