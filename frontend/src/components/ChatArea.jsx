import { useState, useRef, useEffect } from 'react'
import ChatInput from './ChatInput'
import MessageList from './MessageList'
import QuickSuggestions from './QuickSuggestions'

const ChatArea = ({ messages, onSendMessage, isLoading, isAuthenticated }) => {
  const [showSuggestions, setShowSuggestions] = useState(messages.length === 0)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messages.length > 0) {
      setShowSuggestions(false)
    }
  }, [messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSuggestionClick = (suggestion) => {
    if (isAuthenticated) {
      onSendMessage(suggestion)
      setShowSuggestions(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-bg">
      {/* Header */}
      <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">ASK MERLIN</h2>
        <button className="p-2 hover:bg-dark-border rounded transition-colors">
          <svg className="w-5 h-5 text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {!isAuthenticated && messages.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center py-12">
            <p className="text-dark-text-secondary text-lg mb-4">
              Please login to start chatting with Merlin
            </p>
          </div>
        ) : messages.length === 0 && showSuggestions ? (
          <QuickSuggestions onSuggestionClick={handleSuggestionClick} />
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-dark-border px-6 py-4">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  )
}

export default ChatArea
