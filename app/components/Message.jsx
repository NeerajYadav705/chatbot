// Message.jsx
export default function Message({ role, content }) {
  const isAssistant = role === 'assistant';
  
  const formatContent = (text) => {
    const paragraphs = text.split('\n');
    return paragraphs.map((paragraph, i) => {
      if (paragraph.trim() === '') return null;
      
      // Handle bullet points
      if (paragraph.startsWith('* ')) {
        return (
          <ul key={i} className="list-disc ml-5 my-1">
            <li>{formatText(paragraph.substring(2))}</li>
          </ul>
        );
      }
      
      // Handle bold text between **
      const formattedParagraph = formatText(paragraph);
      
      // Handle special notices
      if (paragraph.startsWith('**Disclaimer:**') || paragraph.startsWith('ℹ️ Note:')) {
        return (
          <p key={i} className="text-xs italic text-gray-500 mt-2">
            {formattedParagraph}
          </p>
        );
      }
      
      return (
        <p key={i} className={i > 0 ? 'mt-2' : ''}>
          {formattedParagraph}
        </p>
      );
    });
  };
  
  const formatText = (text) => {
    // Replace **bold** with strong tags
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => 
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };
  
  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} px-4`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isAssistant ? 
        'bg-gray-100 text-gray-900' : 
        'bg-blue-600 text-black'}`}
      >
        {formatContent(content)}
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