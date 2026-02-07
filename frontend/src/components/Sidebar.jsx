import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chatService'

const Sidebar = ({ isOpen = false, onClose, onNewChat, onAuthModalOpen, onLoadChat, onClearChat, currentChatId }) => {
  const [activeItem, setActiveItem] = useState('new-chat')
  const [chats, setChats] = useState([])
  const [loadingChats, setLoadingChats] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, hasMore: false })
  const { user, logout, isAuthenticated, token } = useAuth()

  // Fetch chat history (first page, resets list)
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchChatHistory()
    } else {
      setChats([])
      setPagination({ page: 1, hasMore: false })
    }
  }, [isAuthenticated, token])

  // Expose refresh function globally so App can call it
  useEffect(() => {
    window.refreshChatHistory = fetchChatHistory
    return () => {
      delete window.refreshChatHistory
    }
  }, [isAuthenticated, token])

  const fetchChatHistory = async (options = {}) => {
    const { page = 1, append = false } = options
    try {
      if (append) setLoadingMore(true)
      else setLoadingChats(true)
      const result = await chatService.getChats(token, { page, limit: 50 })
      const newChats = result.chats || []
      setChats(prev => append ? [...prev, ...newChats] : newChats)
      setPagination({
        page: result.pagination?.page ?? page,
        hasMore: result.pagination?.hasMore ?? false,
      })
    } catch (error) {
      console.error('Error fetching chat history:', error)
    } finally {
      setLoadingChats(false)
      setLoadingMore(false)
    }
  }

  const loadMoreChats = () => {
    if (!pagination.hasMore || loadingMore) return
    fetchChatHistory({ page: pagination.page + 1, append: true })
  }

  const handleLogout = async () => {
    await logout()
    setChats([])
  }

  const handleChatClick = (chatId) => {
    setActiveItem(chatId)
    onLoadChat(chatId)
  }

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await chatService.deleteChat(chatId, token)
        if (currentChatId === chatId) {
          onClearChat()
        }
        fetchChatHistory()
      } catch (error) {
        console.error('Error deleting chat:', error)
      }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    
    // Reset time to midnight for accurate day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const chatDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    // Calculate difference in days
    const diffTime = today - chatDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const menuItems = [
    { id: 'new-chat', label: 'New Chat', icon: '💬' },
  ]

  return (
    <aside
      className={`
        fixed md:relative inset-y-0 left-0 z-40 w-[280px] md:w-64
        bg-dark-sidebar border-r border-dark-border flex flex-col h-full
        transform transition-transform duration-200 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Logo/Header */}
      <div className="p-4 md:p-6 border-b border-dark-border flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-white">Allo</h1>
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => onClose?.()}
          className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-dark-text-secondary hover:text-white hover:bg-dark-border rounded md:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (!item.disabled) {
                setActiveItem(item.id)
                if (item.id === 'new-chat') {
                  setActiveItem('new-chat')
                  onNewChat?.()
                }
              }
            }}
            disabled={item.disabled}
            className={`w-full px-4 md:px-6 py-3 min-h-[44px] text-left flex items-center gap-3 transition-colors ${
              activeItem === item.id
                ? 'bg-dark-border text-white'
                : 'text-dark-text-secondary hover:bg-dark-border hover:text-white'
            } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* History Section */}
      {isAuthenticated && (
        <div className="border-t border-dark-border p-3 md:p-4 flex-1 overflow-y-auto min-h-0">
          <h3 className="text-sm font-semibold text-dark-text-secondary mb-2 px-2">
            History
          </h3>
          {loadingChats ? (
            <div className="px-2 py-2 text-sm text-dark-text-secondary">Loading...</div>
          ) : chats.length === 0 ? (
            <div className="px-2 py-2 text-sm text-dark-text-secondary">No chat history</div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className={`group px-2 py-3 md:py-2 text-sm rounded cursor-pointer flex items-center justify-between min-h-[44px] ${
                    currentChatId === chat.id
                      ? 'bg-dark-border text-white'
                      : 'text-dark-text-secondary hover:bg-dark-border hover:text-white'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{chat.title}</div>
                    <div className="text-xs opacity-70 mt-0.5">
                      {formatDate(chat.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-dark-bg rounded transition-opacity"
                    title="Delete chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              {pagination.hasMore && (
                <button
                  type="button"
                  onClick={loadMoreChats}
                  disabled={loadingMore}
                  className="w-full px-2 py-2 text-sm text-dark-text-secondary hover:text-white hover:bg-dark-border rounded transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-dark-border p-3 md:p-4 shrink-0">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center gap-2 text-dark-text-secondary">
              <span>{user.name.charAt(0).toUpperCase()}</span>
              <span className="px-2 py-1 bg-dark-border rounded text-xs truncate max-w-[120px]">
                {user.name}
              </span>
            </div>
          </div>
        ) : null}
        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-3 py-3 md:py-2 min-h-[44px] bg-dark-border hover:bg-opacity-80 rounded text-sm text-dark-text-secondary hover:text-white transition-colors"
          >
            Logout
          </button>
        ) : (
          <button
            type="button"
            onClick={onAuthModalOpen}
            className="w-full px-3 py-3 md:py-2 min-h-[44px] bg-accent hover:bg-accent-hover rounded text-sm text-white font-medium transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </aside>
  )
}



export default Sidebar
