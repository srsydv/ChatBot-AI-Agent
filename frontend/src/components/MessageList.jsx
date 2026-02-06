import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const MessageList = ({ messages, isLoading }) => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex gap-4 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">M</span>
            </div>
          )}
          <div
            className={`max-w-[80%] rounded-lg px-4 py-3 ${
              message.role === 'user'
                ? 'bg-dark-border text-white'
                : 'bg-dark-sidebar text-dark-text'
            }`}
          >
            {message.role === 'assistant' ? (
              <div className="markdown-content prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Headings
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-bold mt-4 mb-2 text-white" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-xl font-bold mt-3 mb-2 text-white" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-lg font-semibold mt-3 mb-2 text-white" {...props} />
                    ),
                    // Paragraphs
                    p: ({ node, ...props }) => (
                      <p className="mb-3 leading-relaxed" {...props} />
                    ),
                    // Lists
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-inside mb-3 space-y-1 ml-4" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal list-inside mb-3 space-y-1 ml-4" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="ml-2" {...props} />
                    ),
                    // Code blocks
                    code: ({ node, inline, ...props }) => {
                      const className = inline
                        ? 'bg-dark-bg px-1.5 py-0.5 rounded text-sm font-mono text-accent'
                        : 'block bg-dark-bg p-3 rounded-lg overflow-x-auto text-sm font-mono my-2'
                      return <code className={className} {...props} />
                    },
                    pre: ({ node, ...props }) => (
                      <pre className="bg-dark-bg p-3 rounded-lg overflow-x-auto my-2" {...props} />
                    ),
                    // Links
                    a: ({ node, ...props }) => (
                      <a
                        className="text-accent hover:text-accent-hover underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                    // Blockquotes
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-accent pl-4 italic my-3 text-dark-text-secondary"
                        {...props}
                      />
                    ),
                    // Tables
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-3">
                        <table className="min-w-full border-collapse border border-dark-border" {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="bg-dark-border" {...props} />
                    ),
                    tbody: ({ node, ...props }) => (
                      <tbody {...props} />
                    ),
                    tr: ({ node, ...props }) => (
                      <tr className="border-b border-dark-border" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="border border-dark-border px-4 py-2 text-left font-semibold" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border border-dark-border px-4 py-2" {...props} />
                    ),
                    // Horizontal rule
                    hr: ({ node, ...props }) => (
                      <hr className="border-dark-border my-4" {...props} />
                    ),
                    // Strong/Bold
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-white" {...props} />
                    ),
                    // Emphasis/Italic
                    em: ({ node, ...props }) => (
                      <em className="italic" {...props} />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center flex-shrink-0">
              <span className="text-dark-text-secondary text-sm">U</span>
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="flex gap-4 justify-start">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <div className="bg-dark-sidebar rounded-lg px-4 py-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-dark-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-dark-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-dark-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageList
