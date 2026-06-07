import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Building2, Users, TrendingUp, Wallet, Wrench, Crown, Eye, EyeOff, Lock } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { UserRole } from '/shared/types';
import { cn } from '../lib/utils';

const roles: { id: UserRole; name: string; icon: any; description: string; color: string }[] = [
  { id: 'merchant', name: '招商部', icon: Building2, description: '入驻审核、铺位推荐、合同管理', color: 'from-blue-500 to-blue-600' },
  { id: 'operations', name: '运营部', icon: TrendingUp, description: '活动策划、销售分析、客流监控', color: 'from-green-500 to-green-600' },
  { id: 'finance', name: '财务部', icon: Wallet, description: '租金账单、滞纳金、门禁管理', color: 'from-yellow-500 to-yellow-600' },
  { id: 'property', name: '物业部', icon: Wrench, description: '报修工单、智能派单、维修评价', color: 'from-purple-500 to-purple-600' },
  { id: 'executive', name: '总经理', icon: Crown, description: '数据大屏、热力分析、战略决策', color: 'from-gold-500 to-gold-600' },
];

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAppStore();
  
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    if (selectedRole) {
      setUsername(selectedRole);
      setPassword('123456');
    }
  }, [selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('请选择登录角色');
      return;
    }

    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    try {
      await login(selectedRole, username, password);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || '登录失败，请检查用户名和密码');
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-dark-900">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-gold-500/10 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-tl from-primary-500/10 to-transparent"></div>
        
        <div className="absolute top-20 left-20 w-72 h-72 bg-gold-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16">
          <div className="max-w-lg">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-2xl animate-glow">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-white">MallOS</h1>
                <p className="text-gold-400 font-medium">智慧商业运营平台</p>
              </div>
            </div>
            
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              大型商业综合体
              <span className="block text-gradient mt-2">全场景运营管理</span>
            </h2>
            
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              整合招商、运营、财务、物业、决策五大核心模块，
              实现从品牌入驻到数据分析的全流程数字化管理，
              提升运营效率，增强决策精准度。
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '智能铺位推荐', value: 'AI驱动' },
                { label: '自动租金计算', value: '精准高效' },
                { label: '实时客流监控', value: '安全预警' },
                { label: '全角色消息推送', value: '实时协同' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-gold-400 font-semibold">{item.value}</p>
                  <p className="text-white/60 text-sm">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-display font-bold text-dark-800">MallOS</h1>
                <p className="text-gray-500">智慧商业运营平台</p>
              </div>

              <h3 className="text-2xl font-display font-bold text-dark-800 mb-6 text-center">
                欢迎登录
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Users className="w-4 h-4 inline mr-1" />
                  选择您的角色
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left',
                          isSelected
                            ? `border-primary-600 bg-primary-50 shadow-lg`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        )}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
                          isSelected ? role.color : 'from-gray-200 to-gray-300'
                        )}>
                          <Icon className={cn('w-6 h-6', isSelected ? 'text-white' : 'text-gray-500')} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('font-semibold', isSelected ? 'text-primary-700' : 'text-gray-800')}>
                            {role.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{role.description}</p>
                        </div>
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                        )}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      用户名
                    </label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-field pl-12"
                        placeholder="请输入用户名"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密码
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field pl-12 pr-12"
                        placeholder="请输入密码"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">记住密码</span>
                  </label>
                  <button type="button" className="text-sm text-primary-600 hover:text-primary-700">
                    忘记密码?
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'w-full mt-6 py-3.5 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl',
                    'hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl',
                    'transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed',
                    'flex items-center justify-center gap-2'
                  )}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      登录中...
                    </>
                  ) : (
                    '登录系统'
                  )}
                </button>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 text-center">
                    💡 演示账号：选择角色后自动填充，密码均为 <span className="font-mono font-bold">123456</span>
                  </p>
                </div>
              </form>
            </div>

            <p className="text-center text-white/50 text-sm mt-6">
              © 2024 MallOS 智慧商业运营平台 · 全场景解决方案
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
