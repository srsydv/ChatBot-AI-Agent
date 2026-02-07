import { useState, useRef, useEffect } from 'react'
import ChatInput from './ChatInput'
import MessageList from './MessageList'
import QuickSuggestions from './QuickSuggestions'

const ChatArea = ({ onMenuClick, messages, onSendMessage, isLoading, isAuthenticated }) => {
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
      <div className="border-b border-dark-border px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0">
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenuClick}
          className="p-2 -ml-2 hover:bg-dark-border rounded transition-colors md:hidden"
        >
          <svg className="w-6 h-6 text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-lg md:text-xl font-semibold text-white flex-1 text-center md:text-left">ASK MERLIN</h2>
        <div className="w-10 md:w-0" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-8 min-h-0">
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
      <div className="border-t border-dark-border px-4 md:px-6 py-3 md:py-4 shrink-0">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  )
}

export default ChatArea
