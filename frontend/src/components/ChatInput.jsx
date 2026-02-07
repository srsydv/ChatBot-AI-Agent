import { useState, useRef, useEffect } from 'react'

const ChatInput = ({ onSendMessage, isLoading, isAuthenticated }) => {
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading && isAuthenticated) {
      onSendMessage(input.trim())
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative flex items-end gap-2 sm:gap-3 bg-dark-sidebar border border-dark-border rounded-lg p-2 sm:p-3 focus-within:border-accent transition-colors">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isAuthenticated ? "Ask Merlin anything..." : "Please login to chat"}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-dark-text-secondary resize-none outline-none overflow-hidden text-base min-h-[44px] py-2"
          style={{ maxHeight: '200px' }}
          disabled={isLoading || !isAuthenticated}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || !isAuthenticated}
          className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-accent hover:bg-accent-hover disabled:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </form>
  )
}

export default ChatInput
