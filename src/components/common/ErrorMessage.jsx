import { XCircle, AlertTriangle, WifiOff } from 'lucide-react';

export default function ErrorMessage({
  message,
  onRetry,
  type = 'error',
}) {
  const config = {
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
      textColor: 'text-red-800',
      title: 'Error',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-500',
      textColor: 'text-yellow-800',
      title: 'Warning',
    },
    network: {
      icon: WifiOff,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-800',
      title: 'Connection Error',
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor, title } = config[type];

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-6`}>
      <div className="flex items-start">
        <div className="shrink-0">
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>
          <p className={`text-sm ${textColor} mt-2`}>
            {message || 'Something went wrong. Please try again.'}
          </p>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className={`text-sm font-medium ${textColor} hover:underline focus:outline-none inline-flex items-center gap-1`}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
