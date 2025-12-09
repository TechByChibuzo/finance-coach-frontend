export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="card text-center py-12">
      <span className="text-6xl mb-4 block">⚠️</span>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-500 mb-6">
        {message || 'We encountered an error loading your data'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary"
        >
          Try Again
        </button>
      )}
    </div>
  );
}