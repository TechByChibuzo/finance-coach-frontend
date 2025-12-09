import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="card bg-red-50 border border-red-200">
      <div className="flex items-start space-x-3">
        <ExclamationCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}