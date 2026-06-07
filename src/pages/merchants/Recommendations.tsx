import { useState, useEffect } from 'react';
import {
  Search, MapPin, Star, ArrowRight, Check, Sparkles,
  Building2, TrendingUp, Layers, Target, Zap
} from 'lucide-react';
import { api } from '../../services/api';
import type { Application } from '/shared/types';
import { cn } from '../../lib/utils';

export function Recommendations() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [selectedRec, setSelectedRec] = useState<any>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getApplications('approved');
      setApplications(data);
      if (data.length > 0) {
        setSelectedApp(data[0]);
        fetchRecommendations(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (appId: string) => {
    try {
      setRecommendLoading(true);
      const data = await api.getRecommendations(appId);
      setRecommendations(data);
      setSelectedRec(data[0] || null);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleSelectApp = (app: Application) => {
    setSelectedApp(app);
    fetchRecommendations(app.id);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-600';
  };

  const floorColors: Record<number, string> = {
    1: 'from-blue-500 to-blue-600',
    2: 'from-green-500 to-emerald-600',
    3: 'from-purple-500 to-violet-600',
    4: 'from-orange-500 to-red-500',
    5: 'from-pink-500 to-rose-600',
    [-1]: 'from-gray-500 to-slate-600',
  };

  const floorNames: Record<number, string> = {
    1: 'L1 精品层',
    2: 'L2 时尚层',
    3: 'L3 休闲层',
    4: 'L4 餐饮层',
    5: 'L5 娱乐层',
    [-1]: 'B1 生活层',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">铺位智能推荐</h1>
        <p className="text-gray-500">基于业态定位和空置铺位，AI智能推荐最优楼层和区域组合</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="section-title flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-600" />
              待分配品牌
            </h3>
            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="skeleton h-16 w-full rounded-lg"></div>
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无已通过的申请</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleSelectApp(app)}
                    className={cn(
                      'w-full p-4 rounded-xl text-left transition-all',
                      selectedApp?.id === app.id
                        ? 'bg-gradient-to-r from-primary-50 to-gold-50 border-2 border-primary-500 shadow-md'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-xl">
                        🏢
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{app.brandName}</p>
                        <p className="text-xs text-gray-500">{app.brandType}</p>
                        <p className="text-xs text-primary-600 mt-1">
                          需求 {app.requiredArea}㎡
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedApp ? (
            <div className="space-y-6">
              <div className="glass-card p-6 bg-gradient-to-r from-primary-50 to-gold-50">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-3xl shadow-lg">
                      🏢
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-gray-800">
                        {selectedApp.brandName}
                      </h2>
                      <p className="text-gray-600">{selectedApp.brandType}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          需求面积：{selectedApp.requiredArea}㎡
                        </span>
                        {selectedApp.preferredFloor && (
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            首选楼层：{selectedApp.preferredFloor}楼
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full">
                    <Sparkles className="w-5 h-5 text-gold-500" />
                    <span className="font-medium text-gray-700">AI 智能推荐</span>
                  </div>
                </div>
              </div>

              {recommendLoading ? (
                <div className="card">
                  <div className="flex items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  </div>
                </div>
              ) : recommendations.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {recommendations.map((rec, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedRec(rec)}
                        className={cn(
                          'card cursor-pointer transition-all relative overflow-hidden',
                          selectedRec?.shopNumber === rec.shopNumber
                            ? 'ring-2 ring-primary-500 shadow-lg scale-[1.02]'
                            : 'hover:shadow-lg hover:-translate-y-1'
                        )}
                      >
                        {index === 0 && (
                          <div className="absolute top-0 right-0">
                            <div className="bg-gradient-to-l from-gold-500 to-yellow-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              最佳匹配
                            </div>
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-4">
                          <div className={cn('w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xl font-bold shadow-lg', floorColors[rec.floor])}>
                            {rec.floor === -1 ? 'B1' : `L${rec.floor}`}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">匹配度</p>
                            <p className={cn('text-2xl font-bold', getScoreColor(rec.score))}>
                              {rec.score}分
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-gray-500">推荐位置</p>
                          <p className="text-xl font-bold text-gray-800">{rec.shopNumber}</p>
                          <p className="text-sm text-gray-600">{floorNames[rec.floor]} · {rec.zone}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="p-2 bg-gray-50 rounded-lg text-center">
                            <p className="text-xs text-gray-500">铺位面积</p>
                            <p className="font-semibold text-gray-800">{rec.area}㎡</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-lg text-center">
                            <p className="text-xs text-gray-500">误差</p>
                            <p className={cn('font-semibold', Math.abs(rec.area - rec.requiredArea) <= 10 ? 'text-green-600' : 'text-yellow-600')}>
                              {rec.area - rec.requiredArea > 0 ? '+' : ''}{rec.area - rec.requiredArea}㎡
                            </p>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className={cn('h-2 rounded-full bg-gradient-to-r transition-all duration-1000', getScoreBg(rec.score))}
                            style={{ width: `${rec.score}%` }}
                          ></div>
                        </div>

                        <div className="p-3 bg-primary-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-gold-500" />
                            推荐理由
                          </p>
                          <p className="text-sm text-gray-700">{rec.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedRec && (
                    <div className="card border-2 border-primary-500 bg-gradient-to-br from-primary-50/50 to-white">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-500" />
                            已选择：{selectedRec.shopNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {floorNames[selectedRec.floor]} · {selectedRec.zone} · {selectedRec.area}㎡ · 匹配度 {selectedRec.score}分
                          </p>
                        </div>
                        <button className="btn-primary flex items-center gap-2">
                          <ArrowRight className="w-4 h-4" />
                          确认并生成合同
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="card text-center py-12 text-gray-400">
                  <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">暂无合适的铺位推荐</p>
                  <p className="text-sm">请稍后再试或调整筛选条件</p>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-20 text-gray-400">
              <Building2 className="w-20 h-20 mx-auto mb-4 opacity-50" />
              <p className="text-xl">请选择一个品牌查看铺位推荐</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="section-title flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          推荐算法说明
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: '业态匹配', desc: '根据品牌类型匹配对应楼层的业态定位，最高35分', icon: Target },
            { title: '面积匹配', desc: '铺位面积与需求面积的匹配度，最高40分', icon: Layers },
            { title: '楼层偏好', desc: '品牌方首选楼层匹配，最高30分', icon: MapPin },
            { title: '位置优势', desc: 'A区核心位置加分，最高15分', icon: Zap },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-gold-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
