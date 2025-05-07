// Message.jsx
import { motion } from 'framer-motion';
import { FaUserMd, FaExclamationTriangle } from 'react-icons/fa';
import { MdWarning, MdCircle } from 'react-icons/md';
import { FiUser } from 'react-icons/fi';

export default function Message({ role, content }) {
  const isAssistant = role === 'assistant';
  
  const formatContent = (text) => {
    const paragraphs = text.split('\n');
    return paragraphs.map((paragraph, i) => {
      if (paragraph.trim() === '') return null;
      
      if (paragraph.startsWith('* ')) {
        return (
          <motion.ul 
            key={i} 
            className="list-disc ml-5 my-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <li>{formatText(paragraph.substring(2))}</li>
          </motion.ul>
        );
      }
      
      const formattedParagraph = formatText(paragraph);
      
      if (paragraph.startsWith('**Disclaimer:**') || paragraph.startsWith('ℹ️ Note:')) {
        return (
          <motion.p 
            key={i} 
            className="text-xs italic text-gray-500 mt-2 bg-yellow-50 p-2 rounded-lg flex items-start"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <MdWarning className="flex-shrink-0 mr-2 mt-0.5 text-yellow-500" />
            {formattedParagraph}
          </motion.p>
        );
      }
      
      return (
        <motion.p 
          key={i} 
          className={i > 0 ? 'mt-2' : ''}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {formattedParagraph}
        </motion.p>
      );
    });
  };
  
  const formatText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="text-blue-600">{part}</strong> : part
    );
  };
  
  return (
    <motion.div
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} px-4`}
      initial={{ opacity: 0, x: isAssistant ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 relative ${
        isAssistant 
          ? 'bg-white text-gray-900 shadow-lg border border-gray-100 ml-8'
          : 'bg-gradient-to-br from-blue-600 to-blue-500 text-white mr-8'}`}
      >
        <div className={`absolute top-2 ${isAssistant ? '-left-8' : '-right-8'}`}>
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
              isAssistant 
                ? 'bg-white border-2 border-gray-200' 
                : 'bg-blue-700'}`}
            whileHover={{ scale: 1.1 }}
          >
            {isAssistant ? (
              <FaUserMd className="text-gray-600 text-lg" />
            ) : (
              <FiUser className="text-white text-lg" />
            )}
          </motion.div>
        </div>
        
        {formatContent(content)}
        
        {isAssistant && content.includes('⚠️') && (
          <motion.div 
            className="mt-2 flex items-start bg-yellow-50 p-2 rounded-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <FaExclamationTriangle className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-yellow-700 font-medium">Important Notice</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}