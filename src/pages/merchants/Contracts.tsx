import { useState, useEffect } from 'react';
import {
  FileText, Download, Eye, Clock, CheckCircle, XCircle,
  Calendar, DollarSign, Percent, Building2, User, Phone,
  Plus, X, Edit3, Send, Printer, MapPin
} from 'lucide-react';
import { api } from '../../services/api';
import type { Contract, Application } from '/shared/types';
import { cn } from '../../lib/utils';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-700', icon: Edit3 },
  signed: { label: '已签署', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  terminated: { label: '已终止', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const rentModeLabels: Record<string, string> = {
  fixed: '固定租金',
  percentage: '扣点模式',
  mixed: '保底+扣点',
};

export function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    applicationId: '',
    shopId: '',
    shopNumber: '',
    rentMode: 'fixed' as 'fixed' | 'percentage' | 'mixed',
    rentFreeMonths: 0,
    fixedRentAmount: 0,
    percentageRate: 8,
    contractTermMonths: 36,
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contractsData, appsData] = await Promise.all([
        api.getContracts(),
        api.getApplications('approved'),
      ]);
      setContracts(contractsData);
      setApplications(appsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (contract: Contract) => {
    try {
      await api.signContract(contract.id);
      fetchData();
      setShowDetail(false);
      setSelectedContract(null);
    } catch (error) {
      console.error('Failed to sign contract:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await api.createContract(formData);
      fetchData();
      setShowCreate(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create contract:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      applicationId: '',
      shopId: '',
      shopNumber: '',
      rentMode: 'fixed',
      rentFreeMonths: 0,
      fixedRentAmount: 0,
      percentageRate: 8,
      contractTermMonths: 36,
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  const downloadContract = (contract: Contract) => {
    const content = `
商业综合体商铺租赁合同

合同编号：${contract.id}
签订日期：${contract.signedAt || '待签署'}

甲方（出租方）：商业综合体运营管理有限公司
乙方（承租方）：${contract.brandName}

一、租赁标的
1.1 甲方将位于 ${contract.shopNumber} 的商铺出租给乙方使用。
1.2 租赁期限：自 ${contract.startDate} 起至 ${contract.endDate} 止，共计 ${contract.contractTermMonths} 个月。

二、租金及支付方式
2.1 租金模式：${rentModeLabels[contract.rentMode]}
2.2 免租期：${contract.rentFreeMonths} 个月（自起租日起计算）
${contract.rentMode === 'fixed' || contract.rentMode === 'mixed' ? `2.3 固定租金：每月人民币 ${contract.fixedRentAmount.toLocaleString()} 元` : ''}
${contract.rentMode === 'percentage' || contract.rentMode === 'mixed' ? `2.4 扣点比例：${contract.percentageRate}% 营业额抽成` : ''}

三、双方权利与义务
...（合同正文内容省略）

四、违约责任
...（合同正文内容省略）

五、争议解决
...（合同正文内容省略）

甲方（盖章）：                    乙方（盖章）：
法定代表人（签字）：              法定代表人（签字）：
日期：                            日期：
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `合同_${contract.brandName}_${contract.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateEndDate = () => {
    const start = new Date(formData.startDate);
    start.setMonth(start.getMonth() + formData.contractTermMonths);
    return start.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">电子合同管理</h1>
          <p className="text-gray-500">生成和管理品牌入驻电子合同，支持免租期设置和多种租金模式</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建合同
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = contracts.filter(c => c.status === key).length;
          return (
            <div key={key} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{config.label}合同</p>
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
              <div key={i} className="skeleton h-24 w-full rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">合同编号</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">品牌</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">铺位</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">租金模式</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">合同期限</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">免租期</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">状态</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无合同记录</p>
                    </td>
                  </tr>
                ) : (
                  contracts.map(contract => {
                    const config = statusConfig[contract.status];
                    const StatusIcon = config.icon;
                    return (
                      <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{contract.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-lg">
                              🏢
                            </div>
                            <p className="font-semibold text-gray-800">{contract.brandName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{contract.shopNumber}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-md">
                            {rentModeLabels[contract.rentMode]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-800">{contract.contractTermMonths}个月</p>
                          <p className="text-xs text-gray-500">
                            {contract.startDate} ~ {contract.endDate}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gold-600">{contract.rentFreeMonths}个月</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('status-badge flex items-center gap-1', config.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedContract(contract);
                                setShowDetail(true);
                              }}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadContract(contract)}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="下载合同"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {contract.status === 'draft' && (
                              <button
                                onClick={() => handleSign(contract)}
                                className="btn-gold !px-3 !py-1.5 !text-sm flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                签署
                              </button>
                            )}
                          </div>
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

      {showDetail && selectedContract && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">合同详情预览</h3>
                <p className="text-sm text-gray-500">合同编号：{selectedContract.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadContract(selectedContract)}
                  className="btn-secondary !px-4 !py-2 !text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载
                </button>
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] bg-gradient-to-br from-gray-50 to-white">
              <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-display font-bold text-gray-800">商业综合体商铺租赁合同</h1>
                  <p className="text-gray-500 mt-2">Contract No. {selectedContract.id}</p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-3">一、租赁双方</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">甲方（出租方）</p>
                        <p className="font-medium">商业综合体运营管理有限公司</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">乙方（承租方）</p>
                        <p className="font-medium">{selectedContract.brandName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-3">二、租赁标的</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">商铺编号</p>
                        <p className="font-medium flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-primary-600" />
                          {selectedContract.shopNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">租赁期限</p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-primary-600" />
                          {selectedContract.contractTermMonths}个月
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">租期</p>
                        <p className="font-medium">{selectedContract.startDate} 至 {selectedContract.endDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-primary-50 to-gold-50 rounded-xl border border-primary-100">
                    <h4 className="font-semibold text-gray-800 mb-3">三、租金条款</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-600">租金模式</span>
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                          {rentModeLabels[selectedContract.rentMode]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-gray-600">免租期</span>
                        <span className="font-semibold text-gold-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedContract.rentFreeMonths}个月
                        </span>
                      </div>
                      {(selectedContract.rentMode === 'fixed' || selectedContract.rentMode === 'mixed') && (
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <span className="text-gray-600">固定月租金</span>
                          <span className="font-semibold text-gray-800 flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            ¥{selectedContract.fixedRentAmount.toLocaleString()}/月
                          </span>
                        </div>
                      )}
                      {(selectedContract.rentMode === 'percentage' || selectedContract.rentMode === 'mixed') && (
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <span className="text-gray-600">扣点比例</span>
                          <span className="font-semibold text-gray-800 flex items-center gap-1">
                            <Percent className="w-4 h-4 text-blue-600" />
                            {selectedContract.percentageRate}% 营业额
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="w-16 h-0.5 bg-gray-300 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">甲方签字盖章</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-0.5 bg-gray-300 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">乙方签字盖章</p>
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
              <button
                onClick={() => downloadContract(selectedContract)}
                className="btn-secondary !px-5 !py-2.5 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                打印
              </button>
              {selectedContract.status === 'draft' && (
                <button
                  onClick={() => handleSign(selectedContract)}
                  className="btn-gold !px-5 !py-2.5 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  确认签署
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">创建新合同</h3>
              <button
                onClick={() => { setShowCreate(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  关联入驻申请
                </label>
                <select
                  value={formData.applicationId}
                  onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                  className="input-field"
                >
                  <option value="">请选择已通过的入驻申请</option>
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.brandName} - {app.brandType} (需求 {app.requiredArea}㎡)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    铺位编号
                  </label>
                  <input
                    type="text"
                    value={formData.shopNumber}
                    onChange={(e) => setFormData({ ...formData, shopNumber: e.target.value })}
                    placeholder="如：L1-A01"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    合同期限（月）
                  </label>
                  <input
                    type="number"
                    value={formData.contractTermMonths}
                    onChange={(e) => setFormData({ ...formData, contractTermMonths: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    起租日期
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
                    到期日期
                  </label>
                  <input
                    type="text"
                    value={calculateEndDate()}
                    readOnly
                    className="input-field bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  租金模式
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(rentModeLabels).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, rentMode: key as any })}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-center',
                        formData.rentMode === key
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <p className={cn('font-medium', formData.rentMode === key ? 'text-primary-700' : 'text-gray-700')}>
                        {label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    免租期（月）
                  </label>
                  <input
                    type="number"
                    value={formData.rentFreeMonths}
                    onChange={(e) => setFormData({ ...formData, rentFreeMonths: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="12"
                    className="input-field"
                  />
                </div>
                {(formData.rentMode === 'percentage' || formData.rentMode === 'mixed') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      扣点比例（%）
                    </label>
                    <input
                      type="number"
                      value={formData.percentageRate}
                      onChange={(e) => setFormData({ ...formData, percentageRate: parseInt(e.target.value) || 0 })}
                      min="1"
                      max="30"
                      className="input-field"
                    />
                  </div>
                )}
                {(formData.rentMode === 'fixed' || formData.rentMode === 'mixed') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      固定月租金（元）
                    </label>
                    <input
                      type="number"
                      value={formData.fixedRentAmount}
                      onChange={(e) => setFormData({ ...formData, fixedRentAmount: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="input-field"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => { setShowCreate(false); resetForm(); }}
                className="btn-secondary !px-5 !py-2.5"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                className="btn-primary !px-5 !py-2.5 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                生成合同
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
