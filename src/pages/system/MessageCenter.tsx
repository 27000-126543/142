import { useState, useEffect } from 'react';
import {
  Bell, CheckCircle, Download, Trash2, Filter,
  Search, X, FileText, Clock, AlertTriangle,
  Send, Gift, CreditCard, Wrench, Users,
  ChevronDown, Settings,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import type { Message } from '/shared/types';
import { cn } from '../../lib/utils';

const typeConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  application: { label: '入驻审批', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: FileText },
  activity: { label: '活动通知', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Gift },
  rent: { label: '租金逾期', color: 'text-red-700', bgColor: 'bg-red-100', icon: CreditCard },
  repair: { label: '报修派单', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: Wrench },
  warning: { label: '预警通知', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: AlertTriangle },
  points: { label: '积分变动', color: 'text-green-700', bgColor: 'bg-green-100', icon: Gift },
  system: { label: '系统通知', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: Bell },
  report: { label: '运营报告', color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: FileText },
};

export function MessageCenter() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [typeFilter, readFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const isRead = readFilter === 'read' ? true : readFilter === 'unread' ? false : undefined;
      const data = await api.getMessages(isRead, typeFilter === 'all' ? undefined : typeFilter);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.isRead).length;

  const handleMarkAsRead = async (messageId: string) => {
    try {
      setActionLoading(messageId);
      await api.markMessageRead(messageId);
      fetchMessages();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading('all');
      await api.markAllMessagesRead();
      fetchMessages();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadVoucher = async (messageId: string) => {
    try {
      setActionLoading(messageId);
      await api.downloadVoucher(messageId);
    } catch (error) {
      console.error('Failed to download voucher:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      setActionLoading(messageId);
      await api.deleteMessage(messageId);
      fetchMessages();
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const openDetail = (message: Message) => {
    setSelectedMessage(message);
    setShowDetail(true);
    if (!message.isRead) {
      handleMarkAsRead(message.id);
    }
  };

  const getTimeText = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const typeStats = Object.keys(typeConfig).map(type => ({
    type,
    count: messages.filter(m => m.type === type).length,
    unread: messages.filter(m => m.type === type && !m.isRead).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary-600" />
            消息中心
          </h1>
          <p className="text-gray-500">所有关键事件实时消息提醒，支持查看详情和下载凭证</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={actionLoading === 'all'}
              className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              全部已读 ({unreadCount})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <button
          onClick={() => setTypeFilter('all')}
          className={cn(
            'p-3 rounded-xl border-2 transition-all text-center',
            typeFilter === 'all'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          )}
        >
          <Bell className={cn('w-5 h-5 mx-auto mb-1', typeFilter === 'all' ? 'text-primary-600' : 'text-gray-400')} />
          <p className={cn('text-xs font-medium', typeFilter === 'all' ? 'text-primary-700' : 'text-gray-600')}>全部</p>
          <p className="text-xl font-bold text-gray-800">{messages.length}</p>
        </button>
        {typeStats.map(({ type, count, unread }) => {
          const config = typeConfig[type];
          const TypeIcon = config.icon;
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                'p-3 rounded-xl border-2 transition-all text-center relative',
                typeFilter === type
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
            >
              {unread > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
              <TypeIcon className={cn('w-5 h-5 mx-auto mb-1', typeFilter === type ? 'text-primary-600' : 'text-gray-400')} />
              <p className={cn('text-xs font-medium truncate', typeFilter === type ? 'text-primary-700' : 'text-gray-600')}>
                {config.label}
              </p>
              <p className="text-xl font-bold text-gray-800">{count}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索消息标题或内容..."
            className="input-field pl-12"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="input-field w-auto min-w-[140px]"
          >
            <option value="all">全部消息</option>
            <option value="unread">未读消息</option>
            <option value="read">已读消息</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="skeleton h-20 w-full rounded-lg"></div>
                ))}
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">暂无消息</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredMessages.map(message => {
                  const config = typeConfig[message.type] || typeConfig.system;
                  const TypeIcon = config.icon;

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        'p-5 transition-all cursor-pointer hover:bg-gray-50',
                        !message.isRead && 'bg-blue-50/50'
                      )}
                      onClick={() => openDetail(message)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                          config.bgColor
                        )}>
                          <TypeIcon className={cn('w-6 h-6', config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {!message.isRead && (
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                              )}
                              <h4 className={cn(
                                'font-semibold truncate',
                                message.isRead ? 'text-gray-600' : 'text-gray-900'
                              )}>
                                {message.title}
                              </h4>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                              {getTimeText(message.createdAt)}
                            </span>
                          </div>
                          <p className={cn(
                            'text-sm mt-1 line-clamp-2',
                            message.isRead ? 'text-gray-500' : 'text-gray-700'
                          )}>
                            {message.content}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={cn(
                              'status-badge text-xs',
                              config.bgColor,
                              config.color
                            )}>
                              {config.label}
                            </span>
                            <span className="text-xs text-gray-400">
                              发送给：{message.recipientName}
                            </span>
                          </div>
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
            <h3 className="section-title">消息统计</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">消息总数</p>
                    <p className="font-bold text-xl text-gray-800">{messages.length}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">未读消息</p>
                    <p className="font-bold text-xl text-red-600">{unreadCount}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">已读消息</p>
                    <p className="font-bold text-xl text-green-600">{messages.length - unreadCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">快捷操作</h3>
            <div className="space-y-2">
              <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">全部标记为已读</span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
              <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors flex items-center gap-3">
                <Download className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">批量下载凭证</span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
              <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors flex items-center gap-3">
                <Settings className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">消息通知设置</span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              消息推送规则
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-white/10 rounded-lg">
                <p className="font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  入驻审批
                </p>
                <p className="text-white/70 text-xs mt-1">品牌方提交申请、审核结果通知</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                <p className="font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  租金逾期
                </p>
                <p className="text-white/70 text-xs mt-1">逾期提醒、锁定通知、缴清通知</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                <p className="font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  预警通知
                </p>
                <p className="text-white/70 text-xs mt-1">客流超阈值、设备故障预警</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDetail && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  typeConfig[selectedMessage.type]?.bgColor || 'bg-gray-100'
                )}>
                  {(() => {
                    const Icon = typeConfig[selectedMessage.type]?.icon || Bell;
                    return <Icon className={cn('w-6 h-6', typeConfig[selectedMessage.type]?.color || 'text-gray-600')} />;
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedMessage.title}</h3>
                  <p className="text-sm text-gray-500">
                    {typeConfig[selectedMessage.type]?.label} | {new Date(selectedMessage.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-base">{selectedMessage.content}</p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">接收人员</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {selectedMessage.recipientName}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                消息编号：{selectedMessage.id}
              </div>
              <div className="flex items-center gap-2">
                {!selectedMessage.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(selectedMessage.id)}
                    className="btn-secondary !px-4 !py-2 flex items-center gap-2 !text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    标记已读
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  disabled={actionLoading === selectedMessage.id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
