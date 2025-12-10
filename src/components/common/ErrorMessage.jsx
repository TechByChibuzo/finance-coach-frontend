import { motion } from 'framer-motion';
import { XCircleIcon, ExclamationTriangleIcon, WifiIcon } from '@heroicons/react/24/outline';

export default function ErrorMessage({ 
  message, 
  onRetry, 
  type = 'error' // 'error' | 'warning' | 'network'
}) {
  // Configuration for different error types
  const config = {
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
      textColor: 'text-red-800',
      title: 'Error',
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-500',
      textColor: 'text-yellow-800',
      title: 'Warning',
    },
    network: {
      icon: WifiIcon,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-800',
      title: 'Connection Error',
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor, title } = config[type];

  return (
    <motion.div
      className={`rounded-lg border ${borderColor} ${bgColor} p-6`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${textColor}`}>
            {title}
          </h3>
          <p className={`text-sm ${textColor} mt-2`}>
            {message || 'Something went wrong. Please try again.'}
          </p>
          
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className={`text-sm font-medium ${textColor} hover:underline focus:outline-none inline-flex items-center`}
              >
                <span>Try again</span>
                <span className="ml-1">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}