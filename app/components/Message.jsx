export default function Message({ role, content }) {
  const isAssistant = role === 'assistant';
  
  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${isAssistant ? 
        'bg-white text-gray-800 shadow-sm' : 
        'bg-blue-600 text-white shadow-md'}`}
      >
        {content.split('\n').map((paragraph, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {paragraph}
          </p>
        ))}
        {isAssistant && content.includes('⚠️') && (
          <div className="mt-2 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-yellow-700">Important Notice</span>
          </div>
        )}
      </div>
    </div>
  );
}