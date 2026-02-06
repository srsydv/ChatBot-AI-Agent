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
  const { getAuthHeaders, isAuthenticated, token } = useAuth()

  // Create a new chat when starting a new conversation
  const handleNewChat = async () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }

    try {
      const result = await chatService.createChat('New Chat', token)
      setCurrentChatId(result.chat.id)
      setMessages([])
      // Refresh chat history in sidebar
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

  // Create a new chat automatically when user logs in and there's no current chat
  useEffect(() => {
    if (isAuthenticated && !currentChatId && messages.length === 0) {
      handleNewChat()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const handleSendMessage = async (message) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }

    // Create a new chat if one doesn't exist
    if (!currentChatId) {
      try {
        const result = await chatService.createChat('New Chat', token)
        setCurrentChatId(result.chat.id)
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
      const response = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          message,
          chatId: currentChatId,
          conversationHistory: messages, // Send conversation history for context
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
        content: data.content 
      }
      setMessages(prev => {
        const updated = [...prev, aiMessage]
        
        // Update chat title with first user message if it's still "New Chat"
        if (updated.length === 2 && currentChatId) {
          const firstUserMessage = updated.find(m => m.role === 'user')
          if (firstUserMessage) {
            const title = firstUserMessage.content.slice(0, 50)
            chatService.updateChatTitle(currentChatId, title, token).catch(console.error)
          }
        }
        
        return updated
      })
      
      // Refresh chat history after sending message
      if (window.refreshChatHistory) {
        window.refreshChatHistory()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = { 
        role: 'assistant', 
        content: error.message || 'Sorry, there was an error processing your message. Please try again.' 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar 
        onNewChat={handleNewChat} 
        onAuthModalOpen={() => setAuthModalOpen(true)}
        onLoadChat={handleLoadChat}
        onClearChat={handleClearChat}
        currentChatId={currentChatId}
      />
      <ChatArea 
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
