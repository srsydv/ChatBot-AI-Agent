import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import AuthModal from './components/AuthModal'
import { chatService } from './services/chatService'
import { getApiUrl } from './config/api'

const AppContent = () => {
  const [messages, setMessages] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { getAuthHeaders, isAuthenticated, token } = useAuth()

  // Create a new chat when starting a new conversation (logged in) or just clear (guest)
  const handleNewChat = async () => {
    if (!isAuthenticated) {
      setCurrentChatId(null)
      setMessages([])
      return
    }
    try {
      const result = await chatService.createChat('New Chat', token)
      setCurrentChatId(result.chat.id)
      setMessages([])
      if (window.refreshChatHistory) {
        window.refreshChatHistory()
      }
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  // Load a chat from history
  const handleLoadChat = async (chatId) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }

    try {
      setIsLoading(true)
      const result = await chatService.getChat(chatId, token)
      setCurrentChatId(result.chat.id)
      setMessages(result.messages)
    } catch (error) {
      console.error('Error loading chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Clear current chat without creating a new one
  const handleClearChat = () => {
    setCurrentChatId(null)
    setMessages([])
  }

  const handleSendMessage = async (message) => {
    let chatId = currentChatId
    if (isAuthenticated && !chatId) {
      try {
        const result = await chatService.createChat('New Chat', token)
        chatId = result.chat.id
        setCurrentChatId(chatId)
      } catch (error) {
        console.error('Error creating chat:', error)
        return
      }
    }

    const userMessage = { role: 'user', content: message }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          ...(chatId && { chatId }),
          conversationHistory: messages,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          setAuthModalOpen(true)
          throw new Error('Please login to continue')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      const aiMessage = {
        role: data.role || 'assistant',
        content: data.content,
      }
      setMessages((prev) => {
        const updated = [...prev, aiMessage]
        if (isAuthenticated && updated.length === 2 && chatId) {
          const firstUserMessage = updated.find((m) => m.role === 'user')
          if (firstUserMessage) {
            const title = firstUserMessage.content.slice(0, 50)
            chatService.updateChatTitle(chatId, title, token).catch(console.error)
          }
        }
        return updated
      })

      if (window.refreshChatHistory) {
        window.refreshChatHistory()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        role: 'assistant',
        content: error.message || 'Sorry, there was an error processing your message. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      {/* Mobile backdrop when sidebar is open */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
        />
      )}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={() => {
          handleNewChat()
          setSidebarOpen(false)
        }}
        onAuthModalOpen={() => setAuthModalOpen(true)}
        onLoadChat={(chatId) => {
          handleLoadChat(chatId)
          setSidebarOpen(false)
        }}
        onClearChat={handleClearChat}
        currentChatId={currentChatId}
      />
      <ChatArea
        onMenuClick={() => setSidebarOpen(true)}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
      />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
