const QuickSuggestions = ({ onSuggestionClick }) => {
  const suggestions = [
    'whats going on with copper',
    'what about GDXU',
    'rsi is quite low so will it bounce back or not',
    'what about URAA',
    'what about copper - compare all of them in table format',
    'add in palladium and uuuu'
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            type="button"
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="text-left px-4 py-3 min-h-[44px] bg-dark-sidebar border border-dark-border rounded-lg hover:bg-dark-border hover:border-accent transition-all group text-sm sm:text-base"
          >
            <span className="text-dark-text-secondary group-hover:text-white transition-colors">
              • {suggestion}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickSuggestions
