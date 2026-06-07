import { useState, useEffect } from 'react';
import { Bell, Menu, ChevronDown, Download, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';
import type { Message } from '/shared/types';

interface HeaderProps {
  onMenuClick: () => void;
}

const roleNames: Record<string, string> = {
  merchant: '招商部',
  operations: '运营部',
  finance: '财务部',
  property: '物业部',
  executive: '总经理',
};

const pageTitles: Record<string, string> = {
  '/dashboard': '首页仪表盘',
  '/merchants/applications': '入驻申请管理',
  '/merchants/recommendations': '铺位智能推荐',
  '/merchants/contracts': '电子合同管理',
  '/operations/activities': '促销活动管理',
  '/operations/sales': '销售统计排行',
  '/finance/bills': '租金账单管理',
  '/finance/overdue': '逾期管理',
  '/property/tickets': '报修工单管理',
  '/property/dispatch': '智能派单中心',
  '/executive/heatmap': '热力图分析',
  '/executive/adjustment': '租金系数调整',
  '/system/passenger': '客流实时监控',
  '/system/points': '积分商城',
  '/system/reports': '运营报告',
  '/system/messages': '消息中心',
};

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, unreadMessages, unreadCount, markMessageRead, fetchUnreadMessages } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      fetchUnreadMessages();
    }, 60000);
    return () => clearInterval(timer);
  }, [fetchUnreadMessages]);

  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location.pathname.startsWith(path)) {
        return title;
      }
    }
    return '管理平台';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
    });
  };

  const handleMessageClick = async (message: Message) => {
    await markMessageRead(message.id);
    setShowNotifications(false);
    
    if (message.relatedId) {
      const routeMap: Record<string, string> = {
        application: '/merchants/applications',
        activity: '/operations/activities',
        finance: '/finance/bills',
        property: '/property/tickets',
        warning: '/system/passenger',
        report: '/system/reports',
        contract: '/merchants/contracts',
      };
      const route = routeMap[message.type];
      if (route) navigate(route);
    }
  };

  const downloadVoucher = (message: Message) => {
    const content = `
凭证编号: ${message.id}
消息类型: ${message.type}
标题: ${message.title}
内容: ${message.content}
发送时间: ${message.createdAt}
收件人: ${message.recipientName}
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `凭证_${message.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMessageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      application: 'bg-blue-100 text-blue-700',
      activity: 'bg-green-100 text-green-700',
      finance: 'bg-yellow-100 text-yellow-700',
      property: 'bg-purple-100 text-purple-700',
      warning: 'bg-red-100 text-red-700',
      report: 'bg-indigo-100 text-indigo-700',
      contract: 'bg-gold-100 text-gold-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold text-dark-800">{getPageTitle()}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-gold-50 rounded-full">
            <span className="text-sm font-medium text-primary-700">
              {user ? roleNames[user.role] : ''}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group"
            >
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-primary-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-down z-50">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-transparent">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-dark-800">消息通知</h3>
                    <span className="text-xs text-gray-500">{unreadCount}条未读</span>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {unreadMessages.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无新消息</p>
                    </div>
                  ) : (
                    unreadMessages.slice(0, 5).map((message) => (
                      <div
                        key={message.id}
                        className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleMessageClick(message)}
                      >
                        <div className="flex items-start gap-3">
                          <span className={cn('status-badge flex-shrink-0', getMessageTypeColor(message.type))}>
                            {message.type}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-dark-800 truncate">{message.title}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{message.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {new Date(message.createdAt).toLocaleString('zh-CN')}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadVoucher(message);
                                }}
                                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                              >
                                <Download className="w-3 h-3" />
                                下载凭证
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/system/messages');
                    }}
                    className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    查看全部消息
                  </button>
                </div>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-primary-200"
              />
              <div className="hidden md:block">
                <p className="font-medium text-dark-800">{user.name}</p>
                <p className="text-xs text-gray-500">在线</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
